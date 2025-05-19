import crypto from "node:crypto";
import fs from "node:fs";
import { config } from "../config";
import type { EncryptedData, TokenData } from "../types";
import type { CipherGCM, DecipherGCM } from "node:crypto";

const KEY_DIR = config.store.keyDir;
const MASTER_KEY_FILE = config.store.keyFile;
const ENCRYPTION_ALGORITHM = config.security.encryptionAlgorithm;

function generateKey(): Buffer {
  return crypto.randomBytes(32);
}

function ensureKeyDir(): void {
  if (!fs.existsSync(KEY_DIR)) {
    fs.mkdirSync(KEY_DIR, { recursive: true, mode: 0o700 });
  }
}

function getMasterKey(): Buffer {
  ensureKeyDir();

  try {
    if (fs.existsSync(MASTER_KEY_FILE)) {
      return fs.readFileSync(MASTER_KEY_FILE);
    }
  } catch (error) {
    console.warn("Failed to read master key, generating new one");
  }

  const masterKey = generateKey();
  fs.writeFileSync(MASTER_KEY_FILE, masterKey, { mode: 0o600 });
  return masterKey;
}

export function encrypt(data: TokenData): EncryptedData {
  const masterKey = getMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    ENCRYPTION_ALGORITHM,
    masterKey,
    iv,
  ) as CipherGCM;

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(data), "utf8"),
    cipher.final(),
  ]);

  return {
    iv: iv.toString("base64"),
    encryptedData: encrypted.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    createdAt: Date.now(),
  };
}

export function decrypt(encryptedData: EncryptedData): TokenData {
  const masterKey = getMasterKey();
  const decipher = crypto.createDecipheriv(
    ENCRYPTION_ALGORITHM,
    masterKey,
    Buffer.from(encryptedData.iv, "base64"),
  ) as DecipherGCM;

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, "base64"));

  try {
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData.encryptedData, "base64")),
      decipher.final(),
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    throw new Error("Failed to decrypt token. Please authenticate again.");
  }
}

export function isTokenExpired(tokenData: TokenData): boolean {
  if (!tokenData.expiresAt) return false;
  return Date.now() >= tokenData.expiresAt;
}

export function needsRefresh(tokenData: TokenData): boolean {
  if (!tokenData.expiresAt || !tokenData.refreshToken) return false;
  return Date.now() >= tokenData.expiresAt - 60 * 60 * 1000;
}
