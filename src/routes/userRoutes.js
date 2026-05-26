import express from 'express';
import { getUsers, createUser, updateUser, deleteUser, deleteUsersBulk } from '../controllers/userController.js';
import { protect, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();

// All routes are admin-only
router.use(protect);
router.use(authorizeRoles('admin'));

router.route('/')
  .get(getUsers)
  .post(createUser);

router.delete('/bulk', deleteUsersBulk);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
