import express from 'express';
import {
  enrollInCourse,
  getMyEnrollments,
  startAttempt,
  saveAttemptProgress,
  submitAttempt,
  getAttemptLogs,
} from '../controllers/enrollmentController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(enrollInCourse);

router.get('/my', getMyEnrollments);
router.get('/attempts/:attemptId', getAttemptLogs);

// Attempt lifecycle endpoints
router.post('/:id/attempts/start', startAttempt);
router.post('/:id/attempts/save-answer', saveAttemptProgress);
router.post('/:id/attempts/submit', submitAttempt);

export default router;
