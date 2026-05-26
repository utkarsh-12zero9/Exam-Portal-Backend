import express from 'express';
import { updateQuestion, deleteQuestion, deleteQuestionsBulk } from '../controllers/questionController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('admin'));

router.delete('/bulk', deleteQuestionsBulk);

router.route('/:id')
  .put(updateQuestion)
  .delete(deleteQuestion);

export default router;
