export interface SolscanTokenAccount {
  token_address: string;
  token_account: string;
  amount: number;
  token_decimals: number;
  token_name?: string;
  token_symbol?: string;
}

export interface SolscanTokenAccountsResponse {
  data?: SolscanTokenAccount[];
}

