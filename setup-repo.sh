#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=== Coaching Content Repository Setup Script ==="

# 1. Install Node Dependencies
echo "Installing node dependencies..."
npm install

# 2. Local Verification Build
echo "Verifying build locally..."
npm run build
echo "Build succeeded. Output is located in dist/"

# 3. Initialize Git Repository
echo "Initializing local Git repository..."
git init -b main
git add .
git commit -m "feat(root): scaffold Vite MPA hub and AI token economy presentation"

# Instructions for linking to GitHub
echo ""
echo "======================================================================"
echo "Next Steps to link and deploy to GitHub:"
echo "======================================================================"
echo "Ensure you have the GitHub CLI (gh) installed and authenticated:"
echo "  gh auth login"
echo ""
echo "1. Create the public repository on GitHub and push the code:"
echo "  gh repo create coaching-content --public --source=. --remote=origin --push"
echo ""
echo "2. Configure the GitHub Pages source to use GitHub Actions:"
echo "  gh api repos/{owner}/coaching-content/pages -X POST -F build_type=workflow"
echo "  (Note: Replace '{owner}' with your GitHub username/organization)"
echo ""
echo "3. Visit the Actions tab on GitHub to monitor the deploy workflow."
echo "   Your presentations will live at: https://{owner}.github.io/coaching-content/"
echo "======================================================================"
