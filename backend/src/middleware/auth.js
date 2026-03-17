// backend/src/middleware/auth.js
require('dotenv').config();
const admin = require('firebase-admin');

// เริ่ม Firebase เฉพาะเมื่อมี credentials ครบ
const hasFirebase =
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.FIREBASE_CLIENT_EMAIL;

if (hasFirebase && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   process.env.FIREBASE_PROJECT_ID,
        privateKey:  process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('✅ Firebase Admin initialized');
  } catch (err) {
    console.warn('⚠️  Firebase init failed:', err.message);
  }
} else if (!hasFirebase) {
  console.warn('⚠️  Firebase credentials missing — running in dev mode (no auth)');
}

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];

  // ถ้าไม่มี Firebase หรือไม่มี token → dev mode
  if (!hasFirebase || !token) {
    req.user = {
      uid:   'dev_user_001',
      email: 'dev@floodwatch.app',
      name:  'Dev User',
    };
    return next();
  }

  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
