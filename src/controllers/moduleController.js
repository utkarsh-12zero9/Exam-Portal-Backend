import Module from '../models/Module.js';
import Question from '../models/Question.js';
import Course from '../models/Course.js';

// @desc    Get modules of a specific course
// @route   GET /api/courses/:courseId/modules
// @access  Public
export const getModulesByCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    // Verify course exists
    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 });

    const formattedModules = await Promise.all(
      modules.map(async (mod) => {
        const questionCount = await Question.countDocuments({ moduleId: mod._id });
        return {
          id: mod._id,
          courseId: mod.courseId,
          title: mod.title,
          order: mod.order,
          description: mod.description,
          questionCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      modules: formattedModules,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new module under a course
// @route   POST /api/courses/:courseId/modules
// @access  Private/Admin
export const createModule = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, order, description } = req.body;

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        error: 'Course not found',
      });
    }

    const mod = await Module.create({
      courseId,
      title,
      order: order || 1,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      module: {
        id: mod._id,
        courseId: mod.courseId,
        title: mod.title,
        order: mod.order,
        description: mod.description,
        questionCount: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update module details
// @route   PUT /api/modules/:id
// @access  Private/Admin
export const updateModule = async (req, res, next) => {
  try {
    const mod = await Module.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      });
    }

    const questionCount = await Question.countDocuments({ moduleId: mod._id });

    res.status(200).json({
      success: true,
      module: {
        id: mod._id,
        courseId: mod.courseId,
        title: mod.title,
        order: mod.order,
        description: mod.description,
        questionCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete module and its questions
// @route   DELETE /api/modules/:id
// @access  Private/Admin
export const deleteModule = async (req, res, next) => {
  try {
    const mod = await Module.findById(req.params.id);

    if (!mod) {
      return res.status(404).json({
        success: false,
        error: 'Module not found',
      });
    }

    // Delete module
    await Module.findByIdAndDelete(req.params.id);

    // Cascade delete questions in this module
    await Question.deleteMany({ moduleId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Module and all its related questions deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
