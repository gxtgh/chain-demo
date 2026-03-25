import Decimal from "decimal.js";

export function formatSui(mist: bigint | string | number, decimals = 9) {
  return formatHumanUnits(BigInt(mist), decimals);
}

export function toMist(amount: string, decimals = 9) {
  return parseHumanUnits(amount || "0", decimals);
}

export function shortenAddress(address: string, size = 6) {
  if (!address) return "--";
  return `${address.slice(0, size)}...${address.slice(-size)}`;
}

export function makeLogId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatHumanUnits(amount: bigint | string, decimals: number) {
  return new Decimal(amount.toString()).div(new Decimal(10).pow(decimals)).toString();
}

export function parseHumanUnits(amount: string, decimals: number) {
  const value = new Decimal(amount || "0");
  if (value.isNegative()) {
    throw new Error("Amount must not be negative.");
  }
  return BigInt(value.mul(new Decimal(10).pow(decimals)).toFixed(0, Decimal.ROUND_DOWN));
}
