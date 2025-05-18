import ora from "ora";
import chalk from "chalk";
import { fetchUserRepositories, fetchRepositoryCommits } from "../utils/github";
import { formatRepositoryInfo, promptRepositorySelection } from "../utils/ui";
import type { FormattedRepository } from "../types";

export async function analyzeRepositories(): Promise<FormattedRepository[]> {
  const repositories = await fetchUserRepositories();

  if (repositories.length === 0) {
    console.log(chalk.yellow("No repositories found for your account."));
    return [];
  }

  const spinner = ora("Analyzing repository activity...").start();
  const enhancedRepos: FormattedRepository[] = [];

  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i];
    spinner.text = `Analyzing repository activity... (${i + 1}/${repositories.length}) ${repo.full_name}`;

    try {
      const commits = await fetchRepositoryCommits(repo.owner.login, repo.name);
      const formattedRepo = formatRepositoryInfo(repo, commits.length);
      enhancedRepos.push(formattedRepo);
    } catch (error) {
      console.error(
        `Error analyzing ${repo.full_name}:`,
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }

  spinner.succeed(`Analyzed ${enhancedRepos.length} repositories`);

  const sortedRepos = enhancedRepos.sort((a, b) => {
    if (a.isInactive && !b.isInactive) return -1;
    if (!a.isInactive && b.isInactive) return 1;

    return Number.parseInt(a.commitCount) - Number.parseInt(b.commitCount);
  });

  console.log(
    chalk.cyan("\nRepositories sorted by inactivity and low commit count:"),
  );
  console.log(
    `${chalk.yellow("Yellow")} = Inactive (no updates for 6+ months)`,
  );
  console.log(`${chalk.red("Red")} = Few commits (3 or fewer)\n`);

  return await promptRepositorySelection(sortedRepos);
}
