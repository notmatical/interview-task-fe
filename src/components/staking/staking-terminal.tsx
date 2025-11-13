"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Unplug, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { MIST_PER_SUI, SUI_TYPE_ARG } from "@mysten/sui/utils"
import { toast } from "react-hot-toast";
import { useApp } from "@/context/app.context";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { useBalance } from "@/hooks/sui/use-balance";
import { formatNumberWithSuffix } from "@/utils/format";
import { Button } from "../ui/button";
import { cn } from "@/utils";
import { Spinner } from "../ui/spinner";
import { useStaking } from "@/hooks/use-staking";
import { useSuiPrice } from "@/hooks/sui/use-sui-price";
import { sanitizeNumberInput } from "@/lib/sanitize-input";
import { getStakingInputError, isValidStakeAmount } from "@/lib/validate-input";

export function StakingTerminal() {
    const { isConnected } = useApp();
    const { balance, refetch: refetchBalance } = useBalance(SUI_TYPE_ARG);
    const suiPrice = useSuiPrice();
    const {
        stakingInfo,
        isStaking,
        stake,
        calculateExpectedAfSui,
    } = useStaking();

    const [action, setAction] = useState<"stake" | "unstake">("stake")
    const [amount, setAmount] = useState("")

    const balanceInDisplayUnit = balance ? Number(balance) / Number(MIST_PER_SUI) : 0

    // amount/input validation
    const insufficientBalance = action === "stake" && parseFloat(amount || "0") > balanceInDisplayUnit;
    const isAmountValid = useMemo(() => isValidStakeAmount(amount), [amount]);
    const displayError = useMemo(() => getStakingInputError(amount), [amount]);

    // calculate expected output
    const expectedAfSui = useMemo(() =>
        calculateExpectedAfSui(amount),
        [amount, calculateExpectedAfSui]
    );

    // calculate usd value of input
    const usdValue = useMemo(() => {
        if (!amount || amount === "." || amount === "") return "0.00";
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed === 0) return "0.00";
        return (parsed * suiPrice.usd).toFixed(2);
    }, [amount, suiPrice.usd]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const sanitized = sanitizeNumberInput(e.target.value);
        setAmount(sanitized);
    };

    const handleMaxClick = () => {
        // @dev: deduct .5 SUI to cover gas
        const maxAmount = Math.max(0, balanceInDisplayUnit - 0.5);
        setAmount(maxAmount.toString());
    };

    const handleStake = async () => {
        if (!isAmountValid || insufficientBalance || isStaking) {
            return;
        }

        const promise = stake(amount);
        toast.promise(
            promise,
            {
                loading: `Staking ${formatNumberWithSuffix(Number(amount))} SUI...`,
                success: (result) => {
                    if (result.success && result.afSuiAmount) {
                        setAmount("");
                        refetchBalance();
                        return `Successfully staked and received ${result.afSuiAmount} afSUI`;
                    }

                    throw new Error(result.error || "Stake failed");
                },
                error: (err) => `Failed to stake: ${err.message}`,
            }
        );

        try {
            await promise;
        } catch (error) {
            console.error("stake failed:", error);
        }
    };

    if (!isConnected) {
        return (
            <Empty className="w-full max-w-sm bg-background/60 backdrop-blur-3xl rounded-xl border border-solid">
                <EmptyHeader>
                    <EmptyMedia className="" variant="icon">
                        <Unplug className="text-muted-foreground" />
                    </EmptyMedia>

                    <EmptyTitle>No Wallet Connected</EmptyTitle>
                    <EmptyDescription>Please connect your wallet to continue</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <div className="w-full max-w-md">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background/60 backdrop-blur-3xl rounded-2xl shadow-2xl border overflow-hidden"
            >
                {/* content */}
                <div className="p-6 space-y-6">
                    <div className="relative flex gap-1 p-1 bg-background/60 rounded-xl overflow-hidden">
                        {/* active effect */}
                        <div className="absolute inset-1 flex gap-1">
                            <motion.div
                                className="bg-card/50 rounded-lg"
                                initial={false}
                                animate={{
                                    x: action === "stake" ? 0 : "calc(100% + 4px)"
                                }}
                                style={{
                                    width: "calc(50% - 2px)"
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 35
                                }}
                            />
                        </div>

                        <Button
                            onClick={() => setAction("stake")}
                            variant="ghost"
                            className={cn(
                                "relative z-10 flex-1 h-auto py-2.5 font-medium",
                                action === "stake"
                                    ? "text-foreground hover:bg-transparent"
                                    : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent"
                            )}
                        >
                            Stake
                        </Button>
                        <Button
                            disabled
                            variant="ghost"
                            className={cn(
                                "relative z-10 flex-1 h-auto py-2.5 font-medium",
                                action === "unstake"
                                    ? "text-foreground hover:bg-transparent"
                                    : "text-muted-foreground/70 hover:text-muted-foreground hover:bg-transparent"
                            )}
                        >
                            Unstake
                        </Button>
                    </div>

                    {/* @dev: only doing stake for this test, but would be best to isolate both Stake & Unstake into their own components. */}
                    {action === "stake" && (
                        <div className="space-y-4">
                            <div className="border border-border/50 rounded-lg p-3 space-y-2 bg-muted/5">
                                {/* header */}
                                <div className="flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-1.5 text-muted-foreground">
                                        <Wallet className="h-3.5 w-3.5" />
                                        <span>Balance</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-foreground font-mono">
                                            {formatNumberWithSuffix(balanceInDisplayUnit)}
                                        </span>
                                        <span className="text-muted-foreground">SUI</span>
                                        <button
                                            onClick={handleMaxClick}
                                            className="text-accent hover:text-accent-foreground font-medium text-xs transition-colors"
                                            disabled={isStaking}
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>

                                {/* input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={handleAmountChange}
                                            className="flex-1 bg-transparent text-2xl font-medium outline-none placeholder:text-muted-foreground/50 text-foreground min-w-0"
                                            disabled={isStaking}
                                            inputMode="decimal"
                                        />
                                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/20 rounded-md border border-border/50 shrink-0">
                                            <Image
                                                src="/assets/sui-fill.svg"
                                                alt="SUI"
                                                width={18}
                                                height={18}
                                                className="shrink-0"
                                            />
                                            <span className="text-sm font-medium whitespace-nowrap">SUI</span>
                                        </div>
                                    </div>

                                    <span className="text-xs text-muted-foreground">
                                        ≈ ${usdValue} USD
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* action button */}
                    <Button
                        disabled={!isAmountValid || insufficientBalance || isStaking}
                        onClick={handleStake}
                        className={cn(
                            "w-full h-12 font-medium text-sm transition-all duration-300 relative overflow-hidden group",
                            action === "stake"
                                ? "bg-accent hover:bg-accent-foreground text-black"
                                : "bg-background/60 hover:bg-card/50 border border-border/50",
                            (insufficientBalance || !isAmountValid) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {/* hover shimmer */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-linear-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={isStaking ? "staking" : "idle"}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.15 }}
                                className="relative flex items-center justify-center gap-2"
                            >
                                {isStaking ? (
                                    <>
                                        <Spinner />
                                        Processing...
                                    </>
                                ) : insufficientBalance ? (
                                    "Insufficient Balance"
                                ) : displayError ? (
                                    displayError
                                ) : !amount || amount === "." ? (
                                    "Stake SUI"
                                ) : (
                                    <>Stake {amount} SUI</>
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </Button>

                    {/* staking information section */}
                    {stakingInfo && (
                        <div className="border border-border/50 rounded-lg p-3 space-y-2 bg-muted/5">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">APY</span>
                                    <span className="font-medium">
                                        {(stakingInfo.validatorApy * 100).toFixed(2)}%
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Validator Fee</span>
                                    <span className="font-medium">
                                        {stakingInfo.validatorFee}%
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Exchange Rate</span>
                                    <span className="font-medium">
                                        1 afSUI = {stakingInfo.exchangeRate.toFixed(4)} SUI
                                    </span>
                                </div>

                                {expectedAfSui && isAmountValid && (
                                    <div className="pt-2 border-t border-border/50">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">You'll Receive</span>
                                            <span className="font-bold text-white">
                                                {expectedAfSui} afSUI
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}