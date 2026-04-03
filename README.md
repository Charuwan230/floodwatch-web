<<<<<<< HEAD
# 🌊 FloodWatch Chonburi

## ⚡ เริ่มรันทันที

### Backend
```bash
cd backend
npm install
# แก้ FIREBASE_CLIENT_EMAIL ใน .env ก่อน (ดูด้านล่าง)
npm run dev
```

### Flutter
```bash
cd flutter_app
flutter pub get
flutter run -d chrome
```

---

## 🔑 สิ่งที่ต้องทำก่อนรัน — แก้ FIREBASE_CLIENT_EMAIL

1. เปิดไฟล์ JSON ที่ download จาก Firebase Console
2. หาบรรทัด `"client_email"`:
   ```json
   "client_email": "firebase-adminsdk-ab12c@floodchonburi.iam.gserviceaccount.com"
   ```
3. Copy ค่านั้น → เปิด `backend/.env` → แทน `FIREBASE_CLIENT_EMAIL=`

---

## ✅ สถานะ Keys

| Key | สถานะ |
|-----|-------|
| MongoDB URI | ✅ ใส่แล้ว |
| Firebase Project ID | ✅ ใส่แล้ว |
| Firebase Private Key | ✅ ใส่แล้ว |
| **Firebase Client Email** | ⚠️ **ต้องใส่เพิ่ม** |
| VAPID Public Key | ✅ ใส่แล้ว |
| VAPID Private Key | ✅ ใส่แล้ว |

---

## 📡 ทดสอบ API

```
http://localhost:4000/health      → เช็ค server
http://localhost:4000/api/flood   → ข้อมูลน้ำทุกอำเภอ
```

---

## 📁 โครงสร้าง

```
floodwatch-final/
├── backend/
│   ├── .env                    ← ตั้งค่า (แก้ client_email!)
│   ├── package.json
│   └── src/
│       ├── index.js
│       ├── middleware/auth.js
│       ├── models/
│       │   ├── User.js
│       │   └── FloodData.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── flood.js
│       │   ├── user.js
│       │   └── alert.js
│       └── services/
│           ├── floodFetcher.js        ← Open-Meteo + ThaiWater
│           └── notificationService.js ← Push Notifications
│
└── flutter_app/
    ├── pubspec.yaml
    └── lib/
        ├── main.dart
        ├── theme/app_theme.dart
        ├── models/district.dart
        ├── services/
        │   ├── api_service.dart    ← เชื่อม Backend
        │   └── auth_service.dart   ← Login
        ├── screens/
        │   ├── login_screen.dart
        │   ├── home_screen.dart
        │   ├── map_screen.dart     ← แผนที่ OpenStreetMap
        │   └── profile_screen.dart
        └── widgets/
            ├── district_card.dart
            ├── district_detail_sheet.dart
            └── status_summary.dart
```
=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> dd9c3e7217075f9b7e3dd4a8706b856ef068e665
