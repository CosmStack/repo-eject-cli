# 🚀 Repo Eject CLI

> **Early Stage Project** - This is an MVP tool with core functionality implemented. See [Roadmap](#roadmap) for planned features.

A command-line tool that helps developers clean up their GitHub accounts by finding and safely removing old or inactive repositories. Perfect for developers with cluttered GitHub profiles who want to maintain a clean, professional presence.

## ✨ Why Use Repo Eject?

- **Declutter your GitHub profile** - Remove old experiments, abandoned projects, and inactive forks
- **Safe by default** - Interactive prompts and dry-run mode prevent accidental deletions
- **Time-saving** - Quickly identify inactive repositories instead of manually browsing through dozens of repos
- **Professional presence** - Keep only your best work visible to potential employers and collaborators

## 🎯 Current Features

- ✅ **Repository Analysis** - Automatically scan and list your GitHub repositories
- ✅ **Interactive Selection** - Choose which repositories to delete through a user-friendly CLI
- ✅ **Safe Deletion** - Confirmation prompts and dry-run mode for safety
- ✅ **GitHub API Integration** - Secure authentication with personal access tokens
- ✅ **Colorful Output** - Clear, readable terminal interface

## 📋 Prerequisites

- **Node.js** v18 or higher
- **GitHub Personal Access Token** with `repo` scope ([How to create one](#github-token-setup))

## 🚀 Quick Start

### Installation

```bash
# Install globally via npm
npm install -g @cosmstack/repoeject

# Or with yarn
yarn global add @cosmstack/repoeject
```

### GitHub Token Setup

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select the `repo` scope (full control of private repositories)
4. Copy the generated token

### Usage

```bash
# Run the interactive CLI
repoeject

# Dry run (see what would be deleted without actually deleting)
repoeject --dry-run

# Skip confirmation prompts (use with caution!)
repoeject --force

# Show help
repoeject --help
```

The CLI will guide you through:
1. **Authentication** - Enter your GitHub token when prompted
2. **Repository Scanning** - Automatically fetch and analyze your repositories
3. **Selection** - Choose which repositories to delete from an interactive list
4. **Confirmation** - Review and confirm your selections before deletion

## 🛠️ Development

### Local Setup

```bash
# Clone the repository
git clone https://github.com/CosmStack/repo-eject-cli.git
cd repo-eject-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link for local development
npm link

# Run in development mode
npm run dev
```

### Available Scripts

```bash
npm run type-check    # TypeScript type checking
npm run lint          # Code linting
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Biome
npm run build         # Build for production
npm run dev           # Run in development mode
```

## 🚧 Roadmap

This project is in active development. Planned features include:

- [ ] **Advanced Filtering** - Filter by last commit date, stars, language, etc.
- [ ] **Bulk Operations** - Select repositories by criteria (e.g., "all forks older than 1 year")
- [ ] **Repository Backup** - Export repository metadata before deletion
- [ ] **Undo Functionality** - Restore recently deleted repositories (if possible)
- [ ] **Configuration File** - Save preferences and filtering rules
- [ ] **Repository Analytics** - Detailed insights about your repository portfolio

## 🤝 Contributing

We welcome contributions! This project uses [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

```bash
# 1. Fork and clone the repository
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes and commit using conventional commits
git add .
npx cz  # Interactive commit message helper

# 4. Push and create a Pull Request
git push origin feature/amazing-feature
```

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⚠️ Important**: Always review the repositories selected for deletion. This tool permanently removes repositories from GitHub.

Made with ❤️ by [CosmStack](https://github.com/CosmStack)

</div>
