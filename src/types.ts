export interface CliOptions {
  dryRun: boolean;
  force: boolean;
}
export interface Config {
  app: {
    name: string;
    version: string;
  };
  github: {
    apiVersion: string;
    perPage: number;
    maxPages: number;
  };
  ui: {
    spinnerColor: string;
    tableColors: {
      header: string;
      row: string;
      selected: string;
      inactive: string;
      danger: string;
    };
    inactiveThresholdDays: number;
    lowCommitThreshold: number;
  };
  cli: {
    confirmationKeyword: string;
  };
  authMethods: {
    oauth: boolean;
    token: boolean;
  };
  store: {
    configDir: string;
    configFile: string;
    keyDir: string;
    keyFile: string;
  };
  security: {
    encryptionAlgorithm: string;
    keyRotationInterval: number;
  };
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
  };
  html_url: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  private: boolean;
  fork: boolean;
}

export interface Commit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
}

export interface FormattedRepository {
  id: number;
  name: string;
  description: string;
  lastUpdated: string;
  commitCount: string;
  isInactive: boolean;
  hasLowCommits: boolean;
  language: string;
  visibility: string;
  url: string;
}

export interface FailedDeletion {
  repo: FormattedRepository;
  error: string;
}
export interface EncryptedData {
  iv: string;
  encryptedData: string;
  authTag: string;
  keyVersion: string;
  createdAt: number;
}

export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
  tokenType: "oauth" | "pat";
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}
