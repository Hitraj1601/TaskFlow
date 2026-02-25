import CryptoJS from "crypto-js";

const AES_SECRET_KEY =
  process.env.AES_SECRET_KEY || "default-aes-key-32-characters!!";

export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, AES_SECRET_KEY).toString();
}

export function decrypt(ciphertext: string): string {
  const bytes = CryptoJS.AES.decrypt(ciphertext, AES_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function encryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const encrypted = { ...data };
  for (const field of fields) {
    if (typeof encrypted[field] === "string") {
      (encrypted[field] as unknown) = encrypt(encrypted[field] as string);
    }
  }
  return encrypted;
}

export function decryptFields<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): T {
  const decrypted = { ...data };
  for (const field of fields) {
    if (typeof decrypted[field] === "string") {
      (decrypted[field] as unknown) = decrypt(decrypted[field] as string);
    }
  }
  return decrypted;
}
