// backend/src/index.js
require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const mongoose = require('mongoose');
const fetch    = require('node-fetch');

const User = require('./models/User');

const app = express();

// ─────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────
app.use(cors());
app.use(express.json()); // 🔥 สำคัญมาก

// ─────────────────────────────────────────
// MongoDB
// ─────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));


// ─────────────────────────────────────────
// LINE WEBHOOK (🔥 ตัวสำคัญสุด)
// ─────────────────────────────────────────
app.post('/webhook', async (req, res) => {
  try {
    const events = req.body.events;

    if (!events) return res.sendStatus(200);

    for (const event of events) {

      // ── เมื่อ user พิมพ์ข้อความ ───────────────
      if (event.type === 'message') {

        const userId = event.source.userId;
        console.log('📩 LINE USER ID:', userId);

        // 🔥 บันทึก user ลง DB อัตโนมัติ
        await User.findOneAndUpdate(
          { lineUserId: userId },
          { lineUserId: userId },
          { upsert: true, new: true }
        );

        // 🔥 ตอบกลับ user
        await fetch('https://api.line.me/v2/bot/message/reply', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            replyToken: event.replyToken,
            messages: [
              {
                type: 'text',
                text: `✅ เชื่อมต่อสำเร็จ!\nUser ID ของคุณถูกบันทึกแล้ว`,
              }
            ],
          }),
        });
      }
    }

    res.sendStatus(200);

  } catch (err) {
    console.error('❌ Webhook Error:', err.message);
    res.sendStatus(500);
  }
});


// ─────────────────────────────────────────
// TEST ROUTE (เช็ค server)
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('🔥 FloodWatch API Running');
});


// ─────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});