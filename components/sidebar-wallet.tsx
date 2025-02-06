'use client';

import { ChevronUp } from 'lucide-react';
import { useWallets, useConnectWallet, useDisconnectWallet, useCurrentAccount } from '@mysten/dapp-kit';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { SidebarMenuButton } from '@/components/ui/sidebar';

export function SidebarWallet() {
  const wallets = useWallets(); 
  const { mutate: connect } = useConnectWallet(); 
  const { mutate: disconnect } = useDisconnectWallet(); 
  const account = useCurrentAccount();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
          {account ? (
            <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {account.address}
            </span>
          ) : (
            'Connect Wallet'
          )}
          <ChevronUp className="ml-auto" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
        {account ? (
          <>
            <DropdownMenuItem
              className="cursor-pointer text-red-500"
              onSelect={() => disconnect()}
            >
              Disconnect Wallet
            </DropdownMenuItem>
          </>
        ) : wallets.length > 0 ? (
          wallets.map((wallet) => (
            <DropdownMenuItem
              key={wallet.name}
              className="cursor-pointer"
              onSelect={() =>
                connect(
                  { wallet },
                )
              }
            >
              {wallet.name}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem className="text-gray-400">No wallets detected</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
