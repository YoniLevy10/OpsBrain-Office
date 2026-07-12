import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";

function getKey(): Buffer | null {
  const secret =
    process.env.OPSBRAIN_TOKEN_ENCRYPTION_KEY ||
    process.env.CRON_SECRET ||
    process.env.OPSBRAIN_ACCESS_SECRET;
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  if (!key) return plain;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  if (!stored.startsWith("v1:")) return stored;
  const key = getKey();
  if (!key) return stored;
  const [, ivB64, tagB64, dataB64] = stored.split(":");
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const dec = Buffer.concat([
    decipher.update(Buffer.from(dataB64, "base64")),
    decipher.final(),
  ]);
  return dec.toString("utf8");
}
