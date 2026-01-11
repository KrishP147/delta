# TrueLight

Real-time object detection and audio alerts for colorblind and visually impaired users.

Mobile dashcam app using YOLOv3 computer vision to detect objects, analyze colors, and provide audio feedback customized for different types of color vision deficiency.

## Overview

TrueLight helps people with color vision deficiency navigate safely by:
- Detecting objects in real-time using the phone camera
- Analyzing colors that may be difficult to distinguish
- Providing audio alerts for potentially hazardous objects
- Adapting detection sensitivity based on transport mode (walking, biking, driving)

## Tech Stack

**Mobile:** Expo 51+, React Native, TypeScript, Zustand  
**Backend:** Next.js 15, TypeScript, Node.js  
**Detection:** Python 3.8+, FastAPI, OpenCV, YOLOv3-tiny  
**Audio:** ElevenLabs (natural voice), Expo Speech (fallback)

## Features

- Real-time YOLO object detection with 80 object classes
- HSV color analysis fallback when no objects detected
- Support for 9 types of colorblindness including low vision
- Ishihara color vision test
- Adaptive visual alerts using colors the user can see
- ElevenLabs natural voice text-to-speech
- Transport mode adaptation (walking, biking, driving, passenger)
- Motion tracking for moving objects
- Low vision mode with proximity-based prioritization

## Project Structure

```
delta/
├── mobile/                    # Expo React Native app
│   ├── app/                   # Screens and navigation
│   ├── components/            # Reusable UI components
│   ├── services/              # API, speech, detection logic
│   ├── store/                 # State management
│   └── constants/             # Config and types
├── backend/                   # Next.js API proxy
│   └── app/api/               # API routes
├── python-detection/          # FastAPI detection service
│   ├── main.py                # Server
│   ├── detector.py            # YOLO detection
│   ├── color_analyzer.py      # Color analysis
│   └── models/                # YOLOv3 weights
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ and pip  
- Expo Go app on your phone
- Computer and phone on same Wi-Fi network

### 1. Python Detection Service

```bash
cd python-detection
pip install -r requirements.txt
python main.py
```

Service runs on `http://localhost:8000`

### 2. Next.js Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3000`

### 3. Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan QR code with Expo Go app.

### 4. Configuration

Create `backend/.env`:

```bash
PYTHON_DETECTION_URL=http://localhost:8000
GEMINI_API_KEY=your_key_here          # Optional - for AI assistant
ELEVENLABS_API_KEY=your_key_here       # Optional - for natural TTS
```

## How It Works

1. Mobile app captures camera frames every 1.5-5 seconds (based on transport mode)
2. Image is base64 encoded and sent to Next.js backend
3. Backend proxies request to Python FastAPI service
4. Python service runs YOLOv3 detection and color analysis
5. Detection results returned with bounding boxes, labels, colors, and priority
6. Mobile app renders animated brackets around detected objects
7. Audio alerts spoken for objects with problematic colors (based on colorblindness type)
8. For low vision users: alerts prioritize by object size/proximity instead of color

## Audio Configuration

**Primary TTS:** ElevenLabs (natural voice, requires API key in .env)  
**Fallback TTS:** Expo Speech (built-in, works offline)

ElevenLabs provides human-like voice alerts for better comprehension in urgent situations.

## Colorblindness Types Supported

- Normal vision
- Protanopia (red-blind)
- Protanomaly (red-weak)
- Deuteranopia (green-blind)
- Deuteranomaly (green-weak)
- Tritanopia (blue-blind)
- Tritanomaly (blue-weak)  
- Achromatopsia (total colorblindness)
- Low vision (general visual impairment)

## Low Vision Mode

Low vision mode prioritizes objects by size and proximity instead of color:

- Objects >10% of frame: Very close, urgent voice alert
- Objects >5% of frame: Close, moderate alert
- Objects >2% of frame: Moderate distance
- Tap "Describe Scene" for verbal description of surroundings
- Alerts include direction: left, right, or ahead

