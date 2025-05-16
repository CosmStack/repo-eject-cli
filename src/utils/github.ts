import { Octokit } from '@octokit/rest';
import inquirer from 'inquirer';
import ora from 'ora';
import { config } from '../config.js';
import type { Commit, Repository } from '../types.js';
import open from 'open';
import http from 'node:http';
import url from 'node:url';

let octokit: Octokit | null = null;

// Add GitHub OAuth configuration
const oauthConfig = {
  clientId: 'YOUR_CLIENT_ID', // Register your app on GitHub
  clientSecret: 'YOUR_CLIENT_SECRET',
  scopes: ['delete_repo', 'repo'],
  redirectUri: 'http://localhost:3000/callback',
};

/**
 * Initialize GitHub API client with authentication
 */
export function initGitHub(token: string): Octokit {
  octokit = new Octokit({
    auth: token,
    userAgent: 'deadrepos-cli',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    baseUrl: 'https://api.github.com',
  });
  
  return octokit;
}

/**
 * Authenticate using GitHub OAuth flow
 */
export async function authenticateWithOAuth(): Promise<string> {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.clientId}&scope=${oauthConfig.scopes.join(',')}&redirect_uri=${oauthConfig.redirectUri}`;
  
  console.log('Opening GitHub authorization page...');
  open(authUrl);
  
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const { pathname, query } = url.parse(req.url || '', true);
      
      if (pathname === '/callback' && query.code) {
        // Exchange code for token
        try {
          const token = await exchangeCodeForToken(query.code as string);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication successful!</h1><p>You can close this window and return to the CLI.</p>');
          server.close();
          resolve(token);
        } catch (error) {
          reject(error);
        }
      }
    });
    
    server.listen(3000);
  });
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code: string): Promise<string> {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      code,
      redirect_uri: oauthConfig.redirectUri
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

/**
 * Ensure GitHub authentication is set up
 */
export async function ensureAuthentication(): Promise<Octokit> {
  // If already authenticated, return the instance
  if (octokit) return octokit;
  
  // Check for token in environment variables
  let token = process.env.GITHUB_TOKEN;
  
  // If no token found, offer OAuth authentication
  if (!token) {
    const spinner = ora('No GitHub token found in environment').start();
    spinner.info();
    
    const { authMethod } = await inquirer.prompt([
      {
        type: 'list',
        name: 'authMethod',
        message: 'How would you like to authenticate?',
        choices: [
          { name: 'Open browser for GitHub authorization', value: 'oauth' },
          { name: 'Enter personal access token manually', value: 'token' }
        ]
      }
    ]);
    
    if (authMethod === 'oauth') {
      token = await authenticateWithOAuth();
    } else {
      const { inputToken } = await inquirer.prompt([
        {
          type: 'password',
          name: 'inputToken',
          message: 'Enter your GitHub personal access token:',
          validate: (input: string) => input.length > 0 ? true : 'Token is required'
        }
      ]);
      token = inputToken;
    }
  }
  
  if (!token) throw new Error('GitHub token is required');
  
  return initGitHub(token);
}

/**
 * Fetch all repositories for the authenticated user
 */
export async function fetchUserRepositories(): Promise<Repository[]> {
  const github = await ensureAuthentication();
  const spinner = ora('Fetching your repositories...').start();
  
  try {
    const repos: Repository[] = [];
    let page = 1;
    let hasNextPage = true;
    
    while (hasNextPage && page <= config.github.maxPages) {
      const response = await github.repos.listForAuthenticatedUser({
        per_page: config.github.perPage,
        page,
        sort: 'updated',
        direction: 'asc'
      });
      
      repos.push(...response.data as Repository[]);
      
      // Check if there are more pages
      if (response.data.length < config.github.perPage) {
        hasNextPage = false;
      } else {
        page++;
      }
      
      spinner.text = `Fetching your repositories... (${repos.length} found)`;
    }
    
    spinner.succeed(`Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    spinner.fail('Failed to fetch repositories');
    throw new Error(`GitHub API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch commits for a repository to determine activity
 */
export async function fetchRepositoryCommits(owner: string, repo: string): Promise<Commit[]> {
  const github = await ensureAuthentication();
  
  try {
    const response = await github.repos.listCommits({
      owner,
      repo,
      per_page: 100
    });
    
    return response.data as Commit[];
  } catch (error) {
    // If repository is empty, it will return a 409 error
    if (error instanceof Error && ('status' in error && (error.status === 409 || error.status === 404))) {
      return [];
    }
    throw error;
  }
}

/**
 * Delete a repository
 */
export async function deleteRepository(owner: string, repo: string): Promise<boolean> {
  const github = await ensureAuthentication();
  
  try {
    await github.repos.delete({
      owner,
      repo
    });
    return true;
  } catch (error) {
    throw new Error(`Failed to delete repository ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
