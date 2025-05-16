import type { Config } from './types.js';

export const config: Config = {
  // GitHub API configuration
  github: {
    apiVersion: '2022-11-28',
    perPage: 100, // Number of repos to fetch per page
    maxPages: 10,  // Maximum number of pages to fetch (limit to 1000 repos)
  },
  
  // UI configuration
  ui: {
    spinnerColor: 'yellow',
    tableColors: {
      header: 'cyan',
      row: 'white',
      selected: 'green',
      inactive: 'gray',
      danger: 'red',
    },
    inactiveThresholdDays: 180, // 6 months
    lowCommitThreshold: 3,      // Highlight repos with <= 3 commits
  },

  // CLI configuration
  cli: {
    confirmationKeyword: 'DELETE',
  },
};