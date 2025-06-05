const Test = require('../models/Test');
const Question = require('../models/Question');
const UsageLog = require('../models/UsageLog');
const { validateTestCreation } = require('../utils/validation');

const createTest = async (req, res, next) => {
  try {
    const { error } = validateTestCreation(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { categories, subjects, topics, count } = req.body;
    if (count < 1 || count > 50) return res.status(400).json({ message: 'Invalid question count' });

    const month = new Date().toISOString().slice(0, 7);
    const usage = await UsageLog.findOne({ userId: req.user._id, type: 'test', month });
    const limits = { free: 10, pro: 200, premium: Infinity };
    const used = usage ? usage.count : 0;
    if (used >= limits[req.user.subscriptionPlan]) {
      return res.status(403).json({ message: 'Monthly test limit reached' });
    }

    const query = {};
    if (categories) query.categories = { $in: categories };
    if (subjects) query.subjects = { $in: subjects };
    if (topics) query.topics = { $in: topics };

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } },
    ]);

    if (questions.length < count) return res.status(400).json({ message: 'Not enough questions available' });

    const questionIds = questions.map(q => q._id);
    const test = new Test({
      userId: req.user._id,
      questionIds,
      status: 'in-progress'
    });
    await test.save();

    for (const qId of questionIds) {
      await Question.updateOne(
        { _id: qId },
        {
          $push: {
            userInteractions: {
              userId: req.user._id,
              testId: test._id,
              isFlagged: false
            }
          },
          $inc: { usageCount: 1 }
        }
      );
    }

    await UsageLog.findOneAndUpdate(
      { userId: req.user._id, type: 'test', month },
      { $inc: { count: 1 } },
      { upsert: true }
    );

    res.status(201).json({ testId: test._id, questionIds });
  } catch (error) {
    next(error);
  }
};

const getTests = async (req, res, next) => {
  try {
    const tests = await Test.find({ userId: req.user._id });
    res.json(tests);
  } catch (error) {
    next(error);
  }
};

const getTest = async (req, res, next) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, userId: req.user._id }).populate('questionIds');
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await Question.find({ _id: { $in: test.questionIds } });
    const response = {
      ...test.toObject(),
      questions: questions.map(q => ({
        ...q.toObject(),
        userInteraction: q.userInteractions.find(
          i => i.userId.toString() === req.user._id.toString() && i.testId.toString() === test._id.toString()
        )
      }))
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const submitTest = async (req, res, next) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, userId: req.user._id });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (test.status !== 'in-progress') {
      return res.status(403).json({ message: 'Test already completed or cancelled' });
    }

    test.status = 'completed';
    test.endTime = new Date();

    const questions = await Question.find({ _id: { $in: test.questionIds } });
    const categoryStats = {};
    const subjectStats = {};
    const topicStats = {};

    for (const question of questions) {
      const interaction = question.userInteractions.find(
        i => i.userId.toString() === req.user._id.toString() && i.testId.toString() === test._id.toString()
      );

      if (interaction && interaction.isCorrect !== undefined) {
        if (interaction.isCorrect) test.analytics.correct++;
        else test.analytics.incorrect++;
      } else {
        test.analytics.notAttempted++;
      }

      if (interaction && interaction.isFlagged) test.analytics.flagged++;

      question.categories.forEach(cat => {
        categoryStats[cat] = categoryStats[cat] || { correct: 0, total: 0 };
        categoryStats[cat].total++;
        if (interaction && interaction.isCorrect) categoryStats[cat].correct++;
      });
      question.subjects.forEach(sub => {
        subjectStats[sub] = subjectStats[sub] || { correct: 0, total: 0 };
        subjectStats[sub].total++;
        if (interaction && interaction.isCorrect) subjectStats[sub].correct++;
      });
      question.topics.forEach(top => {
        topicStats[top] = topicStats[top] || { correct: 0, total: 0 };
        topicStats[top].total++;
        if (interaction && interaction.isCorrect) topicStats[top].correct++;
      });
    }

    test.analytics.byCategory = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      ...stats
    }));
    test.analytics.bySubject = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      ...stats
    }));
    test.analytics.byTopic = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      ...stats
    }));

    await test.save();
    res.json(test);
  } catch (error) {
    next(error);
  }
};

const cancelTest = async (req, res, next) => {
  try {
    const test = await Test.findOne({ _id: req.params.id, userId: req.user._id });
    if (!test) return res.status(404).json({ message: 'Test not found' });
    if (test.status !== 'in-progress') {
      return res.status(403).json({ message: 'Test already completed or cancelled' });
    }

    test.status = 'cancelled';
    test.endTime = new Date();
    await test.save();
    res.json({ message: 'Test cancelled', test });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTest, getTests, getTest, submitTest, cancelTest };