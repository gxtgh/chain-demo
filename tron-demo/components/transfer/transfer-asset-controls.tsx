import type { TransferAssetKind } from "../../types/transfer";
import styles from "./transfer-shell.module.scss";

export function TransferAssetControls(props: {
  assetKind: TransferAssetKind;
  contractAddress: string;
  onAssetKindChange: (value: TransferAssetKind) => void;
  onContractAddressChange: (value: string) => void;
}) {
  return (
    <div className={styles.inlineControls}>
      <select
        className={styles.select}
        value={props.assetKind}
        onChange={(event) => props.onAssetKindChange(event.target.value as TransferAssetKind)}
      >
        <option value="trx">TRX</option>
        <option value="trc20">TRC20</option>
      </select>
      <input
        className={styles.input}
        placeholder="TRC20 合约地址（仅 TRC20 必填）"
        value={props.contractAddress}
        onChange={(event) => props.onContractAddressChange(event.target.value.trim())}
      />
    </div>
  );
}
