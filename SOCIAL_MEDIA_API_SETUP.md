# Social Media API Setup

This guide explains how to set up YouTube, Instagram, and Facebook API access so the app can automatically fetch social account counts when a user connects an account from the profile page.

---

## 🐣 Beginner's Guide: How to Setup & Fetch Data (Layman's Terms)

If you are new to this, don't worry! Here is the "Big Picture" of how we get social media numbers (like followers) into the app.

### 1. The Big Picture
Social media companies (Google/Meta) don't just let anyone see private data. You need a **"Secret Key"** (called an API Key) to ask them for information. 
1. You create a developer account on Google/Meta.
2. You get your **Secret Keys**.
3. You paste those keys into your app's hidden settings file (`.env`).
4. Once the keys are in, your users can click "Connect" in the app, and the app will automatically go and get their follower counts.

### 2. The 3 Steps to Success
Follow these three main milestones:

*   **Phase A: YouTube (Google)** - Easiest to start with. You'll create a project in "Google Cloud Console" and get a "Client ID".
*   **Phase B: Instagram & Facebook (Meta)** - A bit more complex. You need a "Meta for Developers" account and a Facebook "Business" page to act as the bridge.
*   **Phase C: The Secret Settings (.env)** - This is where you paste all your keys. Think of it as the "Brain" of your app where all the passwords live.

### 3. How to Test If It's Working
Once you have put your keys in the `backend/.env` file:
1. **Restart the App**: In your terminal, run `docker compose restart backend`.
2. **Log In as a User**: Open the app and log in to any account (or create a new one).
3. **Go to Profile**: Click on your profile name/icon.
4. **Click "Add Social Account"**: Choose a platform (like Instagram) and type in a username (e.g., `@cristiano`).
5. **Watch the Magic**: If the keys are correct, the app will spin for a second and then show the exact follower count it fetched from the API!

---

## What The App Fetches

The app stores these values in `User.socialMediaAccounts`:

| Platform | Stored follower field | Stored content count field |
| --- | --- | --- |
| Instagram | `followers` | count of `posts` |
| Facebook | `followers` | count of `posts` |
| YouTube | `subscribers` | count of `videos` as videos/shorts |

Developer note: older YouTube records may still have subscriber counts in `followers`. The UI falls back to that value for old data, but new YouTube connections save subscriber count in `subscribers`.

The frontend sends only the platform, account name/handle, and account URL. The backend calls the platform APIs and saves the fetched counts.

## Required Environment Variables

Add these values to `backend/.env`:

```env
YOUTUBE_API_KEY=your_youtube_data_api_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
YOUTUBE_OAUTH_REDIRECT_URI=https://your-domain.com/api/users/social-media/youtube/callback
API_PUBLIC_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
META_ACCESS_TOKEN=your_meta_graph_api_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_or_creator_account_id
```

Never commit real API keys or tokens.

After changing `backend/.env`, restart the backend:

```bash
docker compose restart backend
```

For local Docker dev:

```bash
docker compose -f docker-compose.dev.yml restart backend
```

If you changed dependencies or rebuilt images:

```bash
docker compose up -d --build backend
```

## YouTube API Setup

Use this for YouTube subscriber count and videos/shorts count for the YouTube channel owned by the logged-in app user.

The backend uses:

```text
YouTube Data API v3
channels.list
part=snippet,statistics
mine=true after Google OAuth consent
```

Official docs:

- YouTube Data API overview: https://developers.google.com/youtube/v3/getting-started
- API credentials: https://developers.google.com/youtube/registering_an_application
- `channels.list`: https://developers.google.com/youtube/v3/docs/channels/list

### Step-by-step

1. Go to Google Cloud Console:

   ```text
   https://console.cloud.google.com/
   ```

2. Sign in with the Google account you want to use for the project.

3. Create a project:

   ```text
   Top project selector > New Project
   ```

4. Give it a name, for example:

   ```text
   InfluenZoo Social API
   ```

5. Open:

   ```text
   APIs & Services > Library
   ```

6. Search for:

   ```text
   YouTube Data API v3
   ```

7. Click **Enable**.

8. Open:

   ```text
   APIs & Services > Credentials
   ```

9. First create an API key for public fallback lookups:

   ```text
   Create Credentials > API key
   ```

10. Copy the generated API key.

11. Add it to `backend/.env`:

   ```env
   YOUTUBE_API_KEY=AIza...
   ```

12. Restrict the key for production:

   ```text
   Credentials > Your API key > API restrictions > Restrict key
   ```

   Select:

   ```text
   YouTube Data API v3
   ```

13. Next create the OAuth client used when the logged-in user connects their own YouTube account:

   ```text
   Create Credentials > OAuth client ID
   ```

