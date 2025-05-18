import { Octokit } from "@octokit/rest";
import inquirer from "inquirer";
import ora from "ora";
import { config } from "../config";
import type { Commit, Repository, TokenData, TokenResponse } from "../types";
import open from "open";
import http from "node:http";
import url from "node:url";
import { saveGitHubToken, getGitHubToken } from "./config-store";

let octokit: Octokit | null = null;

const oauthConfig = {
  clientId: "YOUR_CLIENT_ID",
  clientSecret: "YOUR_CLIENT_SECRET",
  scopes: ["delete_repo", "repo"],
  redirectUri: "http://localhost:3000/callback",
};

export function initGitHub(token: string): Octokit {
  octokit = new Octokit({
    auth: token,
    userAgent: "repoeject",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    baseUrl: "https://api.github.com",
  });

  return octokit;
}

export async function authenticateWithOAuth(): Promise<TokenData> {
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${oauthConfig.clientId}&scope=${oauthConfig.scopes.join(",")}&redirect_uri=${oauthConfig.redirectUri}`;

  console.log("Opening GitHub authorization page...");
  open(authUrl);

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const { pathname, query } = url.parse(req.url || "", true);

      if (pathname === "/callback" && query.code) {
        try {
          const tokenData = await exchangeCodeForToken(query.code as string);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(
            "<h1>Authentication successful!</h1><p>You can close this window and return to the CLI.</p>",
          );
          server.close();
          resolve(tokenData);
        } catch (error) {
          reject(error);
        }
      }
    });

    server.listen(3000);
  });
}

async function exchangeCodeForToken(code: string): Promise<TokenData> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      code,
      redirect_uri: oauthConfig.redirectUri,
    }),
  });

  const data: TokenResponse = await response.json();

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_in
      ? Date.now() + data.expires_in * 1000
      : undefined,
    tokenType: "oauth",
  };
}

export async function ensureAuthentication(): Promise<Octokit> {
  if (octokit) return octokit;

  let token = process.env.GITHUB_TOKEN;
  let tokenData: TokenData | undefined;

  if (!token) {
    token = await getGitHubToken();
  } else {
    if (token) {
      tokenData = {
        accessToken: token as string,
        tokenType: "pat",
      };
    }
  }

  if (!token) {
    const spinner = ora("No GitHub token found").start();
    spinner.info();

    const { authMethod } = await inquirer.prompt([
      {
        type: "list",
        name: "authMethod",
        message: "How would you like to authenticate?",
        choices: [
          {
            name: "Open browser for GitHub authorization",
            value: "oauth",
            disabled: !config.authMethods.oauth,
          },
          {
            name: "Enter personal access token manually",
            value: "token",
            disabled: !config.authMethods.token,
          },
        ],
      },
    ]);

    if (authMethod === "oauth") {
      tokenData = await authenticateWithOAuth();
      token = tokenData.accessToken;
    } else {
      const { inputToken } = await inquirer.prompt([
        {
          type: "password",
          name: "inputToken",
          message: "Enter your GitHub personal access token:",
          validate: (input: string) =>
            input.length > 0 ? true : "Token is required",
        },
      ]);
      token = inputToken;
      tokenData = {
        accessToken: token as string,
        tokenType: "pat",
      };
    }

    if (tokenData) {
      saveGitHubToken(tokenData);
    }
  }

  if (!token) throw new Error("GitHub token is required");

  return initGitHub(token);
}

export async function fetchUserRepositories(): Promise<Repository[]> {
  const github = await ensureAuthentication();
  const spinner = ora("Fetching your repositories...").start();

  try {
    const repos: Repository[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage && page <= config.github.maxPages) {
      const response = await github.repos.listForAuthenticatedUser({
        per_page: config.github.perPage,
        page,
        sort: "updated",
        direction: "asc",
      });

      repos.push(...(response.data as Repository[]));

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
    spinner.fail("Failed to fetch repositories");
    throw new Error(
      `GitHub API error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

export async function fetchRepositoryCommits(
  owner: string,
  repo: string,
): Promise<Commit[]> {
  const github = await ensureAuthentication();

  try {
    const response = await github.repos.listCommits({
      owner,
      repo,
      per_page: 100,
    });

    return response.data as Commit[];
  } catch (error) {
    if (
      error instanceof Error &&
      "status" in error &&
      (error.status === 409 || error.status === 404)
    ) {
      return [];
    }
    throw error;
  }
}

export async function deleteRepository(
  owner: string,
  repo: string,
): Promise<boolean> {
  const github = await ensureAuthentication();

  try {
    await github.repos.delete({
      owner,
      repo,
    });
    return true;
  } catch (error) {
    throw new Error(
      `Failed to delete repository ${owner}/${repo}: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
