import { Aftermath } from "aftermath-ts-sdk"

let instance: Aftermath | null = null;

async function getAftermath(): Promise<Aftermath> {
    if (!instance) {
        instance = new Aftermath("MAINNET");
        await instance.init();
    }

    return instance;
}

export async function getSui() {
    const af = await getAftermath();
    return af.Sui();
}

export async function getLiquidStaking() {
    const af = await getAftermath();
    return af.Staking();
}