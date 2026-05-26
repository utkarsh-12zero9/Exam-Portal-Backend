import express from 'express';
import { updateModule, deleteModule } from '../controllers/moduleController.js';
import { getQuestionsByModule, createQuestion } from '../controllers/questionController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// Module questions nested routes
router.route('/:moduleId/questions')
  .get(getQuestionsByModule)
  .post(protect, authorizeRoles('admin'), createQuestion);

// Module general routes
router.route('/:id')
  .put(protect, authorizeRoles('admin'), updateModule)
  .delete(protect, authorizeRoles('admin'), deleteModule);

export default router;
