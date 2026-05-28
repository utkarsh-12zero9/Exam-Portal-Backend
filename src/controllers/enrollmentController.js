import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Question from '../models/Question.js';

// Helper to format attempt structure to match frontend expectations
const formatAttempt = (attempt) => {
  // Convert answers Map to plain object for frontend consumption
  const plainAnswers = {};
  if (attempt.answers) {
    if (attempt.answers instanceof Map) {
      attempt.answers.forEach((val, key) => {
        plainAnswers[key] = val;
      });
    } else {
      Object.assign(plainAnswers, attempt.answers);
    }
  }

  return {
    id: attempt.attemptId, // Frontend uses 'id' instead of 'attemptId'
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    status: attempt.status,
    score: attempt.score,
    totalMarks: attempt.totalMarks,
    percentage: attempt.percentage,
    totalQuestions: attempt.totalQuestions,
    answeredQuestions: attempt.answeredQuestions,
    answers: plainAnswers,
    violations: attempt.violations || [],
    violationCount: attempt.violationCount,
    autoSubmitted: attempt.autoSubmitted,
    submissionReason: attempt.submissionReason,
  };
};

// Helper to format enrollment object
const formatEnrollment = async (enrollment) => {
  const course = await Course.findById(enrollment.courseId);
  return {
    id: enrollment._id,
    userId: enrollment.userId,
    courseId: enrollment.courseId,
    courseTitle: course ? course.title : 'Deleted Course',
    enrolledAt: enrollment.enrolledAt,
    attempts: (enrollment.attempts || []).map(attempt => formatAttempt(attempt)),
  };
};

