#!/bin/bash

echo "🚀 Pushing deployment files to GitHub..."
echo ""

cd /Users/lizsw/divine-age-rules-db

# Initialize git if needed
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
  git remote add origin https://github.com/divinevideo/social-media-age-rules-db.git
  git branch -M main
else
  echo "Git already initialized ✓"
fi

# Pull any existing changes
echo "Pulling from GitHub..."
git pull origin main --allow-unrelated-histories || echo "No existing files to pull"

# Add all important files
echo ""
echo "Adding files..."
git add .github/workflows/deploy.yml
git add DEPLOYMENT_SETUP.md
git add DEPLOY_CHECKLIST.md
git add .gitignore
git add README.md
git add wrangler.toml
git add package.json
git add package-lock.json
git add tsconfig.json
git add src/
git add migrations/
git add admin-ui/src/
git add admin-ui/public/
git add admin-ui/package.json
git add admin-ui/package-lock.json
git add admin-ui/index.html
git add admin-ui/vite.config.ts
git add admin-ui/tailwind.config.js
git add admin-ui/tsconfig.json
git add admin-ui/postcss.config.js
git add import-data/*.json
git add import-data/*.py

# Show what will be committed
echo ""
echo "Files staged for commit:"
git status --short

echo ""
read -p "Ready to commit and push? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Commit
  git commit -m "Add GitHub Actions deployment workflow and update documentation

- Add automatic deployment via GitHub Actions
- Add deployment setup guide and checklist
- Include all source code and configuration files
- Ready for auto-deploy on push to main"

  # Push to GitHub
  echo ""
  echo "Pushing to GitHub..."
  git push -u origin main

  echo ""
  echo "✅ Done! Check your repo at:"
  echo "https://github.com/divinevideo/social-media-age-rules-db"
  echo ""
  echo "Next step: Add GitHub secrets for automatic deployment"
  echo "See DEPLOY_CHECKLIST.md for instructions"
else
  echo "Aborted. No changes pushed."
fi
