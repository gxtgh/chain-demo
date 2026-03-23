import type { SolscanTokenAccount, SolscanTokenAccountsResponse } from "../../types/solscan";

export class SolscanClient {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey?: string
  ) {}

  async getTokenAccounts(ownerAddress: string): Promise<SolscanTokenAccount[]> {
    if (!this.apiKey) {
      return [];
    }

    const url = new URL("/account/token-accounts", this.baseUrl);
    url.searchParams.set("address", ownerAddress);
    url.searchParams.set("type", "token");
    url.searchParams.set("hide_zero", "true");

    const response = await fetch(url.toString(), {
      headers: {
        token: this.apiKey
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Solscan request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as SolscanTokenAccountsResponse;
    return payload.data ?? [];
  }
}

export const solscanClient = new SolscanClient(
  import.meta.env.VITE_SOLSCAN_PRO_API_BASE_URL ?? "https://pro-api.solscan.io/v2.0",
  import.meta.env.VITE_SOLSCAN_PRO_API_KEY
);
