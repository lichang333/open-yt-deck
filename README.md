# YouTube Live TV 📺

A web application that turns your browser into a TV-like experience for YouTube Live streams. Interact with the "TV" using keyboard controls to switch channels, mute audio, and view channel information.

![TV App Interface](./docs/screenshot.png) <!-- Placeholder for a screenshot if you have one, or remove/generate one -->

## Features

*   **📺 Immersive Interface**: Full-screen, distraction-free viewing experience.
*   **⌨️ Keyboard Navigation**:
    *   `Arrow Up` / `Arrow Right`: Next Channel
    *   `Arrow Down` / `Arrow Left`: Previous Channel
    *   `M`: Mute / Unmute
    *   `Space` / `Enter`: Show Channel Info (OSD)
*   **📡 Live Channels**: Pre-configured with popular live streams (Lo-Fi Music, News, Nature/Science).
*   **🎨 Smooth Transitions**: TV-style animations for channel switching and OSD.

## Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/yt-live-tv.git
    cd yt-live-tv
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## Configuration

You can customize the available channels by editing `src/data/channels.js`. 

```javascript
export const channels = [
  {
    id: 1,
    name: "Channel Name",
    videoId: "YOUTUBE_VIDEO_ID",
    category: "Category",
    description: "Description of the channel"
  },
  // Add more channels...
];
```

## Technologies Used

*   [React](https://react.dev/)
*   [Vite](https://vitejs.dev/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [Framer Motion](https://www.framer.com/motion/)
*   [React Player](https://github.com/cookpete/react-player)
*   [Lucide React](https://lucide.dev/)

## License

MIT
