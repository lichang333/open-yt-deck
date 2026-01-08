# Maintenance Guide 🛠️

## Why do channels stop working?

YouTube Live Stream IDs (the part after `v=` in the URL) are often **not permanent**. 
- Some 24/7 channels run for months with the same ID.
- Others restart their stream weekly or daily (e.g., News channels).
- When a stream restarts, it gets a **new Video ID**. The old one becomes an archived video or is deleted.

## How to Update Channels

### Option 1: Manual Update (Easiest)
1.  Go to the YouTube Channel (e.g., [Sky News](https://www.youtube.com/skynews)).
2.  Click the "Live" tab or look for the video marked "LIVE NOW".
3.  Click the video.
4.  Copy the ID from the URL: `youtube.com/watch?v=VIDEO_ID`.
5.  Update `src/data/channels.js`.

### Option 2: Command Line (Semi-Automated)
You can use tools like `yt-dlp` to fetch the current live ID for a channel URL.

```bash
# Get current live ID for Sky News
yt-dlp --print id "https://www.youtube.com/@SkyNews/live"
```

You could write a script to run this for all channels and generate a new `channels.js`.

### Option 3: YouTube Data API (Fully Automated)
If you want to build an auto-updater, you can use the YouTube Data API.

**Endpoint:** `search.list`
**Parameters:**
- `part`: snippet
- `channelId`: [Channel ID]
- `eventType`: live
- `type`: video
- `key`: [Your API Key]

**Response:** Will contain the current `videoId` for the live broadcast.

*Note: This requires an API Key and has usage quotas.*
