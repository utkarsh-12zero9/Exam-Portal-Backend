import Course from '../models/Course.js';
import Module from '../models/Module.js';
import Question from '../models/Question.js';

// Helper to format course with total modules and total questions count
const formatCourseWithStats = async (course) => {
  const modules = await Module.find({ courseId: course._id });
  const moduleIds = modules.map(m => m._id);
  const totalQuestions = await Question.countDocuments({ moduleId: { $in: moduleIds } });

  return {
    id: course._id,
    title: course.title,
    description: course.description,
    domain: course.domain,
    difficulty: course.difficulty,
    duration: course.duration,
    price: course.price,
    tags: course.tags,
    attemptLimit: course.attemptLimit,
    isProctoringEnabled: course.isProctoringEnabled,
    isActive: course.isActive,
    totalModules: modules.length,
    totalQuestions,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

// @desc    Get all courses (Active only for students, all for Admin)
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    let query = {};
    
    // If not authenticated or not an admin, only return active courses
    // Wait, let's protect this or let it parse optional authentication if available,
    // but a simpler standard approach: if request headers authorization exists, we can try to verify.
    // If user is admin, show all, otherwise show active only.
    // Let's look if there is an active user attached to req (e.g. from protect middleware).
    // Let's default to: if req.user && req.user.role === 'admin', show all courses. Otherwise, show active: true.
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      query.isActive = true;
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    
    const formattedCourses = await Promise.all(
      courses.map(course => formatCourseWithStats(course))
    );

    res.status(200).json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    const formattedCourse = await formatCourseWithStats(course);

    res.status(200).json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      description,
      domain,
      difficulty,
      duration,
      price,
      tags,
      attemptLimit,
      isProctoringEnabled,
      isActive,
    } = req.body;

    const course = await Course.create({
      title,
      description,
      domain,
      difficulty: difficulty || 'medium',
      duration,
      price: price || 0,
      tags: tags || [],
      attemptLimit: attemptLimit || 3,
      isProctoringEnabled: isProctoringEnabled !== undefined ? isProctoringEnabled : true,
      isActive: isActive !== undefined ? isActive : true,
    });

    const formattedCourse = await formatCourseWithStats(course);

    res.status(201).json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Admin
export const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    const formattedCourse = await formatCourseWithStats(course);

    res.status(200).json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
export const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    // Delete course
    await Course.findByIdAndDelete(req.params.id);

    // Delete all related modules
    const modules = await Module.find({ courseId: req.params.id });
    const moduleIds = modules.map(m => m._id);
    
    await Module.deleteMany({ courseId: req.params.id });

    // Delete all related questions
    await Question.deleteMany({ moduleId: { $in: moduleIds } });

    res.status(200).json({
      success: true,
      message: 'Course and all related modules and questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk delete courses
// @route   DELETE /api/courses/bulk
// @access  Private/Admin
export const deleteCoursesBulk = async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an array of course IDs to delete',
      });
    }

    // Delete courses
    await Course.deleteMany({ _id: { $in: ids } });

    // Find modules of those courses
    const modules = await Module.find({ courseId: { $in: ids } });
    const moduleIds = modules.map(m => m._id);

    // Delete modules
    await Module.deleteMany({ courseId: { $in: ids } });

    // Delete questions
    await Question.deleteMany({ moduleId: { $in: moduleIds } });

    res.status(200).json({
      success: true,
      message: 'Selected courses, modules, and questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle course active status
// @route   PATCH /api/courses/:id/toggle-status
// @access  Private/Admin
export const toggleCourseStatus = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    course.isActive = !course.isActive;
    await course.save();

    const formattedCourse = await formatCourseWithStats(course);

    res.status(200).json({
      success: true,
      course: formattedCourse,
    });
  } catch (error) {
    next(error);
  }
};
