# Delta - Traffic Signal Assistant

An accessibility-first mobile application that helps color-blind and visually impaired users safely navigate traffic signals through real-time detection and audio feedback.

## The Problem

Traffic signals rely heavily on color to communicate critical safety information. For the estimated 300 million people worldwide with color vision deficiency, and many more with low vision, distinguishing between red, yellow, and green lights can be challenging and potentially dangerous.

## The Solution

Delta uses your phone's camera to detect traffic signals in real-time and provides clear, immediate audio feedback:

- **"Red light. Stop."**
- **"Yellow light. Prepare to stop."** 
- **"Green light. Safe to proceed."**

### Key Features

- **Colorblindness-Aware**: Takes a quick vision assessment to customize feedback for your specific type of color vision
- **Position Cues**: For users with red-green colorblindness, announces the position of the lit signal (top/middle/bottom)
- **High Contrast UI**: Dark theme with large text and distinct visual indicators
- **Offline Audio**: Uses device TTS for reliable, instant audio feedback
- **Simple Controls**: Minimal interaction required - just point and listen

## How Accessibility is Addressed

### Visual Accessibility
- **High Contrast Colors**: WCAG AAA compliant color contrast
- **Large Touch Targets**: All buttons exceed 48dp minimum
- **Dark Background**: Reduces eye strain and glare
- **Pattern Differentiation**: Uses shapes (■ ● ◆) in addition to colors

### Colorblindness Support
- **Quick Vision Test**: Simplified Ishihara-style assessment identifies colorblindness type
- **Customized Feedback**: Tailored audio messages based on vision profile
- **Position Indicators**: Visual indicator showing which light position is active (top=red, middle=yellow, bottom=green)
- **Adjusted Colors**: Uses colorblind-friendly color palette when applicable

### Audio Accessibility  
- **Instant Feedback**: No network latency - uses device TTS
- **Smart Debouncing**: Avoids repetitive announcements of same state
- **Clear Speech**: Optimized rate and pitch for clarity
- **State-Specific Voice**: Different vocal characteristics for stop vs. go

## Architecture

```
delta/
├── mobile/                 # Expo React Native app
│   ├── app/               # Expo Router screens
│   │   ├── index.tsx     # Welcome/onboarding
│   │   ├── test.tsx      # Color vision assessment
│   │   └── camera.tsx    # Main detection screen
│   ├── components/        # Reusable UI components
│   ├── services/          # API, speech, storage
│   └── constants/         # Accessibility config
│
└── backend/               # Next.js API
    ├── app/api/          # API routes
    │   ├── detect/       # Signal detection endpoint
    │   └── health/       # Health check
    └── lib/              # Detection logic
```

## Technical Approach

### Why HSV Color Detection (not ML)?

For this hackathon, we chose color-based detection over machine learning because:

1. **Instant Startup**: No model loading time
2. **Predictable Behavior**: Easier to debug and demo
3. **No Dependencies**: Works without external APIs
4. **Sufficient for Demo**: Traffic light colors are standardized worldwide

**Tradeoff**: Less robust to unusual lighting. In production, we'd combine this with YOLO object detection to first locate traffic lights, then analyze colors within those bounding boxes.

### Frame Capture Strategy

- Captures every 800ms to balance responsiveness vs. battery
- Compresses to 30% quality for fast upload
- Backend responds in <100ms typically

### Audio Debouncing

- Only announces state changes (not repeated states)
- 2-second minimum between announcements of same state
- Immediate announcement of new states

## How to Run the Demo

### Prerequisites

- Node.js 18+
- Expo Go app on your phone
- Both devices on same network

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The server runs at `http://localhost:3000`

### 2. Configure Mobile App

Find your computer's local IP address:
```bash
# macOS
ipconfig getifaddr en0

# Windows
ipconfig
```

Create a `.env` file in the mobile folder:
```
EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
```

### 3. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone.

### 4. Using the App

1. Complete the quick vision assessment (30 seconds)
2. Point your camera at a traffic signal
3. Listen for audio announcements

## Demo Tips

- For indoor testing, display traffic light images on a monitor
- Ensure good lighting for best detection
- Hold phone steady and point directly at the signal
- The app announces "Scanning..." when looking for signals

## Tech Stack

- **Mobile**: Expo, React Native, TypeScript, Expo Camera, Expo Speech
- **Backend**: Next.js 15, TypeScript, App Router
- **Deployment**: Vercel (backend), Expo Go (mobile)

## Hackathon Tradeoffs

To ship in 24 hours, we made these conscious tradeoffs:

| Decision | Tradeoff | Why |
|----------|----------|-----|
| Color detection vs ML | Less robust | Faster, no dependencies |
| Expo Speech vs ElevenLabs | Less natural voice | Works offline, instant |
| In-memory storage | Resets on restart | Simpler, no database |
| 3-plate vision test | Less accurate | Faster onboarding |

## Future Improvements

- [ ] YOLO object detection for better accuracy
- [ ] Pedestrian signal detection (walk/don't walk)
- [ ] Flashing signal detection
- [ ] Persistent user preferences
- [ ] Apple Watch / WearOS companion app
- [ ] Haptic feedback option

## License

MIT

---

Built with ❤️ for accessibility at [Hackathon Name]
