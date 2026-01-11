# Delta - Colorblind Dashcam Assistant: Features Roadmap

## Vision Statement
Delta is a landscape-oriented dashcam application designed for users with color blindness and other visual impairments who still drive, bike, walk, or use other forms of transportation. The app provides real-time object detection and audio alerts for hazards that the user may not be able to perceive due to their specific type of color vision deficiency.

---

## Current State (dashcam-fixes Branch)

### Implemented Features
1. **Enhanced Ishihara Color Blindness Test** (5-10 plates with quick/full mode options)
2. **Traffic Light Detection** via Roboflow YOLO model
3. **TTS Audio Feedback** via Expo Speech with ElevenLabs support
4. **Tab-Based Navigation**: Profile Tab + Dashcam Tab
5. **Color Vision Profile** with comprehensive type detection (protanopia, deuteranopia, tritanopia, etc.)
6. **Settings Page** with alert preferences, voice settings, transport mode config
7. **Speed Detection** via GPS with auto transport mode detection
8. **Transport Modes** (Walking, Biking, Driving, Passenger) with speed-based alert timing
9. **Persistent Data Storage** via Zustand + AsyncStorage
10. **Landscape Support** for dashcam mode
11. **Shape Indicators** for colorblind-friendly UI (square=red, circle=yellow, triangle=green)
12. **Position Cues** ("top light", "middle light", "bottom light")

### Remaining Work
- Authentication (teammate handling)
- Full ElevenLabs audio playback integration
- Expanded hazard detection (stop signs, brake lights, etc.)
- Continuous recording with clip saving
- History/alerts log tab

---

## Feature Requirements

### Phase 1: Core Infrastructure

#### 1.1 Authentication & User Management
**Priority: HIGH** | **Owner: Teammate**

- [ ] OAuth 2.0 integration (Google, Apple Sign-In)
- [ ] User profile storage (Firebase/Supabase)
- [ ] Secure token management
- [ ] Session persistence across app restarts
- [ ] Guest mode option for quick access
- [ ] Account deletion compliance (GDPR/CCPA)

**Tech Stack:**
- Firebase Auth / Auth0 / Clerk
- Secure storage: `expo-secure-store`

#### 1.2 Navigation & Tab Structure
**Priority: HIGH** | **Status: IMPLEMENTED**

- [x] Tab-based navigation (Expo Router Tabs)
- [x] **Tab 1: Color Blindness Profile** - Tests, results, and settings
- [x] **Tab 2: Live Dashcam View** - Main detection screen
- [ ] Optional **Tab 3: History/Alerts** - Past detection logs
- [x] Landscape orientation support for dashcam mode

**Implementation:**
```
App Structure:
├── (auth)                    # Authentication flow
│   ├── login.tsx
│   └── register.tsx
├── (tabs)                    # Main app with tab navigation
│   ├── _layout.tsx           # Tab bar configuration
│   ├── profile/              # Tab 1: Color Blindness Profile
│   │   ├── index.tsx         # Profile overview
│   │   ├── test.tsx          # Take/retake color blindness test
│   │   └── settings.tsx      # App settings
│   ├── dashcam/              # Tab 2: Dashcam
│   │   └── index.tsx         # Live camera view
│   └── history/              # Tab 3: History (optional)
│       └── index.tsx         # Past alerts log
└── _layout.tsx               # Root layout
```

---

### Phase 2: Enhanced Color Blindness Assessment

#### 2.1 Comprehensive Color Vision Testing
**Priority: HIGH** | **Status: IMPLEMENTED**

- [x] Extended Ishihara test (10 plates for accurate diagnosis, 5-plate quick mode)
- [x] Support for all major types:
  - **Protanopia** (red-blind, ~1% of males)
  - **Protanomaly** (red-weak, ~1% of males)
  - **Deuteranopia** (green-blind, ~1% of males)
  - **Deuteranomaly** (green-weak, ~5% of males)
  - **Tritanopia** (blue-blind, rare)
  - **Tritanomaly** (blue-weak, rare)
  - **Achromatopsia** (complete color blindness, very rare)
  - **Low vision / General visual impairment**
- [x] Severity scoring (mild, moderate, severe)
- [ ] Farnsworth D-15 arrangement test option
- [ ] Cambridge Color Test integration (optional)
- [x] Test result confidence scoring

#### 2.2 Color Profile Data Model
**Priority: HIGH**

