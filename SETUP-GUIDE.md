# Creative Generation — Cloudflare Pages Setup

## After deploying to Cloudflare Pages, do these two steps:

---

## STEP 1 — Create a GitHub Personal Access Token

1. Go to github.com → click your profile photo → Settings
2. Scroll to the bottom → click "Developer settings"
3. Click "Personal access tokens" → "Tokens (classic)"
4. Click "Generate new token (classic)"
5. Name it: Creative Generation
6. Set expiration: No expiration
7. Check the box: "repo" (full control of repositories)
8. Click "Generate token"
9. COPY THE TOKEN — you won't see it again!

---

## STEP 2 — Add Environment Variables in Cloudflare

1. Go to Cloudflare → Workers & Pages → your project
2. Click "Settings" → "Environment variables"
3. Add these two variables:

   GITHUB_TOKEN = (paste your token from Step 1)
   GITHUB_REPO  = yourgithubusername/creative-generation

4. Click Save
5. Go to "Deployments" → redeploy

---

## That's it! The admin panel is now fully working.

Crew members log in at: creativegeneration.kids/admin

Default passwords (change these!):
- xenia / creative2024
- lulu / creative2024
- martina / creative2024
- lili / creative2024
- theo / creative2024
- melody / creative2024
- admin / cgadmin2024

To change passwords, edit the CREW object in /admin/index.html
