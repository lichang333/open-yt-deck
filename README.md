# 📺 Open YT-Deck

**Turn your browser into a premium TV experience.**

`Open YT-Deck` is a sleek, keyboard-driven web application designed to replicate the experience of watching cable TV, powered by YouTube Live streams. It features a stunning, immersive On-Screen Display (OSD), smooth channel switching, and distraction-free viewing.

![Preview Placeholder](docs/screenshot.png)

## ✨ Features

*   **Premium TV Interface**:
    *   **Immersive OSD**: A glassmorphism-styled information bar shows Channel Logo, Name, Category, and Live Status.
    *   **Dynamic Visuals**: High-contrast, easy-to-read text with drop shadows and gradients, perfect for any video background.
    *   **Auto-Hiding**: Controls fade away automatically to keep your view unobstructed.
*   **⌨️ Keyboard Control System**:
    *   **`↑` / `→`**: Next Channel
    *   **`↓` / `←`**: Previous Channel
    *   **`M`**: Mute / Unmute
    *   **`F`**: Toggle Fullscreen
    *   **`Space`**: Show/Hide Info (OSD)
    *   **Number Keys (`1`-`9`)**: Quick jump to channel (if implemented)
*   **📡 Smart Channel Management**:
    *   **Auto-Icon Fetcher**: Built-in script automatically scrapes and updates channel logos from YouTube.
    *   **Pre-configured Lineup**: Includes curated News, Music, and Science channels (Bloomberg, Sky News, Lofi Girl, NASA, etc.).

## 🚀 Getting Started

### Prerequisites

*   **Node.js** (v18+)
*   **npm**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/open-yt-deck.git
    cd open-yt-deck
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the app**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` to start watching.

4.  **Build for Production**
    ```bash
    npm run build
    ```

## 🛠 Channel Management

### Adding / Editing Channels

Modify `src/data/channels.js` to manage your lineup. The structure is simple:

```javascript
export const channels = [
    {
        id: 1,
        name: "Channel Name",
        videoId: "VIDEO_ID_HERE", // The YouTube Video ID (e.g., dQw4w9WgXcQ)
        channelUrl: "https://www.youtube.com/@ChannelHandle/live",
        category: "News",
        description: "Official 24/7 Stream",
        logo: null // Set to null to auto-fetch, or paste a URL string
    },
    // ...
];
```

### 🪄 Auto-Update Channel Icons

Don't waste time searching for logo URLs. We have a script for that.

1.  Add your new channel to `channels.js` with `logo: null` and the correct `channelUrl`.
2.  Run the updater:
    ```bash
    node scripts/update_channels.js
    ```
3.  The script will:
    *   Verify if the video ID is still live.
    *   Scrape the official high-res avatar from the YouTube channel.
    *   Automatically update `channels.js` with the correct logo URL.

## 💻 Tech Stack

*   **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Player**: [React Player](https://github.com/cookpete/react-player)

## 📄 License

MIT © 2024
