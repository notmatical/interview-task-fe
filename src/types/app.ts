import type { WalletAccount, WalletWithRequiredFeatures } from "@mysten/wallet-standard";

export type AppContextValue = {
    wallet: WalletAccount | null;
    accounts: readonly WalletAccount[];

    address: string | null;
    domain: string | null;

    isConnected: boolean;
    isConnecting: boolean;

    isConnectDialogOpen: boolean;
    setIsConnectDialogOpen: (open: boolean) => void;

    connect: (wallet: WalletWithRequiredFeatures) => Promise<void>;
    switchAccount: (account: WalletAccount) => Promise<void>;
    disconnect: () => Promise<void>;
}