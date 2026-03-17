// backend/src/routes/alert.js
const express   = require('express');
const router    = express.Router();
const auth      = require('../middleware/auth');
const User      = require('../models/User');
const FloodData = require('../models/FloodData');
const { sendPendingAlerts } = require('../services/notificationService');

router.get('/vapid-key', (_, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

router.post('/subscribe', auth, async (req, res) => {
  try {
    const { subscription, fcmToken } = req.body;
    await User.findOneAndUpdate(
      { uid: req.user.uid },
      {
        'notifications.pushSubscription': subscription || null,
        'notifications.fcmToken': fcmToken || '',
        'notifications.push': true,
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── ทดสอบส่ง notification จริง ────────────────────────────
router.post('/test', async (req, res) => {
  try {
    await sendPendingAlerts(true);
    res.json({ success: true, message: 'ส่ง notification แล้ว' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── จำลองน้ำท่วมอำเภอที่ระบุ ─────────────────────────────
router.post('/simulate', async (req, res) => {
  try {
    const { districtId, status } = req.body;
    // status: 'flood' | 'risk' | 'safe'

    const DISTRICTS = {
      mueang:      { name: 'เมืองชลบุรี',  lat: 13.3611, lng: 100.9847 },
      banbueng:    { name: 'บ้านบึง',       lat: 13.2456, lng: 101.1057 },
      nongya:      { name: 'หนองใหญ่',      lat: 13.1556, lng: 101.2031 },
      banglamung:  { name: 'บางละมุง',      lat: 12.9236, lng: 100.8775 },
      phantong:    { name: 'พานทอง',        lat: 13.4501, lng: 101.1155 },
      phanasnikom: { name: 'พนัสนิคม',      lat: 13.4498, lng: 101.1842 },
      sriracha:    { name: 'ศรีราชา',       lat: 13.1282, lng: 100.9280 },
      kosichang:   { name: 'เกาะสีชัง',     lat: 13.1518, lng: 100.8044 },
      sattahip:    { name: 'สัตหีบ',        lat: 12.6617, lng: 100.9015 },
      borthong:    { name: 'บ่อทอง',        lat: 13.3045, lng: 101.2888 },
      kochan:      { name: 'เกาะจันทร์',    lat: 13.5201, lng: 101.2102 },
    };

    const d = DISTRICTS[districtId];
    if (!d) return res.status(400).json({ error: 'ไม่พบอำเภอนี้' });

    const waterLevel = status === 'flood' ? 95 : status === 'risk' ? 65 : 10;
    const rainfall   = status === 'flood' ? 45 : status === 'risk' ? 20 : 2;

    // ดึงสถานะเดิม
    const prev = await FloodData
      .findOne({ districtId })
      .sort({ fetchedAt: -1 })
      .select('status');

    // บันทึกสถานะใหม่
    await FloodData.create({
      districtId,
      districtName: d.name,
      status,
      prevStatus:   prev?.status || 'safe',
      waterLevel,
      rainfall,
      temperature:  30,
      humidity:     80,
      windSpeed:    10,
      source:       'simulated-test',
      fetchedAt:    new Date(),
    });

    // ส่ง notification ทันที
    await sendPendingAlerts(false);

    res.json({
      success: true,
      message: `จำลอง ${d.name} → ${status} สำเร็จ`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Line Notify
// Line Bot (Messaging API)
router.post('/line-bot', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) return res.status(500).json({ error: 'LINE_CHANNEL_ACCESS_TOKEN not set' });

    const targetId = userId || process.env.LINE_USER_ID;
    if (!targetId) return res.status(400).json({ error: 'userId required' });

    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        to: targetId,
        messages: [{
          type: 'flex',
          altText: message,
          contents: {
            type: 'bubble',
            styles: {
              header: { backgroundColor: '#0A0F1E' },
              body:   { backgroundColor: '#0D1526' },
            },
            header: {
              type: 'box',
              layout: 'horizontal',
              contents: [
                { type:'text', text:'🌊 FLOOD WATCH', color:'#00D4FF',
                  weight:'bold', size:'md' },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                { type:'text', text: message,
                  color:'#E2E8F0', wrap: true, size:'sm' },
              ],
            },
          },
        }],
      }),
    });

    const data = await response.json();
    response.ok
      ? res.json({ success: true })
      : res.status(400).json({ error: JSON.stringify(data) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Line Webhook (รับ User ID อัตโนมัติ) ──────────────────
router.post('/line-webhook', async (req, res) => {
  try {
    const events = req.body.events || []
    
    for (const event of events) {
      const userId = event.source?.userId
      if (!userId) continue

      // บันทึก User ID ลง MongoDB
      if (event.type === 'follow' || event.type === 'message') {
        await User.findOneAndUpdate(
          { lineUserId: userId },
          { lineUserId: userId, lineRegistered: true },
          { upsert: true, new: true }
        )
        console.log(`[Line] User registered: ${userId}`)

        // ส่งข้อความต้อนรับ
        if (event.type === 'follow') {
          await fetch('https://api.line.me/v2/bot/message/reply', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{
                type: 'text',
                text: `ยินดีต้อนรับสู่ FloodWatch Chonburi!\n\nระบบจะแจ้งเตือนน้ำท่วมในจังหวัดชลบุรีให้คุณอัตโนมัติ\n\nUser ID ของคุณ:\n${userId}\n\nคัดลอก ID นี้ไปใส่ในเว็บแอพได้เลยครับ`
              }]
            })
          })
        }
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error('[Webhook]', err.message)
    res.status(500).json({ error: err.message })
  }
})

module.exports = router;