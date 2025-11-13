import { useEffect, useState, useCallback } from "react";
import { MIST_PER_SUI, SUI_DECIMALS } from "@mysten/sui/utils";
import { getLiquidStaking, getSui } from "@/lib/aftermath-sdk";
import { useApp } from "@/context/app.context";
import { useTransaction } from "@/hooks/sui/use-transaction";
import { validateStakingInput } from "@/lib/validate-input";
import { formatNumberWithSuffix } from "@/utils/format";
import {
    AFTERMATH_VALIDATOR_ADDRESS,
    STAKING_INFO_REFRESH_INTERVAL
} from "@/constants";
import type {
    StakingInfo,
    UseStakingReturn,
    StakeResult
} from "@/types/staking";

export function useStaking(): UseStakingReturn {
    const { address, isConnected } = useApp();
    const { executeTransaction } = useTransaction();

    const [stakingInfo, setStakingInfo] = useState<StakingInfo | null>(null);
    const [isLoadingInfo, setIsLoadingInfo] = useState(false);
    const [isStaking, setIsStaking] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchStakingInfo = useCallback(async (showLoading = true) => {
        if (showLoading) {
            setIsLoadingInfo(true);
        } else {
            setIsRefreshing(true);
        }

        setError(null);

        try {
            const staking = await getLiquidStaking();
            const sui = await getSui();

            const [exchangeRate, validatorApysData, systemState, validatorConfigs] = await Promise.all([
                staking.getAfSuiToSuiExchangeRate(),
                staking.getValidatorApys(),
                sui.getSystemState(),
                staking.getValidatorConfigs()
            ]);

            // pull the af validator from the apy array
            const aftermathApyData = validatorApysData?.apys?.find(
                (v: any) => v.address === AFTERMATH_VALIDATOR_ADDRESS
            );

            // get validator info from sui system state
            const aftermathValidator = systemState.activeValidators.find(
                (v: any) => v.suiAddress === AFTERMATH_VALIDATOR_ADDRESS
            );

            // get validator config for fee
            const aftermathConfig = validatorConfigs.find(
                (config: any) => config.suiAddress === AFTERMATH_VALIDATOR_ADDRESS
            );

            const validatorName = aftermathValidator?.name || "Aftermath";
            const validatorApy = aftermathApyData?.apy || 0;
            const validatorFee = aftermathConfig ? aftermathConfig.fee * 100 : 0;

            setStakingInfo({
                exchangeRate,
                validatorApy,
                validatorFee,
                validatorName,
            });
        } catch (err) {
            console.error("Failed to fetch staking info:", err);
            setError(err instanceof Error ? err : new Error("Failed to fetch staking information"));
        } finally {
            setIsLoadingInfo(false);
            setIsRefreshing(false);
        }
    }, []);

    const calculateExpectedAfSui = useCallback(
        (suiAmount: string): string | null => {
            if (!stakingInfo || !suiAmount || suiAmount === "" || suiAmount === ".") {
                return null;
            }

            const amount = parseFloat(suiAmount);
            if (isNaN(amount) || amount <= 0) {
                return null;
            }

            const afSuiAmount = amount / stakingInfo.exchangeRate;
            return afSuiAmount.toFixed(4);
        },
        [stakingInfo]
    );

    const validateAmount = useCallback(
        (amount: string): { valid: boolean; error?: string } => {
            return validateStakingInput(amount);
        },
        []
    );

    const stake = useCallback(
        async (amountInSui: string): Promise<StakeResult> => {
            if (!address || !isConnected) {
                return { success: false, error: "Wallet not connected" };
            }

            if (!stakingInfo) {
                return { success: false, error: "Staking information not loaded" };
            }

            const validation = validateAmount(amountInSui);
            if (!validation.valid) {
                return { success: false, error: validation.error || "Invalid amount" };
            }

            const amount = parseFloat(amountInSui);
            if (isNaN(amount) || amount <= 0) {
                return { success: false, error: "Invalid amount" };
            }

            const mistAmount = BigInt(Math.floor(amount * Math.pow(10, SUI_DECIMALS)));
            if (mistAmount < MIST_PER_SUI) {
                return { success: false, error: "Minimum stake amount is 1 SUI" };
            }

            setIsStaking(true);
            setError(null);

            try {
                const staking = await getLiquidStaking();
                const stakeTx = await staking.getStakeTransaction({
                    walletAddress: address,
                    suiStakeAmount: mistAmount,
                    validatorAddress: AFTERMATH_VALIDATOR_ADDRESS,
                });

                const result = await executeTransaction(stakeTx, {
                    showEffects: true,
                    showObjectChanges: true,
                });

                // calculate the amount recieved for the lil toaster homie
                const afSuiAmount = amount / stakingInfo.exchangeRate;
                const afSuiFormatted = formatNumberWithSuffix(afSuiAmount);

                fetchStakingInfo(false);

                return {
                    success: true,
                    txDigest: result.digest,
                    afSuiAmount: afSuiFormatted,
                };
            } catch (err) {
                console.error("stake tx failed:", err);
                const errorMessage = err instanceof Error ? err.message : "Transaction failed";
                setError(new Error(errorMessage));
                return { success: false, error: errorMessage };
            } finally {
                setIsStaking(false);
            }
        },
        [address, isConnected, stakingInfo, validateAmount, executeTransaction, fetchStakingInfo]
    );

    const refreshStakingInfo = useCallback(async () => {
        await fetchStakingInfo(false);
    }, [fetchStakingInfo]);

    // mount fetch & on connect/address change
    useEffect(() => {
        if (isConnected && address) {
            fetchStakingInfo();
        }
    }, [isConnected, address, fetchStakingInfo]);

    // refresh staking info every 30 seconds
    useEffect(() => {
        if (!isConnected || !address) return;

        const interval = setInterval(() => {
            fetchStakingInfo(false);
        }, STAKING_INFO_REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [isConnected, address, fetchStakingInfo]);

    return {
        stakingInfo,
        isLoadingInfo,
        isStaking,
        isRefreshing,
        stake,
        calculateExpectedAfSui,
        refreshStakingInfo,
        validateAmount,
        error,
    };
}