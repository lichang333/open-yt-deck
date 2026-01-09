# 📺 Open YT-Deck

**Turn your browser into a premium Broadcast TV experience.**

`Open YT-Deck` is a professional-grade, keyboard-driven web application designed to replicate the experience of a master control room, powered by YouTube Live streams. It features a stunning, immersive On-Screen Display (OSD), a dedicated "Broadcast Control" manager, and distraction-free viewing.

![Preview Placeholder](docs/screenshot.png)

## ✨ Features

*   **📺 Premium TV Interface**:
    *   **Immersive OSD**: A glassmorphism-styled information bar shows Channel Logo, Name, Category, and Live Status.
    *   **Dynamic Visuals**: High-contrast, easy-to-read text with drop shadows and gradients.
    *   **Auto-Hiding**: Controls fade away automatically for a clean feed.

*   **🎮 Keyboard Control System**:
    *   **`↓` (Down)**: Next Channel
    *   **`↑` (Up)**: Previous Channel
    *   **`1` - `9`**: Instant Jump to Channels 1-9
    *   **`M`**: Mute / Unmute
    *   **`F`**: Toggle Fullscreen
    *   **`Space`**: Show/Hide Info (OSD)

*   **🛠️ Broadcast Control Center (Channel Manager)**:
    *   **Drag & Drop Sorting**: Easily reorder your lineup. The first 9 slots automatically get hotkeys.
    *   **Live Editing**: Add, edit, or delete channels directly in the browser.
    *   **Smart Auto-Complete**: Paste a YouTube URL, and it automatically extracts the ID.
    *   **Maintenance Guide**: Built-in instructions on how to update stream IDs when they expire.
    *   **Data Persistence**: Your lineup is saved locally in your browser. You can also "Export" the config to share it.

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

## 📡 Channel Management

You can manage channels in two ways:

### 1. The UI Way (Recommended)
Click the **Gear Icon** (hidden in the bottom right corner) or explore the UI to open the **Broadcast Control** panel.
- **Add**: Create new channels.
- **Sort**: Drag channels to reorder.
- **Save**: Persists changes to your browser's LocalStorage.
- **Signal Health**: Clicking the "Activity" icon scans all channels. Offline channels are automatically hidden from the main view but remain visible (in red) here for maintenance.

### 2. The Hardcoded Way (Permanent)
To make changes permanent for all users (e.g., if you are hosting this), modify `src/data/channels.js`:

```javascript
export const channels = [
    {
        id: 1,
        name: "Channel Name",
        videoId: "VIDEO_ID_HERE", // The YouTube Video ID
        channelUrl: "https://www.youtube.com/@ChannelHandle/live",
        category: "News",
        description: "Official 24/7 Stream",
        logo: "URL_TO_LOGO_IMAGE"
    },
    // ...
];
```

### 3. Automated Maintenance (CLI)

#### Refresh & Cleanup
To automatically update Video IDs (when streams expire), fetch high-res logos, and **remove non-live channels**:
```bash
npm run refresh-channels
```
98: *Note: This script uses `yt-dlp`. It will permanently delete any channel from `src/data/channels.js` if it detects the stream is not live, or if the video/channel is unavailable (404).*

#### Quick Add
To easily add a new channel using just its YouTube URL:
```bash
npm run add-channel https://www.youtube.com/watch?v=VIDEO_ID
```
This will automatically fetch the channel name, ID, and logo, and append it to your configuration.

## 💻 Tech Stack

*   **Core**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
*   **State**: Context API + Custom Hooks
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)
*   **Player**: [React Player](https://github.com/cookpete/react-player)
*   **Tools**: `yt-dlp` (for metadata fetching)

## 📄 License

MIT © 2026
