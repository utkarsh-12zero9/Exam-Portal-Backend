import mongoose from 'mongoose';

const violationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const attemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submittedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  score: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    default: 0,
  },
  percentage: {
    type: Number,
    default: 0,
  },
  totalQuestions: {
    type: Number,
    default: 0,
  },
  answeredQuestions: {
    type: Number,
    default: 0,
  },
  answers: {
    type: Map,
    of: String,
    default: {},
  },
  violations: {
    type: [violationSchema],
    default: [],
  },
  violationCount: {
    type: Number,
    default: 0,
  },
  autoSubmitted: {
    type: Boolean,
    default: false,
  },
  submissionReason: {
    type: String,
    default: 'User submitted',
  },
});

const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  enrolledAt: {
    type: Date,
    default: Date.now,
  },
  attempts: {
    type: [attemptSchema],
    default: [],
  },
});

// Ensure compound index to make User + Course enrollments unique
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
export default Enrollment;
