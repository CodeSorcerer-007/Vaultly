# Vaultly — Private Document Vault

A private cloud storage app: sign in, upload documents, search them instantly,
and get AI summaries — all installable straight to your phone's home screen.

**Stack:** Next.js 14 · Supabase (auth + database + file storage) · Groq (AI
summaries) · Tailwind CSS

---

## 1. One-time Supabase setup (5 min)

1. Open your Supabase project → **SQL Editor** → **New query**
2. Open `supabase-setup.sql` in this folder, copy the whole file, paste it in, click **Run**
   - This creates the `files` table, locks it down so users only see their own files, and creates the private `documents` storage bucket with matching security rules.

## 2. Local setup (10 min)

You'll need [Node.js](https://nodejs.org) installed (v18 or newer).

```bash
# 1. Unzip this project and open a terminal inside it
cd private-cloud

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.local.example .env.local
```

Now open `.env.local` and fill in the four values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API Keys (publishable key) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys (secret key) |
| `GROQ_API_KEY` | console.groq.com → API Keys |

Then run it:

```bash
npm run dev
```

Open **http://localhost:3000** — you should land on the sign-in page. Click
"Create one" to make an account, confirm the email Supabase sends you, sign
in, and try uploading a file.

## 3. Deploy it live (10 min)

```bash
# From inside the project folder
git init
git add .
git commit -m "Initial commit"
```

1. Create a new repository on **GitHub** (github.com/new), don't initialize it with a README
2. Follow GitHub's instructions to push your existing repo:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/vaultly.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **vercel.com** → **Add New Project** → import your `vaultly` repo
4. Before deploying, expand **Environment Variables** and add the same four values from your `.env.local`
5. Click **Deploy**

In about a minute you'll get a live URL like `vaultly-yourname.vercel.app` —
that's what you open on your phone and "Add to Home Screen."

---

## How it works (for your interview walkthrough)

- **Auth:** Supabase handles sign-up/sign-in and issues a session cookie, refreshed automatically by Next.js middleware on every request.
- **Storage security:** every file lives in a private bucket at `documents/{userId}/...`. Row Level Security policies (in `supabase-setup.sql`) mean the database physically cannot return another user's files, even if the API were misused — it's enforced at the Postgres level, not just in app code.
- **Search:** instant client-side filtering by filename as you type — no server round-trip, so it feels immediate.
- **AI summaries:** clicking the sparkle icon sends the file's extracted text to Groq's API (server-side, so the API key never reaches the browser), which returns a plain-language summary in a few seconds.
- **Installable:** the manifest + service worker let anyone "Add to Home Screen" on mobile — it opens full-screen like a native app, no App Store needed.

## Troubleshooting

- **"Failed to fetch" on upload:** double check your `.env.local` values match Supabase exactly, and that you ran `supabase-setup.sql`.
- **Summarize button missing:** it only shows for `.pdf`, `.txt`, and `.md` files — other types aren't text-extractable yet.
- **Confirmation email not arriving:** check spam, or in Supabase → Authentication → Providers, you can temporarily disable "Confirm email" for faster testing.
