const axios     = require('axios');
const FloodData = require('../models/FloodData');

const DISTRICTS = [
  { id:'mueang',      name:'เมืองชลบุรี', lat:13.3611, lng:100.9847 },
  { id:'banbueng',    name:'บ้านบึง',      lat:13.2456, lng:101.1057 },
  { id:'nongya',      name:'หนองใหญ่',     lat:13.1556, lng:101.2031 },
  { id:'banglamung',  name:'บางละมุง',     lat:12.9236, lng:100.8775 },
  { id:'phantong',    name:'พานทอง',       lat:13.4501, lng:101.1155 },
  { id:'phanasnikom', name:'พนัสนิคม',     lat:13.4498, lng:101.1842 },
  { id:'sriracha',    name:'ศรีราชา',      lat:13.1282, lng:100.9280 },
  { id:'kosichang',   name:'เกาะสีชัง',    lat:13.1518, lng:100.8044 },
  { id:'sattahip',    name:'สัตหีบ',       lat:12.6617, lng:100.9015 },
  { id:'borthong',    name:'บ่อทอง',       lat:13.3045, lng:101.2888 },
  { id:'kochan',      name:'เกาะจันทร์',   lat:13.5201, lng:101.2102 },
];

function calcStatus(waterLevel) {
  if (waterLevel >= 80) return 'flood';
  if (waterLevel >= 45) return 'risk';
  return 'safe';
}

// ดึงอากาศ + ปริมาณฝนจาก Open-Meteo
async function fetchWeather(lat, lng) {
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'precipitation,temperature_2m,relativehumidity_2m,windspeed_10m',
        past_days: 1,
        forecast_days: 1,
        timezone: 'Asia/Bangkok',
      },
      timeout: 8000,
    });
    const h   = res.data.hourly;
    const idx = new Date().getHours();
    return {
      rainfall:    h.precipitation?.[idx]       ?? 0,
      temperature: h.temperature_2m?.[idx]      ?? 30,
      humidity:    h.relativehumidity_2m?.[idx] ?? 70,
      windSpeed:   h.windspeed_10m?.[idx]       ?? 0,
    };
  } catch {
    return null;
  }
}

// คำนวณระดับน้ำจากปริมาณฝนสะสม
async function fetchWaterLevel(lat, lng) {
  try {
    const res = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: lat,
        longitude: lng,
        hourly: 'precipitation',
        past_days: 1,
        forecast_days: 1,
        timezone: 'Asia/Bangkok',
      },
      timeout: 8000,
    });
    const precipitation = res.data?.hourly?.precipitation ?? [];
    const recent = precipitation.slice(-6);
    const total  = recent.reduce((a, b) => a + b, 0);
    return Math.min(total * 3.5, 120);
  } catch {
    return null;
  }
}

// จำลองข้อมูลเมื่อ API ไม่ตอบ
function simulate(districtId) {
  const seed = districtId.length * 13;
  return {
    waterLevel:  (seed * 7) % 100,
    rainfall:    (seed * 3) % 40,
    temperature: 28 + (seed % 8),
    humidity:    65 + (seed % 30),
    windSpeed:   5  + (seed % 20),
  };
}

async function fetchAndUpdateFloodData() {
  let updated = 0;
  for (const d of DISTRICTS) {
    try {
      const [weather, waterLevelRaw] = await Promise.all([
        fetchWeather(d.lat, d.lng),
        fetchWaterLevel(d.lat, d.lng),
      ]);

      const prev = await FloodData
        .findOne({ districtId: d.id })
        .sort({ fetchedAt: -1 })
        .select('status');

      const sim = simulate(d.id);
      const wl  = waterLevelRaw ?? sim.waterLevel;
      const src = (waterLevelRaw !== null && weather)
        ? 'OpenMeteo+Rainfall' : 'simulated';

      await FloodData.create({
        districtId:   d.id,
        districtName: d.name,
        status:       calcStatus(wl),
        prevStatus:   prev?.status || 'safe',
        waterLevel:   wl,
        rainfall:     weather?.rainfall    ?? sim.rainfall,
        temperature:  weather?.temperature ?? sim.temperature,
        humidity:     weather?.humidity    ?? sim.humidity,
        windSpeed:    weather?.windSpeed   ?? sim.windSpeed,
        stationId:    '',
        source:       src,
        fetchedAt:    new Date(),
      });

      console.log(`  [${d.name}] ${calcStatus(wl)} | น้ำ ${wl.toFixed(0)}ซม | ${src}`);
      updated++;
    } catch (err) {
      console.error(`  [ERROR] ${d.name}: ${err.message}`);
    }
  }
  console.log(`[Fetcher] ✅ ${updated}/11 districts updated`);
}

module.exports = { fetchAndUpdateFloodData, DISTRICTS };