```typescript
interface ColorVisionProfile {
  userId: string;
  testDate: Date;
  type: ColorBlindnessType;
  severity: 'mild' | 'moderate' | 'severe';
  confidence: number; // 0-1

  // Specific color difficulties
  problematicColors: {
    red: boolean;
    green: boolean;
    blue: boolean;
    yellow: boolean;
  };

  // Custom settings
  preferredAlertLevel: 'minimal' | 'standard' | 'verbose';
  positionCuesEnabled: boolean;
  shapeCuesEnabled: boolean;
}
```

#### 2.3 Profile Settings Page
**Priority: MEDIUM**

- [ ] View current color blindness type and severity
- [ ] Retake test option
- [ ] Manual override option (self-reported diagnosis)
- [ ] Import results from optometrist
- [ ] Alert preferences configuration
- [ ] Voice selection and preview

---

### Phase 3: Advanced Object Detection (OpenCV / ML)

#### 3.1 Primary Detection System
**Priority: CRITICAL**

Replace basic traffic light detection with comprehensive hazard detection:

**Detection Categories:**
| Category | Objects | Priority for Colorblind Users |
|----------|---------|-------------------------------|
| Traffic Signals | Red/Yellow/Green lights, pedestrian signals, flashing signals | CRITICAL |
| Traffic Signs | Stop signs, yield signs, warning signs, speed limit | HIGH |
| Vehicle Hazards | Brake lights, turn signals, emergency vehicles (red/blue lights) | CRITICAL |
| Pedestrian Hazards | Crosswalks, people, cyclists | MEDIUM |
| Road Hazards | Construction cones (orange), barriers, road markings | HIGH |
| Environmental | Fire (red/orange), warning lights | MEDIUM |

#### 3.2 Color-Specific Detection Pipeline
**Priority: CRITICAL**

```
User Profile → Colors to Watch → Detection Engine → Filter → Alerts
     │                │                 │              │         │
     ▼                ▼                 ▼              ▼         ▼
[Deuteranopia] → [Red, Green] → [OpenCV/YOLO] → [Red obj] → [Alert]
```

**Implementation Approach:**

1. **Object Detection Layer** (YOLO/TensorFlow Lite)
   - Detect and classify objects (traffic light, stop sign, brake light, etc.)
   - Return bounding boxes and object type

2. **Color Analysis Layer** (OpenCV)
   - Extract dominant colors from detected objects
   - Analyze color in HSV space for robustness
   - Map detected colors to user's problematic colors

3. **Decision Layer** (LLM Optional)
   - Determine urgency and appropriate action
   - Generate contextual alerts
   - Handle edge cases and complex scenarios

**Tech Options:**
- **On-device**: TensorFlow Lite, ONNX Runtime, OpenCV.js
- **Cloud**: Roboflow, Google Cloud Vision, AWS Rekognition
- **Hybrid**: On-device detection + cloud for complex scenarios

#### 3.3 OpenCV Integration
**Priority: HIGH**

```javascript
// Detection modules needed
const detectionModules = {
  trafficLightDetector: {
    method: 'color_segmentation + shape_detection',
    colors: ['red', 'yellow', 'green'],
    fallback: 'position_based' // top=red, middle=yellow, bottom=green
  },

  stopSignDetector: {
    method: 'shape_detection + color_verification',
    shape: 'octagon',
    color: 'red',
    textOCR: 'STOP'
  },

  brakeLightDetector: {
    method: 'motion_analysis + color_detection',
    triggers: ['brightness_increase', 'red_area_expansion']
  },

  emergencyVehicleDetector: {
    method: 'flashing_pattern_detection',
    colors: ['red', 'blue'],
    pattern: 'alternating'
  }
};
```

#### 3.4 Frame Processing Pipeline
**Priority: HIGH**

```
Camera Frame (30fps)
       │
       ▼
[Frame Selection] ─────► Skip frames (process every 100-200ms)
       │
       ▼
[Preprocessing]
├── Resize for model input
├── Color space conversion (BGR → HSV for color analysis)
└── Exposure normalization
       │
       ▼
[Object Detection] ─────► YOLO/TensorFlow Lite
       │
       ├── Detected objects with bounding boxes
       │
       ▼
[Color Analysis per Object]
       │
       ├── Extract ROI (Region of Interest)
       ├── Analyze dominant colors
       └── Map to user's problematic colors
       │
       ▼
[Hazard Scoring]
       │
       ├── Relevance to user's color blindness
       ├── Distance estimation
       ├── Urgency level
       └── Confidence score
       │
       ▼
[Alert Generation]
```

---

### Phase 4: Audio Alert System (ElevenLabs)

#### 4.1 ElevenLabs Integration
**Priority: HIGH**

Replace or supplement Expo Speech with ElevenLabs for natural, clear voice alerts.

