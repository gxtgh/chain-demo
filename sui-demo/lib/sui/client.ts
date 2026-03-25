import { SuiClient } from "@mysten/sui/client";

import { DEFAULT_RPC } from "./constants";

export const suiClient = new SuiClient({
  url: DEFAULT_RPC
});

export function createSuiClient(url = DEFAULT_RPC) {
  return new SuiClient({ url });
}
