// models/UsageLog.js
const mongoose = require('mongoose');

const usageLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['test', 'agent'], required: true },
  count: { type: Number, default: 1 },
  month: { type: String, required: true }, // Format: YYYY-MM
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UsageLog', usageLogSchema);