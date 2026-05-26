import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  duration: {
    type: Number, // In minutes
    required: [true, 'Duration (in minutes) is required'],
  },
  price: {
    type: Number,
    default: 0,
  },
  tags: {
    type: [String],
    default: [],
  },
  attemptLimit: {
    type: Number,
    default: 3,
  },
  isProctoringEnabled: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp on save
courseSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
