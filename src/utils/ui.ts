import chalk from "chalk";
import inquirer from "inquirer";
import { config } from "../config.js";
import type { FormattedRepository, Repository } from "../types";

const TIME_CONSTANTS = {
  MINUTE: 60,
  HOUR: 60 * 60,
  DAY: 60 * 60 * 24,
  WEEK: 60 * 60 * 24 * 7,
  MONTH: 60 * 60 * 24 * 30,
  YEAR: 60 * 60 * 24 * 365,
};

export function formatTimeAgo(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < TIME_CONSTANTS.MINUTE) {
    return `${diffInSeconds} seconds ago`;
  }

  if (diffInSeconds < TIME_CONSTANTS.HOUR) {
    const minutes = Math.floor(diffInSeconds / TIME_CONSTANTS.MINUTE);
    return formatPluralUnit(minutes, "minute");
  }

  if (diffInSeconds < TIME_CONSTANTS.DAY) {
    const hours = Math.floor(diffInSeconds / TIME_CONSTANTS.HOUR);
    return formatPluralUnit(hours, "hour");
  }

  if (diffInSeconds < TIME_CONSTANTS.WEEK) {
    const days = Math.floor(diffInSeconds / TIME_CONSTANTS.DAY);
    return formatPluralUnit(days, "day");
  }

  if (diffInSeconds < TIME_CONSTANTS.MONTH) {
    const weeks = Math.floor(diffInSeconds / TIME_CONSTANTS.WEEK);
    return formatPluralUnit(weeks, "week");
  }

  if (diffInSeconds < TIME_CONSTANTS.YEAR) {
    const months = Math.floor(diffInSeconds / TIME_CONSTANTS.MONTH);
    return formatPluralUnit(months, "month");
  }

  const years = Math.floor(diffInSeconds / TIME_CONSTANTS.YEAR);
  return formatPluralUnit(years, "year");
}

function formatPluralUnit(value: number, unit: string): string {
  return `${value} ${unit}${value > 1 ? "s" : ""} ago`;
}

export function isInactiveRepository(lastUpdateDate: string | Date): boolean {
  const now = new Date();
  const lastUpdate = new Date(lastUpdateDate);
  const diffInDays = Math.floor(
    (now.getTime() - lastUpdate.getTime()) / (TIME_CONSTANTS.DAY * 1000),
  );

  return diffInDays > config.ui.inactiveThresholdDays;
}

export function formatRepositoryInfo(
  repo: Repository,
  commitCount: number,
): FormattedRepository {
  const isInactive = isInactiveRepository(repo.updated_at);
  const hasLowCommits = commitCount <= config.ui.lowCommitThreshold;

  return {
    name: repo.full_name,
    description: repo.description || "(No description)",
    lastUpdated: formatTimeAgo(repo.updated_at),
    commitCount: commitCount.toString(),
    isInactive,
    hasLowCommits,
    language: repo.language || "Unknown",
    visibility: repo.private ? "Private" : "Public",
    url: repo.html_url,
    id: repo.id,
  };
}

function formatRepositoryDisplayName(repo: FormattedRepository): string {
  let name = repo.name;

  if (repo.isInactive) {
    name = chalk.yellow(name);
  }

  if (repo.hasLowCommits) {
    name = chalk.red(name);
  }

  return name;
}

export async function promptRepositorySelection(
  repositories: FormattedRepository[],
): Promise<FormattedRepository[]> {
  const { selectedRepos } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedRepos",
      message:
        "Select repositories to delete (space to select, enter to confirm):",
      choices: repositories.map((repo) => {
        const displayName = formatRepositoryDisplayName(repo);

        return {
          name: `${displayName} (Last updated: ${repo.lastUpdated}, Commits: ${repo.commitCount})`,
          value: repo,
          short: repo.name,
        };
      }),
      pageSize: 20,
    },
  ]);

  return selectedRepos;
}

export async function confirmDeletion(
  repositories: FormattedRepository[],
): Promise<boolean> {
  displayWarningMessage(repositories);

  const { confirmation } = await inquirer.prompt([
    {
      type: "input",
      name: "confirmation",
      message: `Type ${chalk.red.bold(config.cli.confirmationKeyword)} to confirm deletion:`,
      validate: (input: string) => {
        if (input === config.cli.confirmationKeyword) return true;
        return `You must type ${config.cli.confirmationKeyword} to proceed`;
      },
    },
  ]);

  return confirmation === config.cli.confirmationKeyword;
}

function displayWarningMessage(repositories: FormattedRepository[]): void {
  console.log(
    chalk.red.bold(
      "\n⚠️  WARNING: You are about to delete the following repositories:\n",
    ),
  );

  for (const repo of repositories) {
    console.log(`  - ${chalk.yellow(repo.name)}`);
  }

  console.log(chalk.red("\nThis action cannot be undone!"));
}

export function displayDeletionSummary(
  repositories: FormattedRepository[],
): void {
  console.log(chalk.green.bold("\n✅ Successfully deleted repositories:\n"));

  for (const repo of repositories) {
    console.log(`  - ${chalk.yellow(repo.name)}`);
  }

  console.log("");
}
