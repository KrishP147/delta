---
description: how to run the Delta app for mobile testing
---

# Run Delta for Mobile Testing

## Prerequisites
- Expo Go app installed on your phone
- Phone and computer on the same WiFi network

## Steps

### 1. Start the Backend
```bash
cd backend
npm run dev
```
Wait until you see "Ready" in the output.

### 2. Start the Mobile App (in a new terminal)
```bash
cd mobile
npx expo start
```

### 3. Connect Your Phone
- **iOS**: Open Camera app → scan the QR code
- **Android**: Open Expo Go app → scan the QR code

The app will load on your phone!

## Manual URL Entry (if QR code doesn't work)
Open Expo Go and enter manually: `exp://172.18.79.66:8081`

## Notes
- Backend runs on port 3000
- Expo runs on port 8081
- Both must be running simultaneously