14. If Google asks for an OAuth consent screen first, configure it:

   - App name: `InfluenZoo`
   - User support email: your email
   - Developer contact email: your email
   - Scopes: add YouTube readonly scope when requested

15. Choose application type:

   ```text
   Web application
   ```

16. Add Authorized redirect URI:

   ```text
   https://your-domain.com/api/users/social-media/youtube/callback
   ```

   For local dev:

   ```text
   http://localhost:5000/api/users/social-media/youtube/callback
   ```

17. Copy:

   - Client ID
   - Client secret

18. Add them to `backend/.env`:

   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   YOUTUBE_OAUTH_REDIRECT_URI=https://your-domain.com/api/users/social-media/youtube/callback
   API_PUBLIC_URL=https://your-domain.com
   FRONTEND_URL=https://your-domain.com
   ```

19. Save changes and restart the backend.

### What Users Can Enter

For YouTube, users do not need to enter the channel URL manually. In the app, they click:

```text
Connect Social Media Account > YouTube > Connect Account
```

Then Google asks them to allow readonly YouTube access. After consent, the backend fetches the YouTube channel belonging to that Google account.

### What Gets Saved

- YouTube `statistics.subscriberCount` -> saved as `subscribers`
- YouTube `statistics.videoCount` -> saved as `videos`
- YouTube `snippet.title` -> saved as `accountName`
- YouTube channel `id` -> saved as `accountId`

Important:

- YouTube counts videos and shorts together in `videoCount`.
- Public subscriber count from YouTube Data API is rounded by YouTube.
- Use YouTube Data API v3 for this feature. YouTube Analytics API is for private analytics reports like views/watch time/subscribers gained over time. YouTube Reporting API is for bulk reporting jobs and is overkill here.

## Instagram API Setup (The "Business Discovery" Method)

Instagram is the most protective platform. You **cannot** just use a simple password to get data. Instead, we use a method called "Business Discovery." 

**Think of it like this:** You (the admin) create a "Business Bridge" using your own account. Once the bridge is built, the app can look up any public Instagram user's follower count.

### Phase 1: The Setup (Prerequisites)
Before you touch any code, you need these 3 things connected:
1.  **Instagram Business/Creator Account**: Go to your Instagram App > Settings > Account Type > Switch to Professional Account. (Personal accounts will not work).
2.  **A Facebook Page**: You must have a Facebook Page (it can be empty).
3.  **The Link**: Go to your Facebook Page > Settings > Linked Accounts > Connect your Instagram account there.

### Phase 2: Create your Meta "App"
1.  Go to the [Meta for Developers](https://developers.facebook.com/) site and log in.
2.  Click **My Apps** > **Create App**.
3.  Choose **"Other"** or **"Business"** as the use case.
4.  Give it a name like `InfluenZoo Data Fetcher`.
5.  Once created, look at the left sidebar and click **Add Product**. Find **"Instagram Graph API"** and click **Set Up**.

### Phase 3: Generate your Secret Token
This is the "Password" your backend will use.
1.  Open the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
2.  In the top right dropdown, select the **App** you just created.
3.  Under **Permissions**, add these four (IMPORTANT):
    *   `instagram_basic`
    *   `instagram_manage_insights`
    *   `pages_read_engagement`
    *   `pages_show_list`
4.  Click **Generate Access Token**. Follow the popups to log in and select your Page.
5.  **Copy the Token**: This is a short-lived token. To make it permanent, you usually need to use the [Access Token Tool](https://developers.facebook.com/tools/accesstoken/).

### Phase 4: Get your ID and Token into the App
You need two values for your `.env` file:

**1. The Instagram Business ID**:
In the Graph API Explorer, type this in the top bar and click Submit:
`me?fields=accounts{instagram_business_account}`
This will show a long number. **That is your `INSTAGRAM_BUSINESS_ACCOUNT_ID`**.

**2. The Access Token**:
Copy the long string of letters and numbers you generated in Phase 3. **That is your `META_ACCESS_TOKEN`**.

Add them to `backend/.env`:
```env
META_ACCESS_TOKEN=your_long_token_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_id_number_here
```

### What Users Can Enter
Once setup is complete, users just type their handle in the app:
*   `@cristiano` or `cristiano` or the full URL `https://instagram.com/cristiano`

### Important Limitations
*   **Public Only**: The API can only see Public accounts.
*   **Business/Creator Only**: The API can only see accounts that have switched to "Professional" mode in their Instagram settings.
*   **App Review**: While you are testing, it works for you. Before you launch to thousands of people, Meta requires an "App Review" (this is a separate process on their site).

