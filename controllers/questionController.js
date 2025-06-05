const Question = require('../models/Question');
const Test = require('../models/Test');
const { validateQuestion, validateUserInteraction } = require('../utils/validation');

const createQuestion = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can create questions' });

    const { error } = validateQuestion(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const question = new Question({
      ...req.body,
      userId: req.user._id
    });
    await question.save();
    res.status(201).json(question);
  } catch (error) {
    next(error);
  }
};

const getQuestions = async (req, res, next) => {
  try {
    const { categories, subjects, topics, difficulty, status, correct, flagged } = req.query;
    
    const baseFilter = {
      userId: req.user._id
    };

    // Existing category/subject/topic/difficulty filters
    if (categories) baseFilter.categories = { $in: categories.split(',') };
    if (subjects) baseFilter.subjects = { $in: subjects.split(',') };
    if (topics) baseFilter.topics = { $in: topics.split(',') };
    if (difficulty) baseFilter.difficulty = difficulty;

    // Status filters (used/unused)
    if (status === 'used') {
      baseFilter['userInteractions.userId'] = req.user._id;
    } else if (status === 'unused') {
      baseFilter['userInteractions.userId'] = { $ne: req.user._id };
    }

    // Correct/incorrect filters
    if (correct === 'true') {
      baseFilter['userInteractions'] = {
        $elemMatch: { userId: req.user._id, isCorrect: true }
      };
    } else if (correct === 'false') {
      baseFilter['userInteractions'] = {
        $elemMatch: { userId: req.user._id, isCorrect: false }
      };
    }

    // Flagged filters
    if (flagged === 'true') {
      baseFilter['userInteractions'] = {
        $elemMatch: { userId: req.user._id, isFlagged: true }
      };
    } else if (flagged === 'false') {
      baseFilter['userInteractions'] = {
        $elemMatch: { userId: req.user._id, isFlagged: false }
      };
    }

    const questions = await Question.find(baseFilter).select('-userInteractions');
    res.json(questions);
  } catch (error) {
    next(error);
  }
};

const getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });
    if (!question) return res.status(404).json({ message: 'Question not found or unauthorized' });

    const { testId } = req.query;
    const response = question.toObject();
    response.userInteraction = testId
      ? question.userInteractions.find(
          i => i.userId.toString() === req.user._id.toString() && i.testId.toString() === testId
        )
      : null;
    res.json(response);
  } catch (error) {
    next(error);
  }
};

const updateQuestion = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can update their questions' });

    const question = await Question.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });
    if (!question) return res.status(403).json({ message: 'Question not found or unauthorized' });

    const { error } = validateQuestion(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedQuestion);
  } catch (error) {
    next(error);
  }
};

const updateUserInteraction = async (req, res, next) => {
  try {
    const { testId, selectedAnswer, note, isFlagged } = req.body;
    const { error } = validateUserInteraction(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const test = await Test.findById(testId);
    if (!test || test.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Test not found or unauthorized' });
    }
    if (test.status !== 'in-progress') {
      return res.status(403).json({ message: 'Cannot update interaction for completed or cancelled test' });
    }

    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!question) return res.status(404).json({ message: 'Question not found or unauthorized' });

    let interaction = question.userInteractions.find(
      i => i.userId.toString() === req.user._id.toString() && i.testId.toString() === testId
    );

    let isCorrect;
    if (selectedAnswer !== undefined) {
      isCorrect = question.correctAnswers.includes(selectedAnswer);
    }

    if (!interaction) {
      interaction = {
        userId: req.user._id,
        testId,
        selectedAnswer,
        note: note || '',
        isFlagged: isFlagged || false,
        isCorrect: isCorrect
      };
      question.userInteractions.push(interaction);
    } else {
      if (selectedAnswer !== undefined) {
        interaction.selectedAnswer = selectedAnswer;
        interaction.isCorrect = isCorrect;
      }
      if (note !== undefined) interaction.note = note;
      if (isFlagged !== undefined) interaction.isFlagged = isFlagged;
      interaction.updatedAt = new Date();
    }

    await question.save();
    res.json(question);
  } catch (error) {
    next(error);
  }
};

const deleteQuestion = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only students can delete their questions' });

    const question = await Question.findOne({
      _id: req.params.id,
      userId: req.user._id
    });
    if (!question) return res.status(403).json({ message: 'Question not found or unauthorized' });

    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createQuestion, getQuestions, getQuestion, updateQuestion, updateUserInteraction, deleteQuestion };