const Joi = require('joi');

const validateSignup = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  });
  return schema.validate(data);
};

const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3),
    username: Joi.string().min(3),
    email: Joi.string().email(),
    profilePicture: Joi.string().uri(),
  });
  return schema.validate(data);
};

const validateQuestion = (data) => {
  const schema = Joi.object({
    categories: Joi.array().items(Joi.string()).min(1).required(),
    subjects: Joi.array().items(Joi.string()).min(1).required(),
    topics: Joi.array().items(Joi.string()),
    questionText: Joi.string().required(),
    options: Joi.array().items(
      Joi.object({
        text: Joi.string().required(),
        media: Joi.array().items(Joi.string().uri()).default([])
      })
    ).min(2).required(),
    correctAnswers: Joi.array().items(Joi.number()).min(1).required(),
    explanation: Joi.object({
      text: Joi.string().required(),
      media: Joi.array().items(Joi.string().uri()).default([])
    }).required(),
    media: Joi.array().items(Joi.string().uri()).default([]),
    difficulty: Joi.string().valid('easy', 'medium', 'hard').required(),
    sourceUrl: Joi.string().uri().allow(''),
  });
  return schema.validate(data);
};

const validateTestCreation = (data) => {
  const schema = Joi.object({
    categories: Joi.array().items(Joi.string()),
    subjects: Joi.array().items(Joi.string()),
    topics: Joi.array().items(Joi.string()),
    count: Joi.number().min(1).max(50).required(),
  });
  return schema.validate(data);
};

const validateUserInteraction = (data) => {
  const schema = Joi.object({
    testId: Joi.string().required(),
    selectedAnswer: Joi.number().optional(),
    note: Joi.string().allow('').optional(),
    isFlagged: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

const validateTestProgress = (data) => {
  const schema = Joi.object({
    questionId: Joi.string().required(),
    selectedAnswer: Joi.number().optional(),
    note: Joi.string().allow('').optional(),
    isFlagged: Joi.boolean().optional(),
  });
  return schema.validate(data);
};

module.exports = { validateSignup, validateLogin, validateUpdateProfile, validateQuestion, validateTestCreation, validateUserInteraction, validateTestProgress };