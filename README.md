# Veytrix App

This is a React Native app built with Expo, TypeScript, and Zustand. It contains a full video generation and editing UI workflow designed to run in both a local demo mode and a connected backend mode using Supabase.

---

## 🚀 How to Run the App

### 📋 Prerequisites

1. **Node.js**: Make sure you have Node.js (v18+ or v20+) installed.
2. **Device / Simulator**:
   - **Physical Device**: Install the **Expo Go** app from the App Store (iOS) or Google Play Store (Android).
   - **Emulators**: Make sure Xcode (macOS/iOS) or Android Studio (Android emulator) is installed and running.

---

### 🛠️ Step-by-Step Setup

#### 1. Install Dependencies
Run the following command in the project root:
```bash
npm install
```

#### 2. Start the Expo Development Server
Launch the server using:
```bash
npm start
```

#### 3. Run the App
Once the server starts, you will see a QR code in the terminal. You can run the app in several ways:
- **Expo Go (Physical Device)**: Open the Expo Go app (Android) or your system Camera app (iOS) and scan the QR code.
- **Android Emulator**: Ensure your Android Emulator is running, then press `a` in your terminal.
- **iOS Simulator**: Press `i` in your terminal (macOS only).
- **Web Browser**: Press `w` in your terminal.

---

## ⚙️ Run Modes

### 1. Demo Mode (Default, Out-of-the-box)
The app is fully configured to run in **Demo Mode** without any external dependencies or API keys. 
- It uses a [mock AuthService](file:///d:/veytrix-app/src/services/AuthService.ts) for signing up, logging in, and password resets.
- Credit checking and video generation are simulated with fallback mock data, allowing you to test the complete user experience immediately.

### 2. Connected Mode (Supabase Backend)
To connect the app to a real Supabase backend:
1. Create a project on [Supabase](https://supabase.com/).
2. Create a `.env` file at the root of the project and add your credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run the SQL schema from [supabase-schema.sql](file:///d:/veytrix-app/supabase-schema.sql) in your Supabase SQL Editor to set up the database tables (e.g. notifications, devices, profiles) and RPC functions (such as `deduct_credits` and `add_credits`).
4. Once these environment variables are set, the app will automatically switch from Demo Mode to using the Supabase backend.

---

## 🔍 Troubleshooting

### 1. Web App "Blank Screen" Error (Zustand v5 `import.meta`)
* **Issue**: The application uses Zustand v5, which uses `import.meta.env` internally. Metro (the Expo bundler) does not fully support `import.meta` on web platforms by default, causing a silent crash and a blank screen.
* **Solution**: I have pre-configured `babel.config.js` with the `{ unstable_transformImportMeta: true }` preset:
  ```javascript
  presets: [['babel-preset-expo', { unstable_transformImportMeta: true }]]
  ```

### 2. Mobile Device Connection Issues / Network Timeouts (macOS/VPN/Docker)
* **Issue**: Expo may pick the incorrect network interface IP address (such as a Docker interface, VM adapter, or VPN) instead of your local Wi-Fi router IP. When this happens, your mobile device running Expo Go won't be able to connect to the computer's packager.
* **Solution**: If running on macOS, run the following command in your terminal to automatically resolve your Wi-Fi interface (`en0` or `en1` for ethernet) and force Expo to bind to the correct local IP:
  ```bash
  export REACT_NATIVE_PACKAGER_HOSTNAME=$(ipconfig getifaddr en0) && npx expo start -c
  ```
  *(Note: Change `en0` to `en1` if you are connected via Ethernet instead of Wi-Fi).*

