export interface StakingInfo {
    exchangeRate: number;
    validatorApy: number;
    validatorFee: number;
    validatorName: string;
}

export interface StakeResult {
    success: boolean;
    txDigest?: string;
    afSuiAmount?: string;
    error?: string;
}

export interface UseStakingReturn {
    stakingInfo: StakingInfo | null;

    isLoadingInfo: boolean;
    isStaking: boolean;
    isRefreshing: boolean;

    stake: (amountInSui: string) => Promise<StakeResult>;
    calculateExpectedAfSui: (suiAmount: string) => string | null;
    refreshStakingInfo: () => Promise<void>;
    validateAmount: (amount: string) => { valid: boolean; error?: string };

    error: Error | null;
}