## License

MIT
cd mobile

# Install dependencies
npm install

# Find your computer's IP address
# Windows:
ipconfig  # Look for IPv4 Address under Wi-Fi (e.g., 192.168.1.100)

# macOS/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Create .env file with YOUR IP
echo "EXPO_PUBLIC_API_URL=http://YOUR_IP_HERE:3000" > .env
# Example: echo "EXPO_PUBLIC_API_URL=http://192.168.1.100:3000" > .env

# Optional: Add Gemini API key for voice commands
echo "EXPO_PUBLIC_GEMINI_API_KEY=your_key_here" >> .env

# Start Expo
npx expo start --clear
```

**Expected output:**
```
Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

#### 5️⃣ Run on Your Phone

1. Open **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. App will load (first time takes ~30 seconds)
4. Grant **camera** and **microphone** permissions
5. Complete vision profile setup (or skip)
6. Tap "START DASHCAM"

---

### Environment Variables Reference

#### Backend `.env` (Optional)

All have sensible defaults for local development:

```bash
# Python service URL (default: http://localhost:8000)
PYTHON_DETECTION_URL=http://localhost:8000

# Optional: ElevenLabs TTS (falls back to Expo Speech)
ELEVENLABS_API_KEY=sk_xxxxx

# Optional: Roboflow API (not currently used)
ROBOFLOW_API_KEY=xxxxx

# JWT secret (change in production)
JWT_SECRET=your-secret-key-here
```

#### Mobile `.env` (Required)

```bash
# REQUIRED: Your computer's local IP + port 3000
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000

# OPTIONAL: Google Gemini for voice commands
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSyXXXXXX
```

**⚠️ Important:** 
- Use your computer's **local IP address** (not `localhost`)
- Find it with `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Example: `192.168.1.100`, `10.0.0.5`, `172.16.0.10`
- Phone and computer must be on same Wi-Fi network

---

## 📱 Usage Guide

### First Launch

1. **Vision Profile Setup** (Optional)
   - Take 5-plate color vision test (~30 seconds)
   - Or manually select your colorblindness type
   - Or skip and use normal vision profile

2. **Grant Permissions**
   - Allow camera access for object detection
   - Allow microphone for voice commands (optional)

3. **Choose Transport Mode**
   - Settings → Transport Mode
   - Walking 🚶 / Biking 🚴 / Driving 🚗 / Passenger 🚌
   - Or enable auto-detection via GPS speed

### Using the Dashcam

1. Tap "**START DASHCAM**" from home screen
2. Point camera at objects/traffic signals
3. Bounding boxes appear in real-time
4. Audio alerts announce detected hazards
5. Tap objects to lock focus

**What You'll See:**
- 🎯 **Animated brackets** around detected objects
- 🏷️ **Color labels**: "RED/WHITE - car 🚗"
- ⚠️ **Flash alerts** for problematic colors
- 📊 **Confidence scores** on each detection
- 🔊 **Audio announcements** for hazards

### Voice Commands (Optional - Requires Gemini API)

Say "**Hey TrueLight**" or "**Sierra**" followed by:

| Command | Response |
|---------|----------|
| "What do you see?" | Detailed scene description |
| "What color is that?" | Identifies colors in view |
| "Can I cross?" | Checks if it's safe to proceed |
| "What's ahead?" | Describes upcoming hazards |
| "Help" | Lists available commands |

### Customization Settings

**Profile → Settings:**

- **Alert Level**: Minimal / Standard / Verbose
- **Transport Mode**: Walking / Biking / Driving / Passenger
- **Speech Rate**: 0.5x to 2.0x speed
- **Position Cues**: Enable "top light" announcements
- **Shape Indicators**: Add shapes to UI
- **Voice Provider**: System TTS or ElevenLabs
- **Detection Types**: Toggle which objects to detect

**Change Vision Type Anytime:**
- Profile → Settings → Color Vision Type → Change Vision Type
- Select from 9 types without retaking test

---

## 🔧 How It Works

### Detection Pipeline

```
Camera Frame (720x1280)
     ↓
