export interface CliOptions {
  dryRun: boolean;
  force: boolean;
}

export interface Config {
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

