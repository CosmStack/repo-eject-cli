#!/usr/bin/env node

import dotenv from "dotenv";
import { Command } from "commander";
import { analyzeRepositories } from "../commands/analyze";
import { deleteRepositories } from "../commands/delete";
import type { CliOptions } from "../types";
import { config } from "../config";

dotenv.config();

const program = new Command();

program
  .name(config.app.name)
  .description("Find and delete old or inactive GitHub repositories")
  .version(config.app.version);

program
  .option(
    "-d, --dry-run",
    "Simulate deletion without actually deleting repositories",
    false,
  )
  .option("-f, --force", "Skip confirmation prompts (use with caution)", false)
  .action(async (options: CliOptions) => {
    try {
      const selectedRepos = await analyzeRepositories();

      if (selectedRepos && selectedRepos.length > 0) {
        await deleteRepositories(selectedRepos, options);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      } else {
        console.error("An unexpected error occurred");
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
