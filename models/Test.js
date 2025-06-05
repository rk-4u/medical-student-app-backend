const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true }],
  status: { type: String, enum: ['in-progress', 'cancelled', 'completed'], default: 'in-progress' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  analytics: {
    correct: { type: Number, default: 0 },
    incorrect: { type: Number, default: 0 },
    notAttempted: { type: Number, default: 0 },
    flagged: { type: Number, default: 0 },
    byCategory: [{ category: String, correct: Number, total: Number }],
    bySubject: [{ subject: String, correct: Number, total: Number }],
    byTopic: [{ topic: String, correct: Number, total: Number }]
  },
  updatedAt: { type: Date, default: Date.now }
});

testSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Test', testSchema);