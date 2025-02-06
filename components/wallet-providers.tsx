'use client';

import { type ReactNode } from 'react';
import { SuiClientProvider } from '@mysten/dapp-kit';
import { WalletProvider } from '@mysten/dapp-kit';
import { createNetworkConfig } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function WalletProviders({ children }: { children: ReactNode }) {

  const { networkConfig } = createNetworkConfig({
    mainnet: { url: getFullnodeUrl('mainnet') },
    localnet: { url: getFullnodeUrl('localnet') },
  });

  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider>
            {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
