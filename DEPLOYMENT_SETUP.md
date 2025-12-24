# Deployment Setup Guide

## Overview

This guide will help you:
1. Deploy to `age-rules.admin.divine.video`
2. Set up automatic deployments from GitHub

## Prerequisites

- GitHub repository created
- Cloudflare account with Workers and D1 enabled
- Domain `divine.video` added to Cloudflare

## Part 1: Manual Deployment (First Time)

### 1. Verify wrangler.toml Configuration

Your `wrangler.toml` should have:
```toml
name = "divine-age-rules-db"
account_id = "c84e7a9bf7ed99cb41b8e73566568c75"

routes = [
  { pattern = "age-rules.admin.divine.video/*", zone_name = "divine.video" }
]

[[d1_databases]]
binding = "DB"
database_name = "divine-age-rules-db"
database_id = "9cc1dbf4-d559-4f1e-bf5f-0bbcceef306a"

[assets]
directory = "./admin-ui/dist"
```

✅ Already configured!

### 2. Deploy Database Migrations

First time only - create tables in production:
```bash
npm run db:migrate:prod
```

This runs: `wrangler d1 migrations apply divine-age-rules-db --remote`

### 3. Build and Deploy

```bash
# Build the admin UI
npm run build:admin

# Deploy to Cloudflare
npm run deploy
```

### 4. Import Data (First Time)

After deployment:
1. Visit `https://age-rules.admin.divine.video`
2. Go to Import/Export page
3. Upload each JSON file from `import-data/` in order (0-9)

---

## Part 2: Automatic Deployment from GitHub

### Step 1: Get Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use template: "Edit Cloudflare Workers"
4. Or create custom token with permissions:
   - Account > Workers Scripts > Edit
   - Account > Workers KV Storage > Edit (if using KV)
   - Account > D1 > Edit
   - Zone > Workers Routes > Edit
5. Copy the token (you'll only see it once!)

### Step 2: Add Secrets to GitHub

1. Go to your GitHub repo: `https://github.com/YOUR_USERNAME/social-media-age-rules-db`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

Add two secrets:

**Secret 1: CLOUDFLARE_API_TOKEN**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: `[paste your API token from Step 1]`

**Secret 2: CLOUDFLARE_ACCOUNT_ID**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: `c84e7a9bf7ed99cb41b8e73566568c75`

### Step 3: GitHub Actions Workflow

✅ Already created at `.github/workflows/deploy.yml`

This workflow:
- Triggers on every push to `main` branch
- Can also be triggered manually
- Installs dependencies
- Builds the admin UI
- Deploys to Cloudflare Workers

### Step 4: Test Automatic Deployment

```bash
# Make a small change
echo "# Auto-deploy test" >> README.md

# Commit and push
git add .
git commit -m "Test automatic deployment"
git push origin main
```

### Step 5: Monitor Deployment

1. Go to GitHub repo → **Actions** tab
2. You should see "Deploy to Cloudflare Workers" running
3. Click on it to see progress
4. When complete (✓ green checkmark), visit `https://age-rules.admin.divine.video`

---

## Part 3: DNS Setup (If Not Already Done)

### Check Current DNS

1. Go to Cloudflare Dashboard → `divine.video` domain
2. Click **DNS** → **Records**
3. Look for: `age-rules.admin.divine.video`

### If Record Doesn't Exist

You may need to add a CNAME or wait for Workers route to auto-create it.

**Option A: Workers Routes (Recommended)**

The route in `wrangler.toml` should automatically handle routing:
```toml
routes = [
  { pattern = "age-rules.admin.divine.video/*", zone_name = "divine.video" }
]
```

**Option B: Manual DNS Record**

If needed, add a DNS record:
- Type: `CNAME`
- Name: `age-rules.admin`
- Target: `divine-age-rules-db.YOUR_SUBDOMAIN.workers.dev`
- Proxy: ☁️ Proxied (Orange cloud)

---

## Part 4: Verify Deployment

### Check the Site

Visit: `https://age-rules.admin.divine.video`

You should see:
- ✅ Beautiful dashboard with gradient design
- ✅ Navigation sidebar with emoji icons
- ✅ Custom favicon (📜 with "13")
- ✅ Database statistics (if data imported)

### Check the API

Visit: `https://age-rules.admin.divine.video/api/jurisdictions`

You should see:
- ✅ JSON response with jurisdiction data
- Or empty array if no data imported yet

### Test Automatic Deployment

1. Make any change to the code
2. Push to GitHub
3. GitHub Actions deploys automatically
4. Changes appear on live site within 1-2 minutes

---

## Troubleshooting

### Deployment Fails

**Error: "Authentication error"**
- Check `CLOUDFLARE_API_TOKEN` secret is correct
- Verify token has Workers permissions

**Error: "Account ID not found"**
- Check `CLOUDFLARE_ACCOUNT_ID` secret matches wrangler.toml
- Your account ID: `c84e7a9bf7ed99cb41b8e73566568c75`

### Site Shows 404

**Check Workers Route:**
```bash
wrangler deployments list
```

**Verify route in Cloudflare:**
1. Dashboard → Workers & Pages
2. Click on `divine-age-rules-db`
3. Check **Triggers** tab → **Routes**
4. Should show: `age-rules.admin.divine.video/*`

### Database Empty

**Re-import data:**
1. Visit `https://age-rules.admin.divine.video/import-export`
2. Upload JSON files in order (0-9)
3. Check Import/Export page for errors

### Admin UI Not Loading

**Rebuild and redeploy:**
```bash
npm run build:admin
npm run deploy
```

**Check assets configuration:**
```toml
[assets]
directory = "./admin-ui/dist"
```

---

## Deployment Workflow Summary

### First Time Setup
1. ✅ Configure wrangler.toml (already done)
2. ✅ Run database migrations: `npm run db:migrate:prod`
3. ✅ Build UI: `npm run build:admin`
4. ✅ Deploy: `npm run deploy`
5. ✅ Import data via UI

### Automatic Deployments (After GitHub Setup)
1. ✅ Add Cloudflare secrets to GitHub
2. ✅ Push code to `main` branch
3. ✅ GitHub Actions builds and deploys automatically
4. ✅ Live site updates in 1-2 minutes

### Manual Deployments (Anytime)
```bash
npm run build:admin && npm run deploy
```

Or trigger manually in GitHub:
- Go to **Actions** tab
- Click "Deploy to Cloudflare Workers"
- Click "Run workflow" → "Run workflow"

---

## Security Notes

### Protected Endpoints

Consider adding Cloudflare Access to protect your admin UI:

1. Cloudflare Dashboard → Zero Trust → Access
2. Create Application
3. Add policies (e.g., email-based authentication)
4. Apply to `age-rules.admin.divine.video`

This ensures only authorized users can access the admin UI.

### Environment Variables

Never commit to GitHub:
- ✅ `.gitignore` already excludes `.env`, `.dev.vars`
- ✅ Secrets stored in GitHub Actions secrets
- ✅ Account ID is not sensitive (can be in wrangler.toml)

---

## Next Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add automatic deployment workflow"
   git push origin main
   ```

2. **Add GitHub secrets** (CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID)

3. **Watch first deployment** in GitHub Actions tab

4. **Visit live site**: `https://age-rules.admin.divine.video`

5. **Set up Cloudflare Access** for security (optional but recommended)

---

**You're ready to deploy! 🚀**
