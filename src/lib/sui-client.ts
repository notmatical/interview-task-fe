import { Network } from "@/types/network";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";

export const suiClient = new SuiClient({
    url: getFullnodeUrl(Network.MAINNET),
});