**Benefits over TTS:**
- More natural, less robotic voice
- Better pronunciation
- Emotional inflection for urgency
- Customizable voice personas

**Implementation:**
```typescript
interface AlertConfig {
  provider: 'elevenlabs' | 'expo-speech' | 'hybrid';
  voiceId: string; // ElevenLabs voice ID
  fallbackToLocal: boolean; // Use Expo Speech when offline

  // Alert properties
  urgencyLevels: {
    critical: { rate: 1.3, pitch: 1.1 };  // Fast, higher pitch
    warning: { rate: 1.1, pitch: 1.0 };   // Slightly fast
    info: { rate: 1.0, pitch: 1.0 };       // Normal
  };
}
```

**Alert Message Structure:**
```typescript
interface Alert {
  type: 'traffic_light' | 'stop_sign' | 'brake_light' | 'emergency' | 'hazard';
  urgency: 'critical' | 'warning' | 'info';

  // Message components
  whatDetected: string;      // "Red traffic light"
  whereDetected: string;     // "ahead" | "to your left" | "approaching"
  actionRequired: string;    // "Stop" | "Slow down" | "Proceed with caution"
  colorContext?: string;     // "Top light is on" (position cue for colorblind)

  // Generated message
  fullMessage: string;       // "Red traffic light ahead. Stop. Top light is on."
}
```

#### 4.2 Smart Alert Debouncing
**Priority: MEDIUM**

```typescript
interface DebounceConfig {
  // Base intervals by speed mode
  walking: 5000,    // 5 seconds
  biking: 3000,     // 3 seconds
  driving: 1500,    // 1.5 seconds

  // Override for critical alerts
  criticalOverride: 500,  // 0.5 seconds for critical hazards

  // Same-object suppression
  sameObjectCooldown: 2500,  // Don't repeat same object type

  // Distance-based adjustment
  distanceFactors: {
    far: 1.5,       // Further = less frequent
    medium: 1.0,    // Normal
    near: 0.5,      // Closer = more frequent
  }
}
```

#### 4.3 Audio Queue Management
**Priority: MEDIUM**

- [ ] Priority queue for alerts (critical first)
- [ ] Interrupt lower-priority alerts for critical ones
- [ ] Queue cleanup to prevent alert backlog
- [ ] Audio ducking (lower background audio during alerts)

---

### Phase 5: Transportation Mode System

#### 5.1 Mode Detection & Selection
**Priority: HIGH**

**Supported Modes:**
| Mode | Speed Range | Alert Frequency | Detection Focus |
|------|-------------|-----------------|-----------------|
| Walking | 0-5 km/h | Every 5s | Crosswalks, pedestrian signals |
| Biking | 5-25 km/h | Every 3s | Traffic lights, bike lanes, vehicles |
| Driving | 25-80 km/h | Every 1.5s | All traffic signals, brake lights, signs |
| Public Transit | Variable | On-demand | Stop announcements, transfers |
| Passenger | Any | Minimal | Emergency alerts only |

#### 5.2 Mode Configuration
**Priority: MEDIUM**

```typescript
interface TransportMode {
  id: string;
  name: string;

  // Detection settings
  frameProcessingInterval: number;  // ms between processed frames
  alertInterval: number;            // ms between same-type alerts

  // Relevant hazards
  priorityHazards: HazardType[];
  suppressedHazards: HazardType[];

  // Speed detection
  autoDetectBySpeed: boolean;
  speedRange: [number, number];     // [min, max] km/h

  // GPS usage
  useLocation: boolean;
  trackSpeed: boolean;
}
```

#### 5.3 Auto-Mode Detection
**Priority: LOW**

- [ ] GPS speed-based detection
- [ ] Accelerometer pattern analysis
- [ ] Manual override always available
- [ ] Learn from user behavior

---

### Phase 6: LLM Integration (Gemini)

#### 6.1 Contextual Decision Making
**Priority: MEDIUM**

Use Gemini for complex scenarios where rule-based logic isn't sufficient:

**Use Cases:**
1. **Ambiguous Detection**: "Is this a brake light or a tail light?"
2. **Context Analysis**: "Is this construction zone relevant to my lane?"
3. **Multi-Object Scenes**: "Multiple signals detected - which is relevant?"
4. **Natural Language Queries**: User asks "What's happening ahead?"

**Implementation:**
```typescript
interface GeminiRequest {
  image: string;              // Base64 frame
  detectedObjects: Object[];  // Pre-detected objects
  userContext: {
    colorBlindnessType: string;
    currentSpeed: number;
    transportMode: string;
    recentAlerts: Alert[];
  };
  query?: string;             // Optional user query
}

interface GeminiResponse {
  analysis: string;
  suggestedAction: string;
  confidence: number;
  alertPriority: 'critical' | 'warning' | 'info' | 'none';
}
```

