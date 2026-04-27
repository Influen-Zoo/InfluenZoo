# Social Media API Setup

This guide explains how to configure automatic metric fetching when a user connects Instagram, Facebook, or YouTube from the profile page.

The app stores these values in `User.socialMediaAccounts`:

| Platform | Stored follower field | Stored content field |
| --- | --- | --- |
| Instagram | `followers` | `posts` |
| Facebook | `followers` | `posts` |
| YouTube | `followers` as subscribers | `videos` as videos/shorts |

The frontend only sends platform, handle/name, and URL. The backend fetches metrics before saving.

## Environment Variables

Add these values to `backend/.env`:

```env
YOUTUBE_API_KEY=your_youtube_data_api_key
META_ACCESS_TOKEN=your_meta_graph_api_access_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_or_creator_account_id
```

Never commit real API keys or tokens.

After changing `backend/.env`, restart the backend:

```bash
docker compose restart backend
```

For the dev compose file:

```bash
docker compose -f docker-compose.dev.yml restart backend
```

If you changed dependencies or rebuilt containers:

```bash
docker compose up -d --build backend
```

## YouTube Setup

The backend uses the YouTube Data API `channels.list` endpoint with `part=snippet,statistics`.

It can resolve channels from:

- Channel ID, for example `UC...`
- Handle, for example `@GoogleDevelopers`
- Channel URL, for example `https://youtube.com/@GoogleDevelopers`
- Legacy username, where supported

Setup steps:

1. Go to Google Cloud Console.
2. Create or select a project.
3. Enable **YouTube Data API v3**.
4. Create an API key under **APIs & Services > Credentials**.
5. Put the key in `backend/.env` as `YOUTUBE_API_KEY`.
6. Restrict the key for production:
   - API restriction: YouTube Data API v3.
   - Application restriction: server IPs if your deployment has fixed outbound IPs.

What is fetched:

- `statistics.subscriberCount` -> saved as `followers`
- `statistics.videoCount` -> saved as `videos`
- `snippet.title` -> saved as `accountName`
- channel `id` -> saved as `accountId`

Important notes:

- YouTube may return rounded public subscriber counts depending on channel display policy.
- The app stores YouTube videos and shorts together because the public channel statistics field is `videoCount`.

Official docs: https://developers.google.com/youtube/v3/docs/channels/list

## Instagram Setup

The backend uses Meta Graph API Business Discovery:

```text
GET https://graph.facebook.com/v19.0/{INSTAGRAM_BUSINESS_ACCOUNT_ID}
  ?fields=business_discovery.username({targetUsername}){id,username,name,followers_count,media_count}
  &access_token={META_ACCESS_TOKEN}
```

Setup steps:

1. Create a Meta app at Meta for Developers.
2. Add the Instagram Graph API / Graph API products needed for your app.
3. Use a Facebook Page connected to an Instagram Business or Creator account.
4. Get the connected Instagram Business Account ID.
5. Generate a Meta access token with the required permissions.
6. Put the values in `backend/.env`:
   - `META_ACCESS_TOKEN`
   - `INSTAGRAM_BUSINESS_ACCOUNT_ID`

Required account conditions:

- The account represented by `INSTAGRAM_BUSINESS_ACCOUNT_ID` must be an Instagram Business or Creator account.
- The target account being looked up should be a public Instagram Business or Creator account.
- Private and personal Instagram accounts are not available through this official API flow.

Typical permissions needed:

- `instagram_basic`
- `instagram_manage_insights`
- `pages_read_engagement` or `pages_show_list`

Depending on app mode and token type, Meta may require app review before production users can fetch this data.

What is fetched:

- `followers_count` -> saved as `followers`
- `media_count` -> saved as `posts`
- `username` / `name` -> saved as `accountName`
- `id` -> saved as `accountId`

## Facebook Setup

The backend fetches Facebook Page metrics through Meta Graph API:

```text
GET https://graph.facebook.com/v19.0/{pageIdOrUsername}
  ?fields=id,name,followers_count,fan_count,posts.limit(0).summary(true)
  &access_token={META_ACCESS_TOKEN}
```

Setup steps:

1. Use the same Meta app/token setup described for Instagram.
2. Ensure the token can read the target Page metadata/engagement.
3. Put the token in `backend/.env` as `META_ACCESS_TOKEN`.
4. In the app UI, enter a Facebook Page URL or Page username.

What is fetched:

- `followers_count`, falling back to `fan_count` -> saved as `followers`
- `posts.summary.total_count` -> saved as `posts`
- `name` -> saved as `accountName`
- `id` -> saved as `accountId`

Important notes:

- Facebook access differs for Pages, profiles, public Pages, app mode, and reviewed permissions.
- If `followers_count` is not available for a Page/token combination, the app falls back to `fan_count`.
- Post totals may be limited by Graph API permissions and Page visibility.

## Local Verification

Restart the backend after setting env vars, then connect an account from:

```text
Profile > Connect Social Media Account
```

Expected behavior:

- The modal shows `Fetching Metrics...`.
- On success, the connected account appears with fetched counts.
- On missing credentials, the backend returns a setup error such as:

```text
YOUTUBE_API_KEY is required to fetch YouTube metrics
META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID are required to fetch Instagram metrics
META_ACCESS_TOKEN is required to fetch Facebook metrics
```

## API Response Shape

The connect endpoint is:

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
        "followers": 1230000,
        "posts": 0,
        "videos": 6400,
        "lastSyncedAt": "2026-04-27T00:00:00.000Z"
      }
    ]
  }
}
```

## Troubleshooting

`YOUTUBE_API_KEY is required`

The backend process does not have `YOUTUBE_API_KEY`. Add it to `backend/.env` and restart the backend container.

`Unable to find YouTube channel`

Use a full channel URL, a valid `@handle`, or the channel ID that starts with `UC`.

`META_ACCESS_TOKEN is required`

The backend process does not have a Meta token. Add `META_ACCESS_TOKEN` to `backend/.env` and restart.

`META_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID are required`

Instagram Business Discovery needs both your Meta token and the IG Business/Creator account ID that performs the lookup.

`Unable to fetch Instagram metrics`

Check that:

- The target Instagram account is public.
- The target Instagram account is Business or Creator, not personal.
- Your token has the required permissions.
- Your Meta app is in the right mode or has passed app review for production use.

`Unable to fetch Facebook metrics`

Check that:

- The URL/handle points to a Facebook Page, not a personal profile.
- The token has Page metadata/engagement access.
- The Page is visible to the token/app.

## Current Code Locations

- Backend metrics fetcher: `backend/services/common/socialMediaStats.service.js`
- Backend connect flow: `backend/services/common/user.service.js`
- Backend route: `backend/routes/common/user.routes.js`
- Frontend profile modal: `frontend/src/pages/UserProfile.jsx`
- Frontend API client: `frontend/src/services/api.js`
