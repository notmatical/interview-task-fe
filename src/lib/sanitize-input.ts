import { SUI_DECIMALS } from "@mysten/sui/utils";

export const sanitizeNumberInput = (raw: string, maxDecimals = SUI_DECIMALS): string => {
    if (!raw) return "";
    let v = raw.replace(/[^\d.]/g, "");

    // retain first decimal
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
        v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }

    // handle leading zeros
    if (v.startsWith("0") && v.length > 1 && !v.startsWith("0.")) {
        v = v.replace(/^0+/, "");

        // if all zeros were removed ("000" → ""), turn into "0"
        if (v === "" || v.startsWith(".")) {
            v = "0" + v;
        }
    }

    // decimal precision
    const parts = v.split(".");
    let intPart = parts[0] ?? "";
    let fracPart = parts[1] ?? "";

    if (maxDecimals >= 0 && fracPart.length > maxDecimals) {
        fracPart = fracPart.slice(0, maxDecimals);
    }

    // rebuild
    if (parts.length > 1) {
        // allow trailing dot while typing "1."
        return fracPart.length > 0 ? `${intPart}.${fracPart}` : `${intPart}.`;
    }

    return intPart;
}