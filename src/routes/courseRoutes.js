import express from 'express';
import {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  deleteCoursesBulk,
  toggleCourseStatus,
} from '../controllers/courseController.js';
import { getModulesByCourse, createModule } from '../controllers/moduleController.js';
import { protect, authorizeRoles, optionalProtect } from '../middlewares/auth.js';

const router = express.Router();

// Course module nested routes
router.route('/:courseId/modules')
  .get(getModulesByCourse)
  .post(protect, authorizeRoles('admin'), createModule);

// Course general routes
router.route('/')
  .get(optionalProtect, getCourses)
  .post(protect, authorizeRoles('admin'), createCourse);

router.delete('/bulk', protect, authorizeRoles('admin'), deleteCoursesBulk);

router.route('/:id')
  .get(getCourse)
  .put(protect, authorizeRoles('admin'), updateCourse)
  .delete(protect, authorizeRoles('admin'), deleteCourse);

router.patch('/:id/toggle-status', protect, authorizeRoles('admin'), toggleCourseStatus);

export default router;
