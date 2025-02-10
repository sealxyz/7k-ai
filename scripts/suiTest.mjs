import { QueryChain, OnChainCalls } from '@firefly-exchange/library-sui/dist/src/spot/index.js';
import { SuiClient as SuiClientV2 } from '@firefly-exchange/library-sui';
import { Ed25519Keypair } from '@firefly-exchange/library-sui';
import { BluefinClient, Networks } from '@bluefin-exchange/bluefin-v2-client';
import { mainnetConfig } from '../lib/bluefin/config.ts';
import { TickMath, ClmmPoolUtil } from "@firefly-exchange/library-sui/dist/src/spot/clmm/index.js";
import { BN } from "bn.js";
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const SPOT_API_URL = 'https://swap.api.sui-prod.bluefin.io/api/v1'
const suiClient = new SuiClientV2({ url: 'https://fullnode.mainnet.sui.io:443' });
const qc = new QueryChain(suiClient);
const bluefinClient = new BluefinClient(
    true,
    process.env.SUI_NETWORK === 'MAINNET' ? Networks.PRODUCTION_SUI : Networks.TESTNET_SUI,
    process.env.SUI_PRIVATE_SEEDPHRASE,
    'ED25519',
);

// Ensure Bluefin Client is initialized before proceeding
await bluefinClient.init();

