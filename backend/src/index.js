// backend/src/index.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const helmet    = require('helmet');
const mongoose  = require('mongoose');
const cron      = require('node-cron');

const authRoutes  = require('./routes/auth');
const floodRoutes = require('./routes/flood');
const userRoutes  = require('./routes/user');
const alertRoutes = require('./routes/alert');

const { fetchAndUpdateFloodData } = require('./services/floodFetcher');
const { sendPendingAlerts }        = require('./services/notificationService');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://floodwatch-web-production-ffc8.up.railway.app',
    'https://floodwatch-web-production.up.railway.app',
    'https://floodwatch-web-lac.vercel.app',
    'https://floodwatch-web-git-main-charuwan230s-projects.vercel.app',
  ],
 
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',   authRoutes);
app.use('/api/flood',  floodRoutes);
app.use('/api/user',   userRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/health', (_, res) => res.json({
  status: 'ok',
  time: new Date().toISOString(),
  db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    fetchAndUpdateFloodData();
  })
  .catch(err => console.error('❌ MongoDB error:', err.message));

// ดึงข้อมูลน้ำทุก 5 นาที
cron.schedule('*/5 * * * *', async () => {
  console.log(`[CRON] ${new Date().toLocaleTimeString()} fetching...`);
  await fetchAndUpdateFloodData();
  await sendPendingAlerts();
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 FloodWatch Backend running on port ${PORT}`);
});
