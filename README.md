# TrueLight - Intelligent Vision Assistant 🚦👁️

> **Real-time object detection and audio alerts for color-blind and visually impaired users**

An accessibility-first mobile dashcam application that uses AI-powered computer vision to detect objects, analyze colors, and provide customized audio feedback for users with color vision deficiencies. Built with Expo, FastAPI, and YOLOv3.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Expo SDK 51+](https://img.shields.io/badge/expo-51+-000020.svg)](https://expo.dev/)
[![Next.js 15](https://img.shields.io/badge/next.js-15-black)](https://nextjs.org/)

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [How It Works](#-how-it-works)
- [Accessibility Features](#-accessibility-features)
- [API Reference](#-api-reference)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚨 The Problem

**300 million people worldwide** have color vision deficiency (colorblindness), making it difficult or impossible to distinguish between certain colors. This creates serious safety challenges:

- 🚦 **Traffic signals** rely on red/yellow/green colors
- 🛑 **Stop signs** and warning signs use specific colors
- 🚗 **Brake lights** indicate when vehicles are stopping
- 🚧 **Construction zones** use orange cones and signs
- 🚨 **Emergency vehicles** flash red and blue lights

For many people, these critical visual cues are ambiguous or invisible, creating dangerous situations during driving, biking, or walking.

---

## ✅ The Solution

**TrueLight** transforms your smartphone into an intelligent vision assistant that:

1. 📸 **Captures camera frames** in real-time
2. 🤖 **Detects objects** using YOLOv3 deep learning model
3. 🎨 **Analyzes colors** with OpenCV HSV color detection
4. 🗣️ **Announces alerts** via customized audio feedback
5. 📍 **Shows bounding boxes** with animated targeting brackets
6. 🚶🚴🚗 **Adapts to transport mode** (walking, biking, driving)
7. 🎯 **Prioritizes hazards** based on your specific colorblindness type

---

## 🎯 Key Features

### Core Detection System
- ✅ **Real-time Object Detection** - YOLOv3-tiny with 80 COCO classes
- ✅ **Color Analysis Fallback** - Detects 7 color regions when YOLO finds nothing
- ✅ **Always-On Detection** - Ensures something is always tracked
- ✅ **Motion Tracking** - Follows moving objects across frames
- ✅ **Confidence Thresholds** - Lowered to 10% for maximum recall

### Vision Customization
- ✅ **Ishihara Color Vision Test** - 5-10 plate assessment
- ✅ **Manual Type Selection** - Choose your colorblindness type anytime
- ✅ **9 Vision Profiles Supported**:
  - Normal vision
  - Protanopia (red-blind)
  - Protanomaly (red-weak)
  - Deuteranopia (green-blind)
  - Deuteranomaly (green-weak)
  - Tritanopia (blue-blind)
  - Tritanomaly (blue-weak)
  - Achromatopsia (complete colorblindness)
  - Low vision / General visual impairment

### Visual Feedback
- ✅ **Adaptive Color Palettes** - Never uses colors you can't see for alerts
- ✅ **Animated Targeting Brackets** - Locks onto detected objects
- ✅ **Color Labels** - Shows "RED/BLUE - car 🚗" with transport context
- ✅ **Flash Alerts** - Pulsing animation for problematic colors
- ✅ **Active Target Indicator** - Highlights currently locked object

### Audio System
- ✅ **Expo Speech (Primary)** - Works offline, instant feedback
- ✅ **ElevenLabs TTS (Optional)** - Natural voice for enhanced experience
- ✅ **Smart Debouncing** - Avoids repetitive alerts
- ✅ **Adjustable Speech Rate** - 0.5x to 2.0x speed
- ✅ **Position Cues** - "Top light is on" for traffic signals
- ✅ **Proximity Alerts (Low Vision)** - "Warning! car very close ahead" based on object size
- ✅ **Scene Description (Low Vision)** - Verbose audio description of top 3 objects on demand

### Transport Modes
- ✅ **Walking Mode** 🚶 - 5s alerts, focuses on crosswalks/pedestrians
- ✅ **Biking Mode** 🚴 - 3s alerts, prioritizes vehicles/bikes
- ✅ **Driving Mode** 🚗 - 1.5s alerts, all traffic signals/signs
- ✅ **Passenger Mode** 🚗 - 2s alerts, can relax without driving focus
- ✅ **Low Vision Mode** 👁️ - Urgency-based prioritization by object size/proximity instead of color
- ✅ **Passenger Mode** 🚌 - Minimal alerts, emergency only
- ✅ **Auto-Detection** - GPS speed-based mode switching

### AI Assistant "Sierra" (Optional)
- ✅ **Voice Commands** - "Hey TrueLight" or "Sierra"
- ✅ **Scene Analysis** - "What do you see?"
- ✅ **Color Queries** - "What color is that?"
- ✅ **Safety Checks** - "Can I cross?"
- ✅ **Gemini 2.5 Flash** - Powered by Google AI

---

## 🛠️ Tech Stack

## 🛠️ Tech Stack

### Mobile App (Expo + React Native)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Expo** | 51+ | React Native framework with managed workflow |
| **React Native** | Latest | Cross-platform mobile development |
| **TypeScript** | 5.x | Type-safe JavaScript |
| **Expo Camera** | Latest | Camera access and frame capture |
| **Expo Speech** | Latest | Text-to-speech audio alerts |
| **Expo Router** | Latest | File-based navigation |
| **Zustand** | 4.x | Lightweight state management |
| **AsyncStorage** | Latest | Local data persistence |

### Backend API (Next.js)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15 | API server and proxy |
| **TypeScript** | 5.x | Type safety |
| **App Router** | Latest | API route handling |
| **Node.js** | 18+ | Runtime environment |

### Detection Service (Python + FastAPI)
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.8+ | Backend language |
| **FastAPI** | 0.109+ | High-performance API framework |
| **Uvicorn** | 0.27+ | ASGI server |
| **OpenCV** | 4.9+ | Computer vision and color analysis |
| **NumPy** | 1.26+ | Array operations |
| **Pillow** | 10.2+ | Image processing |
| **YOLOv3-tiny** | - | Object detection model (~33MB) |

### Optional Services
| Service | Purpose | Required? |
|---------|---------|-----------|
| **Google Gemini 2.5 Flash** | AI voice assistant | No - voice commands disabled without it |
| **ElevenLabs** | Natural TTS voice | No - falls back to Expo Speech |
| **Roboflow** | Additional ML models | No - not currently used |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE APP (Expo)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Profile Tab  │  │ Dashcam Tab  │  │ Settings Tab │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           ▼                                     │
│         ┌─────────────────────────────────────┐                 │
│         │    Zustand State Management         │                 │
│         │  - Color Vision Profile             │                 │
│         │  - Transport Mode                   │                 │
│         │  - Alert Settings                   │                 │
│         └─────────────────────────────────────┘                 │
│                           ▼                                     │
│    ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│    │  Camera  │    │ Location │    │  Audio   │               │
│    │ Component│    │  Service │    │  Service │               │
│    └──────────┘    └──────────┘    └──────────┘               │
└─────────────────────────────────────────────────────────────────┘
                           ▼
        ┌──────────────────────────────────────────┐
        │    API Request (Base64 Image)            │
        │    http://YOUR_IP:3000/api/detect        │
        └──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS BACKEND (Port 3000)                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  API Routes (App Router)                                │   │
│  │  - /api/detect → Proxy to Python service               │   │
│  │  - /api/health → Health check                          │   │
│  │  - /api/tts → ElevenLabs integration (optional)        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                           ▼
        ┌──────────────────────────────────────────┐
        │    Forward to Python Detection Service    │
        │    http://localhost:8000/detect          │
        └──────────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│             PYTHON DETECTION SERVICE (Port 8000)                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  FastAPI Endpoints                                      │   │
│  │  - POST /detect → Main detection endpoint              │   │
│  │  - GET /health → Service health check                  │   │
│  │  - GET /test-detection → Test with sample image        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Detection Pipeline                                     │   │
│  │  1. Decode base64 image                                │   │
│  │  2. Convert to numpy array                             │   │
│  │  3. Run YOLO detection (confidence ≥ 0.10)            │   │
│  │  4. If 0 detections → Color region fallback            │   │
│  │  5. Analyze colors in HSV space                        │   │
│  │  6. Return top 5 detections with bounding boxes        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           ▼                                     │
│  ┌───────────────┐         ┌─────────────────┐                │
│  │  YOLOv3-tiny  │         │  OpenCV Color   │                │
│  │  80 classes   │         │  Region Detect  │                │
│  │  640x640      │         │  HSV Analysis   │                │
│  └───────────────┘         └─────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Camera Capture** (Mobile) → Every 1.5-2s based on transport mode
2. **Image Encoding** → Base64 JPEG at 70% quality
3. **API Request** → Next.js backend (port 3000)
4. **Proxy** → Python service (port 8000)
5. **YOLO Detection** → YOLOv3-tiny processes image
6. **Color Fallback** → If 0 detections, analyze color regions
7. **Response** → JSON with bounding boxes, labels, colors, confidence
8. **Rendering** → Animated brackets + audio alerts
9. **Audio Feedback** → Expo Speech or ElevenLabs TTS

---

## 📂 Project Structure

```
delta/
├── mobile/                          # Expo React Native App
│   ├── app/                         # Expo Router screens
│   │   ├── (tabs)/                  # Tab navigation
│   │   │   ├── profile/
│   │   │   │   ├── index.tsx        # Profile overview
│   │   │   │   ├── test.tsx         # Color vision test
│   │   │   │   ├── settings.tsx     # App settings
│   │   │   │   └── manual-select.tsx # Manual colorblind type picker
│   │   │   └── dashcam/
│   │   │       └── index.tsx        # Camera/detection screen
│   │   ├── home.tsx                 # Main dashboard
│   │   ├── login.tsx                # Authentication
│   │   └── camera.tsx               # Standalone camera
│   ├── components/
│   │   ├── CameraView.tsx           # Camera capture logic
│   │   ├── BoundingBoxOverlay.tsx   # Visual detection brackets
│   │   ├── SignalDisplay.tsx        # Traffic light UI
│   │   └── HazardOverlay.tsx        # Alert indicators
│   ├── services/
│   │   ├── api.ts                   # Backend API client
│   │   ├── MLService.ts             # Detection coordination
│   │   ├── aiAssistant.ts           # Gemini voice commands
│   │   ├── AudioAlertService.ts     # TTS management
│   │   ├── colorAnalyzer.ts         # Color processing
│   │   ├── speech.ts                # Speech synthesis
│   │   └── storage.ts               # Local persistence
│   ├── store/
│   │   └── useAppStore.ts           # Zustand state management
│   ├── constants/
│   │   ├── accessibility.ts         # WCAG colors & types
│   │   ├── hazardPriority.ts        # Alert priorities
│   │   └── ishihara.ts              # Color test data
│   ├── assets/
│   │   └── logo.png                 # TrueLight logo
│   ├── app.json                     # Expo configuration
│   ├── package.json                 # Dependencies
│   └── tsconfig.json                # TypeScript config
│
├── backend/                         # Next.js API Server
│   ├── app/
│   │   └── api/
│   │       ├── detect/
│   │       │   └── objects/
│   │       │       └── route.ts     # Detection proxy endpoint
│   │       ├── health/
│   │       │   └── route.ts         # Health check
│   │       └── tts/
│   │           └── route.ts         # ElevenLabs TTS
│   ├── lib/
│   │   ├── detection.ts             # Detection utilities
│   │   └── auth.ts                  # JWT authentication
│   ├── .env                         # Environment variables
│   ├── next.config.js               # Next.js config
│   ├── package.json                 # Dependencies
│   └── tsconfig.json                # TypeScript config
│
├── python-detection/                # Python Detection Service
│   ├── main.py                      # FastAPI server
│   ├── detector.py                  # YOLO + OpenCV detection
│   ├── color_analyzer.py            # HSV color analysis
│   ├── models/                      # YOLOv3 model files
│   │   ├── yolov3-tiny.weights      # ~33MB
│   │   ├── yolov3-tiny.cfg          # Config
│   │   └── coco.names               # 80 class names
│   ├── requirements.txt             # Python dependencies
│   ├── setup.bat                    # Windows setup script
│   └── start.bat                    # Windows start script
│
├── README.md                        # This file
└── FEATURES_ROADMAP.md              # Product roadmap

```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- ✅ **Node.js 18+** and npm - [Download](https://nodejs.org/)
- ✅ **Python 3.8+** and pip - [Download](https://www.python.org/downloads/)
- ✅ **Expo Go** on your phone - [iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
- ✅ **Git** - [Download](https://git-scm.com/)
- ⚠️ Computer and phone on **same Wi-Fi network**

### Quick Start (5 minutes)

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/truelight.git
cd truelight
```

#### 2️⃣ Setup Python Detection Service

```bash
cd python-detection

# Install dependencies
pip install -r requirements.txt

# Download YOLO model (~33MB) - auto-downloads on first run
# Or manually: https://pjreddie.com/media/files/yolov3-tiny.weights
# Place in: python-detection/models/yolov3-tiny.weights

# Start service
python main.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     YOLOv3-tiny model loaded successfully
INFO:     Loaded 80 COCO classes
```

**Verify:** Open browser to `http://localhost:8000/health` → Should see `{"status": "healthy", "yolo_loaded": true}`

#### 3️⃣ Setup Next.js Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (optional)
```bash
# Create .env file (optional)
# Defaults work for local development
echo "PYTHON_DETECTION_URL=http://localhost:8000" > .env

# Start backend
npm run dev
```

**Expected output:**
```
▲ Next.js 15.0.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

**Verify:** `curl http://localhost:3000/api/health` → Should see `{"status": "ok", ...}`

#### 4️⃣ Setup Mobile App

```bash
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
✅ **Shape indicators** alongside colors (■ ● ▲)  
✅ **Animated brackets** for better visibility  

### Colorblindness Support
✅ **9 vision profiles** supported  
✅ **Adaptive color palettes** per type  
✅ **Never uses invisible colors** for alerts  
✅ **Position cues**: "Top light is on"  
✅ **Manual type selection** anytime  
✅ **Color name labels** on all detections  

### Audio Accessibility
✅ **Offline TTS** (Expo Speech)  
✅ **Optional natural voice** (ElevenLabs)  
✅ **Adjustable speech rate** (0.5x - 2.0x)  
✅ **Smart debouncing** (no repetitive alerts)  
✅ **Context-aware messages** per transport mode  
✅ **Screen reader compatible**  
✅ **Proximity alerts** (low vision users) - Urgency-based voice alerts for close objects  
✅ **Scene description** (low vision users) - On-demand verbal description of surroundings  

### Low Vision Mode Enhancements
**TrueLight's low vision mode prioritizes by urgency and proximity rather than color:**

🔊 **Proximity-Based Voice Alerts:**
- Objects >10% of frame = "Warning! [object] very close [direction]" (fast, urgent voice)
- Objects >5% of frame = "[object] approaching [direction]" (moderate urgency)
- Objects >2% of frame = "[object] ahead" (normal pace)
- Direction cues: "left", "right", "ahead"

📢 **Scene Description On Demand:**
- Tap "Describe Scene" button to hear top 3 objects
- Example: "3 objects detected. Large car ahead. Medium person left. Small sign right."
- Helps users understand their full surroundings

🎯 **Urgency-Based Prioritization:**
- Python backend calculates object size relative to frame
- Large objects = critical priority (regardless of color)
- Moving + large = highest priority
- Visual overlay sorts by size, not color
- Audio alerts focus on closest threats first  

### Cognitive Accessibility
✅ **Simple UI** with minimal distractions  
✅ **Clear iconography**  
✅ **Consistent navigation**  
✅ **Confirmation dialogs** for critical actions  
✅ **Progressive disclosure** of settings  

---

## 📡 API Reference

### Python Detection Service

**Base URL:** `http://localhost:8000`

#### POST `/detect`

Detect objects and colors in an image.

**Request:**
```json
{
  "image": "base64_encoded_jpeg_string",
  "confidence_threshold": 0.10,
  "nms_threshold": 0.4
}
```

**Response:**
```json
{
  "success": true,
  "num_detections": 2,
  "detections": [
    {
      "label": "car",
      "confidence": 0.78,
      "bbox": {
        "x": 120,
        "y": 300,
        "width": 180,
        "height": 150
      },
      "colors": ["red", "white"],
      "class_id": 2
    },
    {
      "label": "traffic light",
      "confidence": 0.65,
      "bbox": {
        "x": 450,
        "y": 50,
        "width": 40,
        "height": 120
      },
      "colors": ["red", "yellow"],
      "class_id": 9
    }
  ],
  "image_size": "640x480",
  "processing_time_ms": 156
}
```

#### GET `/health`

Check service health and model status.

**Response:**
```json
{
  "status": "healthy",
  "yolo_loaded": true,
  "model_classes": 80,
  "version": "1.0.0"
}
```

#### GET `/test-detection`

Test detection with a sample image.

**Response:**
```json
{
  "success": true,
  "image_size": "640x452",
  "num_detections": 1,
  "detections": [...]
}
```

### Next.js Backend

**Base URL:** `http://localhost:3000`

#### POST `/api/detect/objects`

Proxy to Python detection service.

**Request:**
```json
{
  "image": "base64_string",
  "confidence": 0.15
}
```

**Response:** Same as Python `/detect` endpoint

#### GET `/api/health`

Backend health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T12:00:00Z",
  "python_service": "connected"
}
```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><b>🔴 Python Service Won't Start</b></summary>

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd python-detection
pip install -r requirements.txt
```

**Problem:** `YOLO model not loaded`

**Solution:**
```bash
# Download YOLOv3-tiny weights manually
cd python-detection/models
# Download from: https://pjreddie.com/media/files/yolov3-tiny.weights
# Also need: https://github.com/pjreddie/darknet/blob/master/cfg/yolov3-tiny.cfg
```

**Problem:** Port 8000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

</details>

<details>
<summary><b>🟡 Backend Won't Start</b></summary>

**Problem:** Port 3000 already in use

**Solution:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Problem:** Can't connect to Python service

**Solution:**
1. Verify Python service is running: `curl http://localhost:8000/health`
2. Check `backend/.env` has `PYTHON_DETECTION_URL=http://localhost:8000`
3. Restart both services

</details>

<details>
<summary><b>🟢 Mobile App Issues</b></summary>

**Problem:** "Network request failed"

**Solutions:**
1. ✅ Verify phone and computer on **same Wi-Fi** (not mobile data!)
2. ✅ Check `mobile/.env` has your **local IP** (not `localhost`)
3. ✅ Disable VPN on computer and phone
4. ✅ Check firewall allows port 3000
5. ✅ Test: `curl http://YOUR_IP:3000/api/health` from another device

**Problem:** No detections showing

**Solutions:**
1. Check Python service logs for errors
2. Ensure camera permissions granted
3. Point at well-lit objects
4. Check mobile console: `npx expo start` → press `j` for debugger
5. Verify services: `curl http://localhost:8000/health`

**Problem:** No audio alerts

**Solutions:**
1. Check device volume
2. Ensure microphone permission granted (needed for voice commands)
3. Settings → Voice Provider → Try switching providers
4. Test: Settings → Test Voice button

**Problem:** Bounding boxes not appearing

**Solutions:**
1. Reload app: Press `r` in Expo terminal
2. Check detection confidence: Settings → lower thresholds
3. Point at larger, well-lit objects
4. Transport mode affects frequency: Settings → Transport Mode

</details>

<details>
<summary><b>🔵 General Issues</b></summary>

**Problem:** App crashes on load

**Solution:**
```bash
cd mobile
npx expo start --clear  # Clear cache
# On phone: Delete Expo app data and reinstall
```

**Problem:** Slow detection

**Solution:**
1. Lower image quality: CameraView.tsx → quality: 0.5
2. Increase frame interval: Settings → Transport Mode
3. Check Python service isn't overloaded: `top` or Task Manager

**Problem:** Changes not appearing

**Solution:**
```bash
# In Expo terminal, press:
r  # Reload app
c  # Clear cache and restart

# Or full reset:
npx expo start --clear
```

</details>

---

## 🔬 Testing

### Manual Testing

```bash
# Test Python service
curl -X GET http://localhost:8000/health
curl -X GET http://localhost:8000/test-detection

# Test backend
curl -X GET http://localhost:3000/api/health

# Test full detection (from mobile logs)
# Check Expo console for detection responses
```

### Unit Tests (Coming Soon)

```bash
# Python tests
cd python-detection
pytest tests/

# Backend tests
cd backend
npm test

# Mobile tests
cd mobile
npm test
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Guidelines

- **Code Style**: Follow existing TypeScript/Python conventions
- **Comments**: Document complex logic
- **Types**: Use TypeScript types, Python type hints
- **Accessibility**: Maintain WCAG AAA compliance
- **Testing**: Add tests for new features
- **Commits**: Use conventional commit messages

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **YOLOv3** - Joseph Redmon, Ali Farhadi ([Paper](https://arxiv.org/abs/1804.02767))
- **OpenCV** - Computer vision library
- **Expo** - React Native development platform
- **FastAPI** - High-performance Python web framework
- **Color Blind Awareness** - Color vision deficiency research
- **Ishihara Test** - Color vision testing methodology

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/truelight/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/truelight/discussions)
- **Email**: support@truelight.app

---

## 🗺️ Roadmap

See [FEATURES_ROADMAP.md](FEATURES_ROADMAP.md) for detailed feature plans.

### Upcoming Features

- [ ] **Continuous Recording** - Loop recording with incident clips
- [ ] **Cloud Sync** - Backup settings across devices
- [ ] **Brake Light Detection** - Real-time vehicle braking alerts
- [ ] **Stop Sign Detection** - Octagonal sign recognition
- [ ] **Emergency Vehicle Detection** - Flashing light patterns
- [ ] **Apple Watch Integration** - Haptic alerts
- [ ] **Offline Mode** - Full functionality without internet
- [ ] **Multi-language Support** - Spanish, French, Mandarin, etc.

---

<div align="center">

**Built with ❤️ for accessibility**

**TrueLight** - See the world clearly

[Report Bug](https://github.com/yourusername/truelight/issues) · [Request Feature](https://github.com/yourusername/truelight/issues) · [Documentation](https://github.com/yourusername/truelight/wiki)

</div>
