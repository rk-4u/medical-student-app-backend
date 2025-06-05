const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: String }],
  subjects: [{ type: String }],
  topics: [{ type: String }],
  questionText: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    media: [{ type: String }]
  }],
  correctAnswers: [{ type: Number, required: true }],
  explanation: {
    text: { type: String, required: true },
    media: [{ type: String }]
  },
  media: [{ type: String }],
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  sourceUrl: { type: String },
  usageCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  userInteractions: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    selectedAnswer: { type: Number },
    isFlagged: { type: Boolean, default: false },
    isCorrect: { type: Boolean },
    note: { type: String },
    updatedAt: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model('Question', questionSchema);