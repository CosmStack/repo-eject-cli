import ora from "ora";
import chalk from "chalk";
import { deleteRepository } from "../utils/github";
import { confirmDeletion, displayDeletionSummary } from "../utils/ui";
import type { CliOptions, FailedDeletion, FormattedRepository } from "../types";

export async function deleteRepositories(
  repositories: FormattedRepository[],
  options: CliOptions = { dryRun: false, force: false },
): Promise<void> {
  const { dryRun = false, force = false } = options;

  if (repositories.length === 0) {
    console.log(chalk.yellow("No repositories selected for deletion."));
    return;
  }

  if (dryRun) {
    console.log(
      chalk.cyan(
        "\n🔍 DRY RUN MODE: No repositories will actually be deleted\n",
      ),
    );
  }

  if (!force) {
    const isConfirmed = await confirmDeletion(repositories);

    if (!isConfirmed) {
      console.log(chalk.yellow("\nDeletion cancelled."));
      return;
    }
  }

  const spinner = ora("Deleting repositories...").start();
  const successfullyDeleted: FormattedRepository[] = [];
  const failedToDelete: FailedDeletion[] = [];

  for (const repo of repositories) {
    const [owner, repoName] = repo.name.split("/");
    spinner.text = `Deleting repository ${chalk.yellow(repo.name)}...`;

    try {
      if (!dryRun) {
        await deleteRepository(owner, repoName);
      }
      successfullyDeleted.push(repo);
    } catch (error) {
      failedToDelete.push({
        repo,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  if (dryRun) {
    spinner.succeed(
      `Simulated deletion of ${repositories.length} repositories`,
    );
  } else {
    spinner.succeed(`Deleted ${successfullyDeleted.length} repositories`);
  }

  if (successfullyDeleted.length > 0) {
    displayDeletionSummary(successfullyDeleted);
  }

  if (failedToDelete.length > 0) {
    console.log(chalk.red.bold("\n❌ Failed to delete some repositories:\n"));

    for (const { repo, error } of failedToDelete) {
      console.log(`  - ${chalk.yellow(repo.name)}: ${error}`);
    }

    console.log("");
  }
}
