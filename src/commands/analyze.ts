import ora from 'ora';
import chalk from 'chalk';
import { fetchUserRepositories, fetchRepositoryCommits } from '../utils/github.js';
import { formatRepositoryInfo, promptRepositorySelection } from '../utils/ui.js';
import type { FormattedRepository } from '../types.js';

/**
 * Analyze repositories and let the user select which ones to delete
 */
export async function analyzeRepositories(): Promise<FormattedRepository[]> {
  // Step 1: Fetch all repositories for the user
  const repositories = await fetchUserRepositories();
  
  if (repositories.length === 0) {
    console.log(chalk.yellow('No repositories found for your account.'));
    return [];
  }
  
  // Step 2: Fetch commit information for each repository
  const spinner = ora('Analyzing repository activity...').start();
  const enhancedRepos: FormattedRepository[] = [];
  
  for (let i = 0; i < repositories.length; i++) {
    const repo = repositories[i];
    spinner.text = `Analyzing repository activity... (${i + 1}/${repositories.length}) ${repo.full_name}`;
    
    try {
      const commits = await fetchRepositoryCommits(repo.owner.login, repo.name);
      const formattedRepo = formatRepositoryInfo(repo, commits.length);
      enhancedRepos.push(formattedRepo);
    } catch (error)     {
      console.error(`Error analyzing ${repo.full_name}:`, error instanceof Error ? error.message : 'Unknown error');
    }
  }
  
  spinner.succeed(`Analyzed ${enhancedRepos.length} repositories`);
  
  // Step 3: Sort repositories by inactivity and low commit count
  const sortedRepos = enhancedRepos.sort((a, b) => {
    // First, sort by inactive status
    if (a.isInactive && !b.isInactive) return -1;
    if (!a.isInactive && b.isInactive) return 1;
    
    // Then by commit count (ascending)
    return Number.parseInt(a.commitCount) - Number.parseInt(b.commitCount);
  });
  
  // Step 4: Display repositories and let user select which ones to delete
  console.log(chalk.cyan('\nRepositories sorted by inactivity and low commit count:'));
  console.log(`${chalk.yellow('Yellow')} = Inactive (no updates for 6+ months)`);
  console.log(`${chalk.red('Red')} = Few commits (3 or fewer)\n`);
  
  return await promptRepositorySelection(sortedRepos);
}
