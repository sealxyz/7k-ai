'use client';

import '@mysten/dapp-kit/dist/index.css'; 
import { ConnectButton } from '@mysten/dapp-kit';

export function ConnectWallet() {
  return (
    <ConnectButton
      className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/80"
    />
  );
}
