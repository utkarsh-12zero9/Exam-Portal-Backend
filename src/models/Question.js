import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: [true, 'Module ID is required'],
  },
  type: {
    type: String,
    enum: ['mcq', 'subjective', 'coding'],
    required: [true, 'Question type is required'],
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
  },
  options: {
    type: [String],
    default: [], // Only used for type === 'mcq'
  },
  correctAnswer: {
    type: String,
    required: [true, 'Correct answer is required'],
  },
  marks: {
    type: Number,
    required: [true, 'Marks is required'],
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Question = mongoose.model('Question', questionSchema);
export default Question;
