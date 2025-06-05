// controllers/adminController.js
const User = require('../models/User');
const Question = require('../models/Question');
const Test = require('../models/Test');
const UsageLog = require('../models/UsageLog');

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -otp -otpExpires');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const tests = await Test.find();
    const analytics = {
      totalUsers: await User.countDocuments(),
      totalQuestions: await Question.countDocuments(),
      totalTests: tests.length,
      testStats: {
        correct: tests.reduce((sum, test) => sum + test.analytics.correct, 0),
        incorrect: tests.reduce((sum, test) => sum + test.analytics.incorrect, 0),
        flagged: tests.reduce((sum, test) => sum + test.analytics.flagged, 0),
      },
      byCategory: {},
      bySubject: {},
      byTopic: {},
    };

    tests.forEach(test => {
      test.analytics.byCategory.forEach(({ category, correct, total }) => {
        analytics.byCategory[category] = analytics.byCategory[category] || { correct: 0, total: 0 };
        analytics.byCategory[category].correct += correct;
        analytics.byCategory[category].total += total;
      });
      test.analytics.bySubject.forEach(({ subject, correct, total }) => {
        analytics.bySubject[subject] = analytics.bySubject[subject] || { correct: 0, total: 0 };
        analytics.bySubject[subject].correct += correct;
        analytics.bySubject[subject].total += total;
      });
      test.analytics.byTopic.forEach(({ topic, correct, total }) => {
        analytics.byTopic[topic] = analytics.byTopic[topic] || { correct: 0, total: 0 };
        analytics.byTopic[topic].correct += correct;
        analytics.byTopic[topic].total += total;
      });
    });

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

const updateUserPlan = async (req, res, next) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { subscriptionPlan: plan },
      { new: true }
    ).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const activateDeactivateUser = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, updateUser, deleteUser, deleteQuestion, getAnalytics, updateUserPlan, activateDeactivateUser };
