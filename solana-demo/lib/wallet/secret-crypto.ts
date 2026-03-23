export function demoEncryptSecret(secret: string, passphrase: string): string {
  return `demo:${encodeBase64(`${passphrase}:${secret}`)}`;
}

export function demoDecryptSecret(payload: string, passphrase: string): string {
  const decoded = decodeBase64(payload.replace("demo:", ""));
  const [storedPassphrase, secret] = decoded.split(":");

  if (storedPassphrase !== passphrase || !secret) {
    throw new Error("Invalid passphrase for demo secret.");
  }

  return secret;
}

export interface SecretStorageAdapter {
  encrypt(secret: string): Promise<string>;
  decrypt(payload: string): Promise<string>;
}

function encodeBase64(value: string): string {
  return window.btoa(value);
}

function decodeBase64(value: string): string {
  return window.atob(value);
}
