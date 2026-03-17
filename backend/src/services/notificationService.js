// backend/src/services/notificationService.js
const admin     = require('firebase-admin');
const FloodData = require('../models/FloodData');
const User      = require('../models/User');

const STATUS_TH = {
  safe:  'กลับสู่ภาวะปกติ',
  risk:  'เฝ้าระวัง มีความเสี่ยงน้ำท่วม',
  flood: 'น้ำท่วมวิกฤต อพยพหากจำเป็น',
};

const STATUS_EMOJI = {
  safe:  'OK',
  risk:  'WARNING',
  flood: 'FLOOD',
};

// ── ส่ง Line Bot ───────────────────────────────────────────
async function sendLineMessage(lineUserId, districtName, status, waterLevel) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token || !lineUserId) return false;

  const emoji    = status === 'flood' ? '🚨' : status === 'risk' ? '⚠️' : '✅';
  const color    = status === 'flood' ? '#EF4444' : status === 'risk' ? '#F97316' : '#22C55E';
  const message  = `${STATUS_TH[status]}`;

  try {
    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        to: lineUserId,
        messages: [{
          type: 'flex',
          altText: `${emoji} FloodWatch: ${districtName} - ${STATUS_TH[status]}`,
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#0A0F1E',
              contents: [{
                type: 'box',
                layout: 'horizontal',
                contents: [
                  { type:'text', text:'🌊 FLOOD WATCH', color:'#00D4FF',
                    weight:'bold', size:'md', flex:1 },
                  { type:'text', text:emoji, size:'xl', align:'end' },
                ],
              }],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#0D1526',
              spacing: 'md',
              contents: [
                {
                  type: 'box', layout: 'vertical',
                  backgroundColor: `${color}20`,
                  cornerRadius: '10px',
                  paddingAll: '12px',
                  contents: [{
                    type: 'text',
                    text: `${emoji} ${districtName}`,
                    color: color, weight: 'bold', size: 'lg',
                  }],
                },
                {
                  type: 'box', layout: 'vertical', spacing: 'sm',
                  contents: [
                    { type:'text', text:`สถานะ: ${STATUS_TH[status]}`,
                      color:'#E2E8F0', size:'sm' },
                    { type:'text', text:`ระดับน้ำ: ${waterLevel?.toFixed(0)} ซม.`,
                      color:'#94A3B8', size:'sm' },
                    { type:'text',
                      text:`เวลา: ${new Date().toLocaleString('th-TH')}`,
                      color:'#4A5568', size:'xs' },
                  ],
                },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#0A0F1E',
              contents: [{
                type: 'button',
                action: {
                  type: 'uri',
                  label: 'ดูแผนที่น้ำท่วม',
                  uri: process.env.FRONTEND_URL || 'http://localhost:5173',
                },
                style: 'primary',
                color: '#00D4FF',
              }],
            },
          },
        }],
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[Line] ✅ ส่งไป ${lineUserId.slice(0,10)}... [${districtName}→${status}]`);
      return true;
    } else {
      console.error(`[Line] ❌ ${JSON.stringify(data)}`);
      return false;
    }
  } catch (err) {
    console.error(`[Line] ❌ ${err.message}`);
    return false;
  }
}

// ── ส่ง FCM (Flutter app) ─────────────────────────────────
async function sendFCM(token, districtName, status, waterLevel) {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title: `🌊 FloodWatch — ${districtName}`,
        body:  `${STATUS_TH[status]} (น้ำ ${waterLevel?.toFixed(0)} ซม.)`,
      },
      android: {
        priority: 'high',
        notification: {
          channelId: 'flood_alerts',
          sound:     'default',
          color:     status === 'flood' ? '#EF4444' :
                     status === 'risk'  ? '#F97316' : '#22C55E',
        },
      },
    });
    console.log(`[FCM] ✅ ส่งไป ${token.slice(0,20)}... [${districtName}→${status}]`);
    return true;
  } catch (err) {
    console.error(`[FCM] ❌ ${err.message}`);
    return false;
  }
}

// ── ฟังก์ชันหลัก ───────────────────────────────────────────
async function sendPendingAlerts(force = false) {
  try {
    // ดึงข้อมูลล่าสุดของแต่ละอำเภอ
    const query = force ? {} : { $expr: { $ne: ['$status', '$prevStatus'] } };
    const latest = await FloodData.aggregate([
      { $sort: { fetchedAt: -1 } },
      { $group: { _id: '$districtId', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $match: query },
    ]);

    if (!latest.length) {
      console.log('[Notify] No status changes');
      return;
    }

    // ดึง Users ทั้งหมดที่มี FCM Token หรือ Line User ID
    const users = await User.find({
      $or: [
        { 'notifications.fcmToken': { $ne: null, $ne: '' } },
        { lineUserId: { $ne: null, $ne: '' } },
      ],
      'notifications.push': true,
    }).select('notifications.fcmToken notifications.levels lineUserId address');

    if (!users.length) {
      console.log('[Notify] ไม่มี Users ในระบบ');
      return;
    }

    let sentFCM = 0, sentLine = 0;

    for (const data of latest) {
      for (const user of users) {
        const levels = user.notifications?.levels;
        // เช็คว่า user สนใจ status นี้ไหม
        if (levels && levels[data.status] === false) continue;

        // ── ส่ง FCM ─────────────────────────────────────────
        const fcmToken = user.notifications?.fcmToken;
        if (fcmToken) {
          const ok = await sendFCM(fcmToken, data.districtName, data.status, data.waterLevel);
          if (ok) sentFCM++;
        }

        // ── ส่ง Line ─────────────────────────────────────────
        if (user.lineUserId) {
          const ok = await sendLineMessage(
            user.lineUserId, data.districtName, data.status, data.waterLevel
          );
          if (ok) sentLine++;
        }
      }
    }

    console.log(`[Notify] ✅ FCM: ${sentFCM} | Line: ${sentLine} notifications`);
  } catch (err) {
    console.error('[Notify] Error:', err.message);
  }
}

module.exports = { sendPendingAlerts, sendLineMessage };