import Question from '../models/Question.js';
import Module from '../models/Module.js';

// Helper to format question object
const formatQuestion = (q) => ({
  id: q._id,
  moduleId: q.moduleId,
  type: q.type,
  question: q.question,
  options: q.options,
  correctAnswer: q.correctAnswer,
  marks: q.marks,
  difficulty: q.difficulty,
  createdAt: q.createdAt,
});

// @desc    Get questions inside a specific module
// @route   GET /api/modules/:moduleId/questions
// @access  Public
export const getQuestionsByModule = async (req, res, next) => {
  try {
    const { moduleId } = req.params;

    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      });
    }

    const questions = await Question.find({ moduleId }).sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      questions: questions.map(q => formatQuestion(q)),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create question under module
// @route   POST /api/modules/:moduleId/questions
// @access  Private/Admin
export const createQuestion = async (req, res, next) => {
  try {
    const { moduleId } = req.params;
    const { type, question, options, correctAnswer, marks, difficulty } = req.body;

    const moduleExists = await Module.findById(moduleId);
    if (!moduleExists) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      });
    }

    const q = await Question.create({
      moduleId,
      type,
      question,
      options: options || [],
      correctAnswer,
      marks: marks || 1,
      difficulty: difficulty || 'easy',
    });

    res.status(201).json({
      success: true,
      question: formatQuestion(q),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update question details
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = async (req, res, next) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!q) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      question: formatQuestion(q),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res, next) => {
  try {
    const q = await Question.findById(req.params.id);

    if (!q) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    await Question.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete questions
// @route   DELETE /api/questions/bulk
// @access  Private/Admin
export const deleteQuestionsBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of question IDs to delete',
      });
    }

    await Question.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: 'Selected questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