#### 6.2 When to Use LLM vs Rule-Based
**Priority: MEDIUM**

| Scenario | Approach |
|----------|----------|
| Single traffic light, clear view | Rule-based |
| Multiple overlapping signals | LLM assist |
| Standard stop sign | Rule-based |
| Partially obscured sign | LLM assist |
| Brake lights detected | Rule-based |
| "What color is that car?" | LLM |
| Construction zone assessment | LLM |
| Emergency situation | Both (LLM confirms) |

---

### Phase 7: Dashcam Features

#### 7.1 Continuous Recording
**Priority: HIGH**

- [ ] Background video recording
- [ ] Configurable quality (720p, 1080p)
- [ ] Loop recording with auto-delete (e.g., keep last 30 min)
- [ ] Manual clip saving on button press
- [ ] Automatic incident clip saving (harsh braking, alerts)

#### 7.2 Landscape Orientation
**Priority: HIGH**

- [ ] Lock dashcam view to landscape
- [ ] Adaptive UI for landscape mode
- [ ] Mount-friendly display (minimal UI when active)
- [ ] Auto-start on mount detection (future)

#### 7.3 Dashboard Overlay
**Priority: MEDIUM**

```
┌────────────────────────────────────────────────────────────┐
│ [12:34 PM]                            [Speed: 45 km/h]     │
│                                       [Mode: Driving]      │
│                                                            │
│                     LIVE CAMERA FEED                       │
│                                                            │
│     ┌─────────────┐                                       │
│     │ RED LIGHT   │  ◄── Hazard indicator                 │
│     │ STOP        │                                       │
│     └─────────────┘                                       │
│                                                            │
│                                                            │
│ [REC ●]                               [⚠ 2 Hazards]        │
│ [Profile: Deuteranopia]                [Save Clip]         │
└────────────────────────────────────────────────────────────┘
```

---

### Phase 8: Data Persistence & Sync

#### 8.1 Local Storage
**Priority: HIGH**

- [ ] SQLite or AsyncStorage for local data
- [ ] Color profile persistence
- [ ] Settings persistence
- [ ] Alert history (last 100 alerts)
- [ ] Saved video clips metadata

#### 8.2 Cloud Sync (Optional)
**Priority: LOW**

- [ ] Sync color profile across devices
- [ ] Backup settings to cloud
- [ ] Anonymous usage analytics
- [ ] Crash reporting

---

### Phase 9: Accessibility Enhancements

#### 9.1 Screen Reader Support
**Priority: MEDIUM**

- [ ] Full VoiceOver/TalkBack compatibility
- [ ] Semantic labels on all interactive elements
- [ ] Screen reader announcements for state changes

#### 9.2 Additional Accessibility Features
**Priority: MEDIUM**

- [ ] Haptic feedback for alerts (Apple Watch integration potential)
- [ ] High contrast UI option
- [ ] Adjustable text sizes
- [ ] Reduced motion mode
- [ ] Colorblind-friendly UI (ironic but important!)

#### 9.3 Shape-Based Indicators
**Priority: MEDIUM**

Don't rely solely on color for the app's own UI:

```
Traffic Light Status Indicators:
■ Square = Red/Stop
● Circle = Yellow/Caution
▲ Triangle = Green/Go

Plus position cues:
"Top light is on" = Stop
"Middle light is on" = Caution
"Bottom light is on" = Go
```

---

## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MOBILE APP (Expo)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Auth Module  │  │ Profile Tab  │  │ Dashcam Tab  │              │
│  │ (Firebase)   │  │              │  │              │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│         │                 │                 │                       │
│         ▼                 ▼                 ▼                       │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │                    STATE MANAGEMENT                      │       │
│  │  (Zustand / Redux / Context)                            │       │
│  │  - User Profile        - Color Vision Data              │       │
│  │  - Transport Mode      - Alert Queue                    │       │
│  └─────────────────────────────────────────────────────────┘       │
│                              │                                      │
│         ┌────────────────────┼────────────────────┐                │
│         ▼                    ▼                    ▼                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │   Camera    │     │  Location   │     │   Audio     │          │
│  │   Module    │     │   Module    │     │   Module    │          │
│  │(expo-camera)│     │(expo-loc)   │     │(ElevenLabs) │          │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘          │
│         │                   │                   │                  │
└─────────┼───────────────────┼───────────────────┼──────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DETECTION PIPELINE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐          │
│  │   Frame     │     │   Object    │     │   Color     │          │
│  │ Processor   │────▶│  Detection  │────▶│  Analysis   │          │
│  │             │     │ (YOLO/TF)   │     │  (OpenCV)   │          │
│  └─────────────┘     └─────────────┘     └─────────────┘          │
│                              │                   │                  │
│                              ▼                   ▼                  │
│                       ┌─────────────────────────────┐              │
│                       │     Hazard Evaluator        │              │
│                       │  - Match to user profile    │              │
│                       │  - Score relevance          │              │
│                       │  - Determine urgency        │              │
│                       └──────────────┬──────────────┘              │
│                                      │                              │
└──────────────────────────────────────┼──────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │
│  │  Roboflow   │  │  ElevenLabs │  │   Gemini    │                │
│  │  (ML API)   │  │  (Voice)    │  │   (LLM)     │                │
│  └─────────────┘  └─────────────┘  └─────────────┘                │
│                                                                     │
│  ┌─────────────┐  ┌─────────────┐                                  │
│  │  Firebase   │  │   Sentry    │                                  │
│  │  (Auth/DB)  │  │  (Errors)   │                                  │
│  └─────────────┘  └─────────────┘                                  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Expo SDK 51+ | React Native with managed workflow |
| **Navigation** | Expo Router + React Navigation | File-based routing with tabs |
| **State** | Zustand | Lightweight state management |
| **Camera** | expo-camera | Camera access and frame capture |
| **Location** | expo-location | GPS speed tracking |
| **Audio** | ElevenLabs API + expo-speech (fallback) | Voice alerts |
| **Detection** | TensorFlow Lite / Roboflow | Object detection |
| **Color Analysis** | OpenCV.js / Custom HSV analysis | Color identification |
| **LLM** | Google Gemini API | Complex decision making |
| **Auth** | Firebase Auth | User authentication |
| **Storage** | AsyncStorage + SQLite | Local persistence |
| **Backend** | Firebase / Supabase | User data sync |

---

## API Integrations Required

### 1. ElevenLabs (Voice)
- **Purpose**: Natural voice alerts
- **Endpoint**: `https://api.elevenlabs.io/v1/text-to-speech/{voice_id}`
- **Required**: API key, selected voice ID
- **Fallback**: expo-speech for offline use

### 2. Roboflow (Object Detection)
- **Purpose**: Pre-trained traffic object detection
- **Current Model**: `traffic-light-cnlh5/1`
- **Needed**: Expanded model or custom training for additional objects

### 3. Google Gemini (LLM)
- **Purpose**: Complex scene analysis, user queries
- **Endpoint**: Google AI Studio / Vertex AI
- **Usage**: On-demand for ambiguous scenarios

### 4. Firebase (Auth + Database)
- **Purpose**: User authentication and data sync
- **Services**: Auth, Firestore, Cloud Storage

---

## Development Phases & Milestones

### MVP (Minimum Viable Product)
- [ ] Tab navigation structure
- [ ] Enhanced color blindness test (5+ plates)
- [ ] Landscape dashcam view
- [ ] Expanded object detection (traffic lights + stop signs)
- [ ] ElevenLabs voice integration
- [ ] Local data persistence

### Beta
- [ ] OAuth authentication
- [ ] Full hazard detection suite
- [ ] Transportation mode system
- [ ] Alert customization
- [ ] Continuous recording

### Production
- [ ] LLM integration for complex scenarios
- [ ] Cloud sync
- [ ] Analytics and crash reporting
- [ ] Performance optimization
- [ ] Accessibility audit

---

## Open Questions

1. **Offline Capability**: How much functionality should work offline?
2. **Privacy**: How to handle continuous video recording privacy concerns?
3. **Battery**: Balance between detection frequency and battery life?
4. **False Positives**: How to handle incorrect detections gracefully?
5. **Legal**: Disclaimer about not replacing safe driving practices?

---

## References

- [Saight Project](https://devpost.com/software/saight) - Similar accessibility project inspiration
- [Color Blindness Statistics](https://www.colourblindawareness.org/colour-blindness/)
- [ElevenLabs API Docs](https://elevenlabs.io/docs)
- [Roboflow Object Detection](https://docs.roboflow.com/)
- [Expo Camera Documentation](https://docs.expo.dev/versions/latest/sdk/camera/)
- [OpenCV Color Detection](https://docs.opencv.org/4.x/df/d9d/tutorial_py_colorspaces.html)

---

*Document Version: 1.0*
*Created: January 2026*
*Last Updated: January 2026*
