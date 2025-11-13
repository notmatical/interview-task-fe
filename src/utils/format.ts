export const formatNumberWithSuffix = (value: number | undefined): string => {
    if (value == null || !isFinite(value)) return "0"

    const thresholds = [
        { min: 1e9, suffix: "B", divisor: 1e9 },
        { min: 1e6, suffix: "M", divisor: 1e6 },
        { min: 1e3, suffix: "K", divisor: 1e3 },
        { min: 1, suffix: "", divisor: 1 },
        { min: 0, suffix: "", divisor: 1, decimals: 4 },
    ]

    const {
        suffix,
        divisor,
        decimals: minDecimals,
    } = thresholds.find((t) => value >= t.min) || thresholds[thresholds.length - 1]
    const scaled = value / divisor

    const decimals = minDecimals !== undefined ? minDecimals : scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
    const formatted = parseFloat(scaled.toFixed(decimals)).toString()

    return `${formatted}${suffix}`
}