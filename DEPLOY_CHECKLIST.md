# Deployment Checklist

## Quick Reference - Do This:

### 1️⃣ First Time Manual Deployment

```bash
# Apply database schema to production
npm run db:migrate:prod

# Build admin UI
npm run build:admin

# Deploy to Cloudflare
npm run deploy

# Visit the site
open https://age-rules.admin.divine.video
```

Then import data via the UI (Import/Export page).

---

### 2️⃣ Set Up Automatic GitHub Deployments

#### A. Get Cloudflare API Token
1. Visit: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers"
4. Copy the token

#### B. Add GitHub Secrets
1. Go to: `https://github.com/YOUR_USERNAME/social-media-age-rules-db/settings/secrets/actions`
2. Add two secrets:
   - Name: `CLOUDFLARE_API_TOKEN` → Value: [your token]
   - Name: `CLOUDFLARE_ACCOUNT_ID` → Value: `c84e7a9bf7ed99cb41b8e73566568c75`

#### C. Push to GitHub
```bash
git add .
git commit -m "Add deployment workflow"
git push origin main
```

#### D. Watch It Deploy
1. Go to GitHub → Actions tab
2. See "Deploy to Cloudflare Workers" running
3. Wait for ✅ green checkmark
4. Visit: https://age-rules.admin.divine.video

---

### 3️⃣ Future Deployments

**Automatic**: Just push to `main` branch
```bash
git add .
git commit -m "Your changes"
git push origin main
```

**Manual**: Trigger in GitHub Actions or run locally
```bash
npm run build:admin && npm run deploy
```

---

## Configuration Already Done ✅

- ✅ `wrangler.toml` configured for `age-rules.admin.divine.video`
- ✅ D1 database ID set
- ✅ GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- ✅ `.gitignore` configured properly
- ✅ Build scripts in `package.json`

---

## What Happens When You Deploy

1. **Build**: Admin UI compiled (React → static files)
2. **Upload**: Worker code + UI assets → Cloudflare edge
3. **Route**: `age-rules.admin.divine.video/*` → your Worker
4. **Live**: Site accessible worldwide via Cloudflare CDN

---

## URLs

- **Live Site**: https://age-rules.admin.divine.video
- **API Base**: https://age-rules.admin.divine.video/api
- **Dashboard**: https://age-rules.admin.divine.video/ (root)
- **Import**: https://age-rules.admin.divine.video/import-export

---

See `DEPLOYMENT_SETUP.md` for detailed instructions and troubleshooting.
