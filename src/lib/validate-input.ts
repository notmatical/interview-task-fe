import { SUI_DECIMALS } from "@mysten/sui/utils";

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

export const validateStakingInput = (
    input: string,
    minAmount: number = 1
): ValidationResult => {
    if (!input || input === "" || input === ".") {
        return { valid: false };
    }

    // valid number regex
    const regex = /^\d*\.?\d*$/;
    if (!regex.test(input)) {
        return { valid: false, error: "Invalid number format" };
    }

    // potentailly redudant check for multiple decimals
    const decimalCount = (input.match(/\./g) || []).length;
    if (decimalCount > 1) {
        return { valid: false, error: "Invalid number format" };
    }

    // validate decimal places
    const parts = input.split(".");
    if (parts[1] && parts[1].length > SUI_DECIMALS) {
        return { valid: false, error: "Maximum 9 decimal places allowed" };
    }

    const amount = parseFloat(input);
    if (amount < minAmount) {
        return { valid: false, error: `Minimum stake amount is ${minAmount} SUI` };
    }

    return { valid: true };
};

export const isValidStakeAmount = (input: string, minAmount: number = 1): boolean => {
    if (!input || input === "" || input === ".") {
        return false;
    }

    const amount = parseFloat(input);
    return !isNaN(amount) && amount >= minAmount;
};

export const getStakingInputError = (input: string, minAmount: number = 1): string | null => {
    // dont evaluate input errors if input is empty
    if (!input || input === "") {
        return null;
    }

    const validation = validateStakingInput(input, minAmount);
    return validation.error || null;
};