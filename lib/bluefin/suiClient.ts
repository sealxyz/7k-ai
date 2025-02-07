import { QueryChain } from '@firefly-exchange/library-sui/dist/src/spot'
import { SuiClient as SuiClientV2 } from '@firefly-exchange/library-sui'
import { mainnetConfig } from './config'

export class SuiClient {
  private client: SuiClientV2

  constructor() {
    this.client = new SuiClientV2({ url: 'https://fullnode.mainnet.sui.io:443' })
  }

  /**
   * Get pool details
   * @param poolId - pool id
   * @returns
   */
  async getPool(poolId: string) {
    let qc = new QueryChain(this.client)
    let pool = await qc.getPool(poolId)
    return pool
  }

  /**
   * Get user positions
   * @param address - user address
   * @returns
   */
  async getUserPositions(userAddress: string) {
    try {
      console.log(`📡 Querying user positions for ${userAddress}...`);
      let qc = new QueryChain(this.client);
      let response = await qc.getUserPositions(mainnetConfig.BasePackage, userAddress);
      
      console.log(`✅ Fetched positions:`, response);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching positions for ${userAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get position details
   * @param positionId - position id
   * @returns
   */
  async getPositionDetails(positionId: string) {
    let qc = new QueryChain(this.client)
    let pos = await qc.getPositionDetails(positionId)
    return pos
  }
}
