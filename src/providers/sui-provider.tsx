"use client";

import "@mysten/dapp-kit/dist/index.css";

import { ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit"
import useNetworkConfig from "@/hooks/sui/use-network-config";
import { Network } from "@/types/network";
import { AppContextProvider } from "@/context/app.context";

const queryClient = new QueryClient();

export default function SuiProvider({ children }: { children: ReactNode }) {
    const { networkConfig } = useNetworkConfig();

    return (
        <QueryClientProvider client={queryClient}>
            <SuiClientProvider networks={networkConfig} defaultNetwork={Network.MAINNET}>
                <WalletProvider autoConnect slushWallet={{ name: "Aftermath FE Test" }}>
                    <AppContextProvider>
                        {children}
                    </AppContextProvider>
                </WalletProvider>
            </SuiClientProvider>
        </QueryClientProvider>
    )
}