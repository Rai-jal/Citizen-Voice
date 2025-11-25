# Fix Git Secret Issue - URGENT

## Problem
A `.env` file with your OpenAI API key was committed to Git history. GitHub Push Protection is blocking all pushes.

## Solution: Remove Secret from Git History

### Step 1: Add .env to .gitignore (if not already there)
```bash
echo ".env" >> .gitignore
```

### Step 2: Remove .env from Git History
Run these commands in order:

```bash
# Go back to main branch
git checkout main

# Remove .env from git tracking (keeps local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from version control"

# Use BFG or filter-branch to purge from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to update remote (this rewrites history)
git push origin --force --all
```

### Alternative: Use BFG Repo-Cleaner (Recommended)
```bash
# Install BFG (if you have Homebrew)
brew install bfg

# Clone a fresh copy
cd ~/Desktop
git clone --mirror https://github.com/Rai-jal/Citizen-Voice.git

# Remove .env file from all commits
bfg --delete-files .env Citizen-Voice.git

# Cleanup and push
cd Citizen-Voice.git
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force
```

### Step 3: Verify .env is Ignored
```bash
cd ~/Desktop/citizenvoice
git status # .env should NOT appear

# If it shows up, add to .gitignore:
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Add .env to gitignore"
```

### Step 4: Push Again
```bash
# Create feature branch
git checkout -b feature/production-ready

# Push to GitHub
git push -u origin feature/production-ready
```

## Important Notes
1. **DO NOT commit .env files** - they contain secrets
2. Store secrets in Supabase Edge Function secrets instead
3. After this fix, all team members need to run: `git pull --rebase`
4. Consider rotating your OpenAI API key for security

## Need Help?
If you prefer, you can also:
1. Go to the GitHub block URL and click "Allow secret" (temporary, not recommended)
2. Or create a completely new repository and migrate code (without history)

