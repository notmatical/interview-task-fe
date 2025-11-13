"use client";

import { useState } from "react";
import { formatAddress } from "@mysten/sui/utils";
import { ConnectModal } from "@mysten/dapp-kit";
import { Unplug } from "lucide-react";
import { Button } from "../ui/button";
import { useApp } from "@/context/app.context";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MultiWallet } from "../shared/multi-wallet";

export function UserDropdown() {
    const [open, setOpen] = useState(false);

    const { accounts, address, domain, isConnected, disconnect } = useApp();

    return (
        <Popover
            open={open && isConnected}
            onOpenChange={setOpen}
        >
            <PopoverTrigger asChild>
                {isConnected ? (
                    <Button
                        variant="outline"
                        className="rounded-xl text-muted-foreground ease-in-out duration-300 transition-all"
                    >
                        <span className="text-sm">
                            {domain || formatAddress(address || '')}
                        </span>
                    </Button>
                ) : (
                    <ConnectModal
                        trigger={
                            <Button variant="outline" className="rounded-xl text-muted-foreground" disabled={!!isConnected}>
                                Connect Wallet
                            </Button>
                        }
                    />
                )}
            </PopoverTrigger>

            <PopoverContent className="max-w-sm p-0 bg-background/60 backdrop-blur-3xl rounded-lg shadow-2xl border" align="end">
                <div className="flex flex-col">
                    <MultiWallet />

                    <div className="border-t p-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-destructive hover:bg-destructive/10 bg-transparent"
                            onClick={disconnect}
                        >
                            <span className="flex flex-grow items-center gap-2 text-destructive">
                                <Unplug className="w-4 h-4" />
                                {accounts.length > 1 ? "Disconnect All" : "Disconnect Wallet"}
                            </span>
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}