// @desc    Enroll student in a course
// @route   POST /api/enrollments
// @access  Private
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: 'Course ID is required',
      });
    }

    // Verify course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Course not found or is currently inactive',
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: 'You are already enrolled in this course',
      });
    }

    const enrollment = await Enrollment.create({
      userId,
      courseId,
    });

    const formatted = await formatEnrollment(enrollment);

    res.status(201).json({
      success: true,
      enrollment: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get currently logged in student's enrollments & historical attempts
// @route   GET /api/enrollments/my
// @access  Private
export const getMyEnrollments = async (req, res, next) => {
  try {
    let enrollments;
    if (req.user && req.user.role === 'admin') {
      enrollments = await Enrollment.find({});
    } else {
      enrollments = await Enrollment.find({ userId: req.user._id });
    }
    
    const formatted = await Promise.all(
      enrollments.map(enrollment => formatEnrollment(enrollment))
    );

    res.status(200).json({
      success: true,
      enrollments: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start exam attempt session
// @route   POST /api/enrollments/:id/attempts/start
// @access  Private
export const startAttempt = async (req, res, next) => {
  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    const course = await Course.findById(enrollment.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found for this enrollment',
      });
    }

    // Check attempt limits
    const completedAttemptsCount = enrollment.attempts.filter(a => a.status === 'completed').length;
    if (completedAttemptsCount >= course.attemptLimit) {
      return res.status(400).json({
        success: false,
        error: `Maximum attempts limit (${course.attemptLimit}) has been reached for this course`,
      });
    }

    // Check if there is an active/in-progress attempt
    const activeAttempt = enrollment.attempts.find(a => a.status === 'in-progress');
    if (activeAttempt) {
      return res.status(200).json({
        success: true,
        message: 'Resuming active attempt',
        attempt: formatAttempt(activeAttempt),
      });
    }

    // Fetch total questions inside this course
    const modules = await Module.find({ courseId: course._id });
    const moduleIds = modules.map(m => m._id);
    const totalQuestionsCount = await Question.countDocuments({ moduleId: { $in: moduleIds } });

    // Start a new attempt session
    const newAttempt = {
      attemptId: req.body.attemptId || `attempt_${Date.now()}`,
      startedAt: new Date(),
      status: 'in-progress',
      totalQuestions: totalQuestionsCount,
      answers: {},
      violations: [],
      violationCount: 0,
    };

    enrollment.attempts.push(newAttempt);
    await enrollment.save();

    res.status(201).json({
      success: true,
      attempt: formatAttempt(newAttempt),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save real-time progress of active attempt (answers & violations)
// @route   POST /api/enrollments/:id/attempts/save-answer
// @access  Private
export const saveAttemptProgress = async (req, res, next) => {
  try {
    const { attemptId, questionId, answer, violations, violationCount } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        error: 'attemptId is required to synchronize progress',
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    const attempt = enrollment.attempts.find(a => a.attemptId === attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Attempt not found under this enrollment',
      });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        error: 'This attempt has already been submitted and is locked',
      });
    }

    // Update answer if provided
    if (questionId !== undefined && answer !== undefined) {
      attempt.answers.set(questionId.toString(), answer.toString());
    }

    // Update violations list if provided
    if (violations && Array.isArray(violations)) {
      attempt.violations = violations;
    }

    // Update violationCount
    if (violationCount !== undefined) {
      attempt.violationCount = violationCount;
    }

    // Save changes
    await enrollment.save();

    res.status(200).json({
      success: true,
      attempt: formatAttempt(attempt),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lock attempt and automatically score MCQ submissions
// @route   POST /api/enrollments/:id/attempts/submit
// @access  Private
export const submitAttempt = async (req, res, next) => {
  try {
    const { attemptId, violations, violationCount, autoSubmitted, submissionReason } = req.body;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        error: 'attemptId is required to submit',
      });
    }

    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Enrollment not found',
      });
    }

    const attempt = enrollment.attempts.find(a => a.attemptId === attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        error: 'Attempt not found under this enrollment',
      });
    }

    if (attempt.status !== 'in-progress') {
      return res.status(200).json({
        success: true,
        message: 'This attempt was already submitted',
        attempt: formatAttempt(attempt),
      });
    }

    // Gather all questions for this course to perform scoring
    const modules = await Module.find({ courseId: enrollment.courseId });
    const moduleIds = modules.map(m => m._id);
    const questions = await Question.find({ moduleId: { $in: moduleIds } });

    // Calculate score
    let score = 0;
    let totalMarks = 0;
    let answeredQuestions = 0;

    questions.forEach((q) => {
      totalMarks += q.marks;

      // Extract user's answer (handling both Map type and standard key-value)
      const userAnswer = attempt.answers.get(q._id.toString());
      
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        answeredQuestions++;

        // Automatically grade MCQ questions
        if (q.type === 'mcq' && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
          score += q.marks;
        }
      }
    });

    const percentage = totalMarks > 0 ? parseFloat(((score / totalMarks) * 100).toFixed(2)) : 0;

    // Finalize attempt
    attempt.status = 'completed';
    attempt.submittedAt = new Date();
    attempt.score = score;
    attempt.totalMarks = totalMarks;
    attempt.percentage = percentage;
    attempt.totalQuestions = questions.length;
    attempt.answeredQuestions = answeredQuestions;
    
    if (violations && Array.isArray(violations)) {
      attempt.violations = violations;
    }
    
    if (violationCount !== undefined) {
      attempt.violationCount = violationCount;
    }

    attempt.autoSubmitted = autoSubmitted || false;
    attempt.submissionReason = submissionReason || (autoSubmitted ? 'Maximum violations reached' : 'User submitted');

    // Save changes
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: attempt.autoSubmitted ? 'Exam auto-submitted due to proctoring violations' : 'Exam submitted successfully!',
      attempt: formatAttempt(attempt),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch attempt logs (results review for student/admin)
// @route   GET /api/enrollments/attempts/:attemptId
// @access  Private
export const getAttemptLogs = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    // Find enrollment containing this attempt
    const enrollment = await Enrollment.findOne({
      'attempts.attemptId': attemptId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        error: 'Attempt session not found',
      });
    }

    // Strict access control: students can only view their own attempts
    if (req.user.role !== 'admin' && enrollment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only view your own exam attempts.',
      });
    }

    const attempt = enrollment.attempts.find(a => a.attemptId === attemptId);
    
    res.status(200).json({
      success: true,
      attempt: formatAttempt(attempt),
    });
  } catch (error) {
    next(error);
  }
};
