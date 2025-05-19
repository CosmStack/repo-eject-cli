# Repo Eject CLI

A command-line interface (CLI) tool designed to help you find and delete old or inactive GitHub repositories. This tool makes it easy to manage and clean up your GitHub account by identifying repositories that haven't been active for a while.

## Features

- Find inactive repositories based on customizable criteria
- Interactive CLI interface for repository selection
- Safe deletion process with confirmation steps
- GitHub API integration
- Colorful and user-friendly terminal output

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- GitHub Personal Access Token (with `repo` scope)

## Installation

```bash
# Using npm
npm install -g @cosmstack/repoeject

# Using yarn
yarn global add @cosmstack/repoeject
```

For development:

```bash
# Clone the repository
git clone https://github.com/CosmStack/repo-eject-cli.git

# Install dependencies
cd repo-eject-cli
npm install

# Build the project
npm run build

# Link the package locally
npm link
```

## Configuration

Create a GitHub Personal Access Token:
- Go to GitHub Settings > Developer Settings > Personal Access Tokens
- Generate a new token with `repo` scope
- Copy the token

## Usage

```bash
# Basic usage
repoeject

# Show help
repoeject --help
```

## Available Commands

The CLI will guide you through an interactive process to:
1. List your repositories
2. Filter inactive repositories
3. Select repositories for deletion
4. Confirm and execute deletion

## Development

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Run in development mode
npm run dev
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using conventional commits (`npx cz`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). You can use the following commands to create properly formatted commits:

```bash
# Stage your changes
git add .

# Commit using commitizen
npm run commit
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
