// backend/src/models/User.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    unique: true,
    default: uuidv4,   // ✅ สร้าง uid อัตโนมัติ
  },

  email: {
    type: String,
    required: true
  },

  displayName: {
    type: String,
    default: ''
  },

  photoURL: {
    type: String,
    default: ''
  },

  lineUserId: {
    type: String,
    default: null
  },

  lineRegistered: {
    type: Boolean,
    default: false
  },

  address: {
    districtId:   { type: String, default: '' },
    districtName: { type: String, default: '' },
    detail:       { type: String, default: '' },
    lat:          { type: Number, default: 0 },
    lng:          { type: Number, default: 0 },
  },

  notifications: {
    push:  { type: Boolean, default: true },
    email: { type: Boolean, default: true },

    fcmToken: {
      type: String,
      default: null
    },

    pushSubscription: {
      type: Object,
      default: null
    },

    levels: {
      safe:  { type: Boolean, default: false },
      risk:  { type: Boolean, default: true },
      flood: { type: Boolean, default: true },
    },
  },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);