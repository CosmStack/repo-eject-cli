#!/usr/bin/env node
// src/bin/cli.ts
import dotenv from 'dotenv';
import { Command } from 'commander';
import { analyzeRepositories } from '../commands/analyze.js';
import { deleteRepositories } from '../commands/delete.js';
import type { CliOptions } from '../types.js';

// Load environment variables
dotenv.config();

const program = new Command();

program
  .name('deadrepos')
  .description('Find and delete old or inactive GitHub repositories')
  .version('0.1.0');

program
  .option('-d, --dry-run', 'Simulate deletion without actually deleting repositories', false)
  .option('-f, --force', 'Skip confirmation prompts (use with caution)', false)
  .action(async (options: CliOptions) => {
    try {
      // Step 1: Analyze repositories and let user select which ones to delete
      const selectedRepos = await analyzeRepositories();
      
      // Step 2: Delete selected repositories if any
      if (selectedRepos && selectedRepos.length > 0) {
        await deleteRepositories(selectedRepos, options);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error:', error.message);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
