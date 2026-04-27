# Social Media API Setup

This guide explains how to set up YouTube, Instagram, and Facebook API access so the app can automatically fetch social account counts when a user connects an account from the profile page.

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

## Instagram API Setup

Use this for Instagram followers count and post count.

Instagram public account stats are not available with a simple API key. Meta requires an app, a Facebook Page, an Instagram Business or Creator account, and an access token.

The backend uses Meta Graph API Business Discovery:

```text
GET https://graph.facebook.com/v19.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}
  ?fields=business_discovery.username({targetUsername}){id,username,name,followers_count,media_count}
  &access_token={META_ACCESS_TOKEN}
```

Official docs:

- Instagram Graph API: https://developers.facebook.com/docs/instagram-api/
- Business Discovery: https://developers.facebook.com/docs/instagram-api/guides/business-discovery/

### Before You Start

You need:

- A Facebook account
- A Meta Developer account
- A Facebook Page
- An Instagram Business or Creator account connected to that Facebook Page
- A Meta app
- A Meta access token

Personal Instagram accounts will not work for this API flow.

### Step-by-step

1. Convert your Instagram account to Business or Creator:

   ```text
   Instagram app > Settings and privacy > Account type and tools
   ```

2. Create or use a Facebook Page.

3. Connect the Instagram account to the Facebook Page:

   ```text
   Facebook Page settings > Linked accounts > Instagram
   ```

4. Go to Meta for Developers:

   ```text
   https://developers.facebook.com/
   ```

5. Create a Meta app:

   ```text
   My Apps > Create App
   ```

6. Choose an app type suitable for your use case. For most dashboard/server API testing, choose a business-style app if available in your Meta account.

7. Add products/features needed for Instagram Graph API access.

8. Open Graph API Explorer:

   ```text
   https://developers.facebook.com/tools/explorer/
   ```

9. Select your Meta app from the app dropdown.

10. Generate a user access token with permissions such as:

   ```text
   instagram_basic
   instagram_manage_insights
   pages_read_engagement
   pages_show_list
   ```

   Meta may show slightly different permission names depending on app mode and product setup.

11. Use the token to list your Facebook Pages:

   ```text
   GET /me/accounts
   ```

12. Find the Facebook Page connected to your Instagram Business/Creator account.

13. Get the Instagram Business Account ID from that Page:

   ```text
   GET /{page-id}?fields=instagram_business_account
   ```

14. Copy:

   - the access token
   - the Instagram Business Account ID

15. Add them to `backend/.env`:

   ```env
   META_ACCESS_TOKEN=EAAB...
   INSTAGRAM_BUSINESS_ACCOUNT_ID=1784...
   ```

16. Restart the backend.

### What Users Can Enter

The app can look up Instagram by:

- Account URL: `https://instagram.com/username`
- Username/handle: `username` or `@username`

### What Gets Saved

- Instagram `followers_count` -> saved as `followers`
- Instagram `media_count` -> saved as count of `posts`
- Instagram `username` / `name` -> saved as `accountName`
- Instagram `id` -> saved as `accountId`

### Important Instagram Limitations

- Target accounts should be public Business or Creator accounts.
- Private accounts will not work.
- Personal Instagram accounts usually will not work.
- For production users, Meta may require app review before data can be fetched reliably outside developer/test users.

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
