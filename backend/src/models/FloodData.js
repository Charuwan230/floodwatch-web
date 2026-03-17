// backend/src/models/FloodData.js
const mongoose = require('mongoose');

const floodDataSchema = new mongoose.Schema({
  districtId:   { type: String, required: true, index: true },
  districtName: { type: String, required: true },
  status:       { type: String, enum: ['safe','risk','flood'], default: 'safe' },
  prevStatus:   { type: String, enum: ['safe','risk','flood'], default: 'safe' },
  waterLevel:   { type: Number, default: 0 },
  rainfall:     { type: Number, default: 0 },
  humidity:     { type: Number, default: 0 },
  temperature:  { type: Number, default: 0 },
  windSpeed:    { type: Number, default: 0 },
  stationId:    { type: String, default: '' },
  source:       { type: String, default: 'simulated' },
  fetchedAt:    { type: Date,   default: Date.now },
}, { timestamps: true });

floodDataSchema.index({ districtId: 1, fetchedAt: -1 });

module.exports = mongoose.model('FloodData', floodDataSchema);
