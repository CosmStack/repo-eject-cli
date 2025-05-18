import fs from "node:fs";
import { decrypt, encrypt, isTokenExpired } from "./security";
import type { EncryptedData, TokenData } from "../types";
import { config } from "../config";

const CONFIG_DIR = config.store.configDir;
const CONFIG_FILE = config.store.configFile;

interface ConfigStore {
  tokens?: {
    [key: string]: {
      encrypted: EncryptedData;
      lastUsed: number;
    };
  };
}

function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function readConfig(): ConfigStore {
  ensureConfigDir();

  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("Failed to read config file:", error);
  }

  return {};
}

export function writeConfig(config: ConfigStore): void {
  ensureConfigDir();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), {
      mode: 0o600,
    });
  } catch (error) {
    console.warn("Failed to write config file:", error);
  }
}

export function saveGitHubToken(tokenData: TokenData): void {
  const config = readConfig();
  if (!config.tokens) config.tokens = {};

  config.tokens.github = {
    encrypted: encrypt(tokenData),
    lastUsed: Date.now(),
  };

  writeConfig(config);
}

export async function getGitHubToken(): Promise<string | undefined> {
  const config = readConfig();
  if (!config.tokens?.github) return undefined;

  try {
    const tokenData = decrypt(config.tokens.github.encrypted);

    if (isTokenExpired(tokenData)) {
      if (tokenData.refreshToken) {
        // TODO: Implement refresh token logic
        // const newTokenData = await refreshGitHubToken(tokenData.refreshToken);
        // saveGitHubToken(newTokenData);
        // return newTokenData.accessToken;
        return undefined;
      }
      return undefined;
    }

    config.tokens.github.lastUsed = Date.now();
    writeConfig(config);

    return tokenData.accessToken;
  } catch (error) {
    console.warn("Failed to decrypt token:", error);
    return undefined;
  }
}
// TODO: Implement refresh token logic
// export async function refreshGitHubToken(
//   refreshToken: string,
// ): Promise<TokenData> {
//   return {
//     accessToken: "new-access-token",
//     refreshToken,
//     tokenType: "oauth",
//   };
// }

export function clearTokens(): void {
  const config = readConfig();
  config.tokens = undefined;
  writeConfig(config);
}
