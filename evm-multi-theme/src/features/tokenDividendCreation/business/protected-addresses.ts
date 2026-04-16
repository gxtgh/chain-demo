import { ZeroAddress } from 'ethers'

export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

export type ProtectedAddressEntry = {
  address?: string | null
  label: string
}

export function normalizeProtectedAddress(value: string) {
  return value.trim().toLowerCase()
}

export function buildProtectedAddressEntries(entries: ProtectedAddressEntry[]) {
  return entries.filter((item) => item.address && item.address !== ZeroAddress)
}

export function buildProtectedAddressSet(
  entries: ProtectedAddressEntry[],
  isValidAddress: (value: string) => boolean,
) {
  return new Set(
    buildProtectedAddressEntries(entries)
      .map((item) => String(item.address))
      .filter((item) => isValidAddress(item))
      .map((item) => normalizeProtectedAddress(item)),
  )
}

export function findProtectedAddresses(addresses: string[], protectedAddressSet: Set<string>) {
  return addresses.filter((item) => protectedAddressSet.has(normalizeProtectedAddress(item)))
}

export function splitAddressList(value: string) {
  return value
    .split(/[\n,;]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