12. Find the Facebook Page connected to your Instagram Business/Creator account.



## Facebook API Setup

Use this for Facebook Page followers count and post count.

The backend uses Meta Graph API:

```text
GET https://graph.facebook.com/v19.0/{pageIdOrUsername}
  ?fields=id,name,followers_count,fan_count,posts.limit(0).summary(true)
  &access_token={META_ACCESS_TOKEN}
```

Official docs:

- Graph API overview: https://developers.facebook.com/docs/graph-api/
- Pages API: https://developers.facebook.com/docs/pages-api/

### Step-by-step

If you already completed the Instagram setup, you can reuse the same Meta app and `META_ACCESS_TOKEN`.

1. Go to Meta for Developers:

   ```text
   https://developers.facebook.com/
   ```

2. Open your Meta app.

3. Make sure the app can use Graph API.

4. Generate or reuse a token with Page access permissions, commonly:

   ```text
   pages_read_engagement
   pages_show_list
   ```

5. If the Facebook Page is your own Page, confirm the Page appears from:

   ```text
   GET /me/accounts
   ```

6. Copy the access token.

7. Add it to `backend/.env`:

   ```env
   META_ACCESS_TOKEN=EAAB...
   ```

8. Restart the backend.

### What Users Can Enter

The app can look up Facebook by:

- Page URL: `https://facebook.com/pageName`
- Page username: `pageName`
- Page ID

Do not use a personal Facebook profile URL. This flow is for Pages.

### What Gets Saved

- Facebook `followers_count` -> saved as `followers`
- If `followers_count` is unavailable, `fan_count` is used as fallback
- `posts.summary.total_count` -> saved as count of `posts`
- Facebook Page `name` -> saved as `accountName`
- Facebook Page `id` -> saved as `accountId`

### Important Facebook Limitations

- Facebook profile counts are not available through this app flow.
- Page visibility and token permissions affect what data is returned.
- Some fields may require app review for production use.

## Verify Setup In The App

1. Restart the backend after setting env vars.

2. Open the app.

3. Go to:

   ```text
   Profile > Connect Social Media Account
   ```

4. Select platform:

   ```text
   Instagram / Facebook / YouTube
   ```

5. Enter account URL or handle.

6. Click:

   ```text
   Connect Account
   ```

7. Expected behavior:

   - Button shows `Fetching Metrics...`
   - Account appears in profile after success
   - Counts appear automatically

## API Response Example

Endpoint:

```text
POST /api/users/social-media/connect
```

Request body:

```json
{
  "platform": "youtube",
  "accountName": "@GoogleDevelopers",
  "accountUrl": "https://youtube.com/@GoogleDevelopers"
}
```

Successful response includes the updated user:

```json
{
  "success": true,
  "data": {
    "socialMediaAccounts": [
      {
        "platform": "youtube",
        "accountId": "UC_x5XG1OV2P6uZZ5FSM9Ttw",
        "accountName": "Google for Developers",
        "accountUrl": "https://youtube.com/@GoogleDevelopers",
        "followers": 0,
        "subscribers": 1230000,
        "posts": 0,
        "videos": 6400,
        "lastSyncedAt": "2026-04-27T00:00:00.000Z"
      }
    ]
  }
}
```

For YouTube, `subscribers` is the value shown in the UI. `followers` is kept as `0` for new YouTube connections.

## Common Errors And Fixes

`YOUTUBE_API_KEY is required`

Add `YOUTUBE_API_KEY` to `backend/.env`, then restart the backend.

`Unable to find YouTube channel`

Use a full channel URL, a valid `@handle`, or a channel ID that starts with `UC`.

`META_ACCESS_TOKEN is required`

Add `META_ACCESS_TOKEN` to `backend/.env`, then restart the backend.

`META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID are required`

Instagram needs both the Meta token and the Instagram Business/Creator account ID that performs the lookup.

`Unable to fetch Instagram metrics`

Check:

- The target Instagram account is public.
- The target account is Business or Creator.
- Your connected Instagram account is Business or Creator.
- Your token has the needed permissions.
- Your Meta app has app review approval if needed.

`Unable to fetch Facebook metrics`

Check:

- The URL/handle points to a Facebook Page, not a personal profile.
- The Page is visible to your app/token.
- Your token has Page permissions.
- Your Meta app has app review approval if needed.

## Current Code Locations

- Backend metrics fetcher: `backend/services/common/socialMediaStats.service.js`
- Backend connect flow: `backend/services/common/user.service.js`
- Backend route: `backend/routes/common/user.routes.js`
- Frontend profile modal: `frontend/src/pages/UserProfile.jsx`
- Frontend API client: `frontend/src/services/api.js`