async function fetchPoolTransactions(poolId, userAddress, type) {
    try {
      if (!poolId) {
        console.error("Error: Missing pool ID. A valid pool ID is required.");
        return;
      }
  
      const url = `https://swap.api.sui-prod.bluefin.io/api/v1/pool/transactions?pool=${poolId}&type=${type}`;
      console.log("Fetching pool transactions from:", url);
  
      const response = await fetch(url);
  
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`);
        return;
      }
  
      const json = await response.json();

      if (!Array.isArray(json)) {
        console.error("Error: Expected an array but got something else.");
        return;
      }

      console.log("Total transactions found:", json.length);
      if (json.length > 0) {
        console.log("First transaction:", json[0]);
      }

      const filteredTxs = json.filter(tx => tx.sender.toLowerCase() === userAddress.toLowerCase());
      return filteredTxs;
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
}

/**
 * Fetch user's LP positions
 */
async function getUserPositions(userAddress) {
    try {
        return await qc.getUserPositions(mainnetConfig.BasePackage, userAddress);
    } catch (error) {
        console.error(`❌ Error fetching user positions for ${userAddress}:`, error);
        return [];
    }
}

/**
 * Fetch detailed position info and calculate token amounts
 */
async function getCoinAmountsFromPosition(position, pool) {
    try {
        const lowerSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.lower_tick);
        const upperSqrtPrice = TickMath.tickIndexToSqrtPriceX64(position.upper_tick);
        
        const coinAmounts = ClmmPoolUtil.getCoinAmountFromLiquidity(
            new BN(position.liquidity),
            new BN(pool.current_sqrt_price),
            lowerSqrtPrice,
            upperSqrtPrice,
            false
        );

        // Scale coin amounts to token decimals
        const coinAAmountScaled = parseFloat(coinAmounts.coinA.toString()) / Math.pow(10, pool.coin_a.decimals);
        const coinBAmountScaled = parseFloat(coinAmounts.coinB.toString()) / Math.pow(10, pool.coin_b.decimals);

        return {
            coinA: coinAAmountScaled,
            coinB: coinBAmountScaled
        };
    } catch (error) {
        console.error(`❌ Error fetching coin amounts for position ${position.position_id}:`, error);
        return null;
    }
}

/**
 * Fetch token price from Bluefin Spot API
 */
async function getTokenPrice(token) {
    try {
        // if (token.toLowerCase() === "sui" || token === "0x2::sui::SUI") {
        //     console.log(`🔍 Fetching SUI price from CoinGecko...`);

        //     const response = await fetch(
        //         `${COINGECKO_API_URL}?ids=sui&vs_currencies=usd`,
        //         {
        //             method: "GET",
        //             headers: {
        //                 accept: "application/json",
        //                 "x-cg-demo-api-key": COINGECKO_API_KEY 
        //             }
        //         }
        //     );

        //     const data = await response.json();
        //     return data?.sui?.usd || "N/A"; // Return SUI price in USD
        // }

        console.log(`🔍 Fetching ${token} price from Bluefin API...`);

        let response;
        if (token === "0x2::sui::SUI") {
            response = await fetch(`${SPOT_API_URL}/tokens/price?tokens=0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI`);
        } else {
            response = await fetch(`${SPOT_API_URL}/tokens/price?tokens=${token}`);
        }

        const data = await response.json();

        return data?.[0]?.price || "N/A";
    } catch (error) {
        console.error(`❌ Error fetching token price:`, error);
        return "N/A";
    }
}

async function getAccruedFeeAndRewards(position, pool) {
    const privateKeyString = process.env.SUI_PRIVATE_KEY.replace(/^suiprivkey/, '');
    const privateKeyBytes = Buffer.from(privateKeyString, 'base64');
    const secretKey = privateKeyBytes.slice(0, 32);
    const keyPair = Ed25519Keypair.fromSecretKey(secretKey);

    let oc = new OnChainCalls(suiClient, mainnetConfig, { signer: keyPair });
    let resp = await oc.getAccruedFeeAndRewards(pool, position.position_id);

    let totalRewardsUSD = 0;
    let totalFeesUSD = 0;

    // Iterate over rewards and calculate cumulative sum in USD
    for (const reward of resp.rewards) {
        const amount = parseFloat(reward.coinAmount) / Math.pow(10, reward.coinDecimals); // Normalize amount
        const price = await getTokenPrice(reward.coinType); // Fetch token price in USD
        totalRewardsUSD += amount * price;
    }

    // Process Fees
    const feeA = parseFloat(resp.fee.coinA.toString()) / Math.pow(10, pool.coin_a.decimals); 
    const feeB = parseFloat(resp.fee.coinB.toString()) / Math.pow(10, pool.coin_b.decimals); 

    const priceA = await getTokenPrice(pool.coin_a.address);
    const priceB = await getTokenPrice(pool.coin_b.address);

    totalFeesUSD += feeA * priceA + feeB * priceB;

    return {
        "totalRewardsUSD": totalRewardsUSD,
        "totalFeesUSD": totalFeesUSD
    };
}

async function calculateInitialPrice(position, userAddress, pool) {
    try {
        // Fetch all add liquidity transactions for this position
        const addLiquidityTransactions = await fetchPoolTransactions(position.pool_id, userAddress, "AddLiquidity");

        if (!addLiquidityTransactions || addLiquidityTransactions.length === 0) {
            console.log("❌ No AddLiquidity transactions found for this position.");
            return null;
        }

        const tx = addLiquidityTransactions[0]; // Get first transaction
        if (!tx.tokens || tx.tokens.length !== 2) {
            console.error("❌ Unexpected token structure in transaction:", tx);
            return null;
        }

        // Extract token details
        const tokenA = tx.tokens[0];
        const tokenB = tx.tokens[1];

        // Scale token amounts using decimals
        const amountA = parseFloat(tokenA.amount) / Math.pow(10, pool.coin_a.decimals);
        const amountB = parseFloat(tokenB.amount) / Math.pow(10, pool.coin_b.decimals);

        // Return price of token A in terms of token B
        return amountB / amountA;

    } catch (error) {
        console.error(`❌ Error calculating initial price for position ${position.position_id}:`, error);
        return null;
    }
}

function calculateImpermanentLoss(initialPrice, currentPrice) {
    if (initialPrice <= 0 || currentPrice <= 0) {
        console.error("❌ Prices must be greater than 0");
        return null;
    }

    // Step 1: Compute Price Ratio
    const P = currentPrice / initialPrice;

    // Step 2: Compute Impermanent Loss
    const IL = 1 - (2 * Math.sqrt(P)) / (1 + P);

    return IL;
}

/**
 * Main execution function
 */
const main = async () => {
    try {
        const userAddress = process.env.SUI_WALLET_ADDRESS;
        if (!userAddress) {
            throw new Error('❌ No user address provided!');
        }

        console.log(`🔍 Fetching LP positions for user: ${userAddress}`);

        // Fetch LP positions
        let positions = await getUserPositions(userAddress);

        if (!positions || positions.length === 0) {
            console.log(`No LP positions found for ${userAddress}`);
        } else {
            const positionsWithDetails = await Promise.all(
                positions.map(async (position) => {
                    const pool = await qc.getPool(position.pool_id);
                    // Token addresses
                    const coinA = pool.coin_a.address;
                    const coinB = pool.coin_b.address;
                  
                    // Get coin amounts from position
                    const coinAmounts = await getCoinAmountsFromPosition(position, pool);      
                            
                    // Fetch Prices using token addresses
                    const priceA = await getTokenPrice(coinA);
                    const priceB = await getTokenPrice(coinB);

                    // Calculate token balances in USD
                    const balanceA = priceA !== "N/A" ? priceA * coinAmounts.coinA : 0;
                    const balanceB = priceB !== "N/A" ? priceB * coinAmounts.coinB : 0;
                    const currentPrice = priceA / priceB;

                    const accruedFeeAndRewards = await getAccruedFeeAndRewards(position, pool);
                    const positionValueUSD = balanceA + balanceB + accruedFeeAndRewards.totalRewardsUSD + accruedFeeAndRewards.totalFeesUSD;

                    const initialPrice = await calculateInitialPrice(position, userAddress, pool);
                    const impermanentLoss = calculateImpermanentLoss(initialPrice, currentPrice);

                    console.log(`Initial Price (USDC per SUI):`, initialPrice);
                    console.log(`Current Balance Ratio (SUI per USDC):`, balanceA / balanceB); // this matches bluefin position value
                    console.log(`Current Price (USDC per SUI):`, currentPrice); // this matches bluefin position value
                    console.log(`Impermanent Loss:`, impermanentLoss);
                    return {
                        ...position,
                        coinA,
                        coinB,
                        balanceA,
                        balanceB,
                        totalRewardsUSD: accruedFeeAndRewards.totalRewardsUSD,
                        totalFeesUSD: accruedFeeAndRewards.totalFeesUSD,
                        positionValueUSD,
                        impermanentLoss
                    };
                })
            );

            console.log(JSON.stringify(positionsWithDetails.filter(Boolean), null, 2)); // Remove null entries
        }
    } catch (error) {
        console.error('❌ Error retrieving user LP positions:', error);
    }
};

// Execute script
main()
    .then(() => console.log('✅ Script execution completed.'))
    .catch((err) => console.error('❌ Script execution failed:', err));
