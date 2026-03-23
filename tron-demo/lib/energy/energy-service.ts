import { createTronWeb, getExplorerTransactionUrl } from "../tron/client";
import { walletService } from "../wallet/wallet-service";
import type { EnergyActionReceipt } from "../../types/energy";
import type { TronNetwork } from "../../types/network";
import type { TronWalletRecord } from "../../types/wallet";

export const energyService = {
  async freeze(
    network: TronNetwork,
    wallet: TronWalletRecord,
    amountTrx: string
  ) {
    const client = createTronWeb(network, wallet.privateKey);
    const amountSun = toSun(amountTrx);
    const transaction = await client.transactionBuilder.freezeBalanceV2(
      amountSun,
      "ENERGY",
      wallet.addressBase58
    );
    const signed = await client.trx.sign(transaction, wallet.privateKey);
    const result = await client.trx.sendRawTransaction(signed);

    return buildReceipt(network, "freeze", wallet.addressBase58, undefined, amountTrx, result.txid || transaction.txID);
  },

  async delegate(
    network: TronNetwork,
    wallet: TronWalletRecord,
    receiverAddress: string,
    amountTrx: string
  ) {
    const client = createTronWeb(network, wallet.privateKey);
    const transaction = await client.transactionBuilder.delegateResource(
      toSun(amountTrx),
      walletService.normalizeAddress(receiverAddress),
      "ENERGY",
      wallet.addressBase58,
      false
    );
    const signed = await client.trx.sign(transaction, wallet.privateKey);
    const result = await client.trx.sendRawTransaction(signed);

    return buildReceipt(
      network,
      "delegate",
      wallet.addressBase58,
      receiverAddress,
      amountTrx,
      result.txid || transaction.txID
    );
  },

  async undelegate(
    network: TronNetwork,
    wallet: TronWalletRecord,
    receiverAddress: string,
    amountTrx: string
  ) {
    const client = createTronWeb(network, wallet.privateKey);
    const transaction = await client.transactionBuilder.undelegateResource(
      toSun(amountTrx),
      walletService.normalizeAddress(receiverAddress),
      "ENERGY",
      wallet.addressBase58
    );
    const signed = await client.trx.sign(transaction, wallet.privateKey);
    const result = await client.trx.sendRawTransaction(signed);

    return buildReceipt(
      network,
      "undelegate",
      wallet.addressBase58,
      receiverAddress,
      amountTrx,
      result.txid || transaction.txID
    );
  },

  async unfreeze(
    network: TronNetwork,
    wallet: TronWalletRecord,
    amountTrx: string
  ) {
    const client = createTronWeb(network, wallet.privateKey);
    const transaction = await client.transactionBuilder.unfreezeBalanceV2(
      toSun(amountTrx),
      "ENERGY",
      wallet.addressBase58
    );
    const signed = await client.trx.sign(transaction, wallet.privateKey);
    const result = await client.trx.sendRawTransaction(signed);

    return buildReceipt(network, "unfreeze", wallet.addressBase58, undefined, amountTrx, result.txid || transaction.txID);
  }
};

function buildReceipt(
  network: TronNetwork,
  action: EnergyActionReceipt["action"],
  ownerAddress: string,
  receiverAddress: string | undefined,
  amountTrx: string,
  txId: string
) {
  return {
    action,
    network,
    ownerAddress,
    receiverAddress,
    amountTrx,
    txId,
    explorerUrl: getExplorerTransactionUrl(network, txId)
  } satisfies EnergyActionReceipt;
}

function toSun(amount: string) {
  return Math.round(Number(amount) * 1_000_000);
}