[Capture every 1.5-2s based on transport mode]
     ↓
[Convert to JPEG at 70% quality]
     ↓
[Encode to base64 string]
     ↓
[Send to Next.js backend at http://YOUR_IP:3000/api/detect]
     ↓
[Proxy to Python service at http://localhost:8000/detect]
     ↓
[Decode base64 → NumPy array]
     ↓
┌─────────────────────────────────┐
│ YOLO Detection (confidence ≥ 10%) │
│ - 80 COCO classes                │
│ - 640x640 input size             │
│ - NMS threshold: 0.4             │
└─────────────────────────────────┘
     ↓
[Check detection count]
     ↓
  ┌─────┐
  │ > 0 │ YES → Return YOLO detections
  └─────┘
     ↓ NO
┌─────────────────────────────────┐
│ Color Region Fallback            │
│ - Convert to HSV color space    │
│ - Detect 7 color regions:       │
│   Red, Orange, Yellow, Green,   │
│   Blue, Purple, Pink            │
│ - Find contours ≥ 1500px²      │
│ - Return top 5 by area          │
└─────────────────────────────────┘
     ↓
[Return JSON response]
     ↓
{
  "success": true,
  "detections": [
    {
      "label": "car",
      "confidence": 0.78,
      "bbox": {"x": 120, "y": 300, "width": 180, "height": 150},
      "colors": ["red", "white"]
    }
  ]
}
     ↓
[Mobile renders bounding boxes]
     ↓
[Audio alert if needed]
```

### Color Analysis

Objects are analyzed in **HSV color space** for robustness:

| Color | H Range | S Range | V Range |
|-------|---------|---------|---------|
| Red | 0-10, 170-180 | 100-255 | 100-255 |
| Orange | 10-25 | 100-255 | 100-255 |
| Yellow | 25-35 | 100-255 | 100-255 |
| Green | 35-85 | 50-255 | 50-255 |
| Blue | 85-130 | 50-255 | 50-255 |
| Purple | 130-160 | 50-255 | 50-255 |
| Pink | 160-170 | 50-255 | 50-255 |

**Why HSV?**
- More robust to lighting changes than RGB
- Easier to define color ranges
- Better for outdoor/varying conditions

### Adaptive Color System

TrueLight **never uses colors you can't see** for alerts:

| Colorblindness Type | Standard Alert | TrueLight Alert |
|---------------------|----------------|-----------------|
| Protanopia (red-blind) | ❌ Red | ✅ Cyan |
| Deuteranopia (green-blind) | ❌ Green | ✅ Pink |
| Tritanopia (blue-blind) | ❌ Blue | ✅ Orange-Red |
| Normal vision | ✅ Red/Green | ✅ Red/Green |

### Transport Mode Adaptation

Frame processing and alert intervals adjust to your speed:

| Mode | Speed Range | Frame Interval | Alert Interval | Priority |
|------|-------------|----------------|----------------|----------|
| 🚶 Walking | 0-5 km/h | 250ms | 5000ms | Crosswalks, pedestrians |
| 🚴 Biking | 5-25 km/h | 200ms | 3000ms | Vehicles, bike lanes |
| 🚗 Driving | 25-80 km/h | 125ms | 1500ms | All traffic signals |
| 🚌 Passenger | Any | 250ms | 10000ms | Emergency only |

---

## ♿ Accessibility Features

### Visual Accessibility
✅ **WCAG AAA** color contrast ratios  
✅ **Dark mode** default to reduce eye strain  
✅ **Large touch targets** (minimum 48dp)  
✅ **High contrast** UI elements  
MIT
