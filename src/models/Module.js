import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  order: {
    type: Number,
    default: 1,
  },
  description: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Module = mongoose.model('Module', moduleSchema);
export default Module;
