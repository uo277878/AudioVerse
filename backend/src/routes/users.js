import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {getUsers, getUser, createUser, deleteUser, updateUser, profile} from '../controllers/userscontroller.js';

const router = new Router();

router.get('/users', tokenRequired, getUsers);
router.get('/users/profile', tokenRequired, profile);
router.put('/users/profile', tokenRequired, updateUser);
router.get('/users/:id', tokenRequired, getUser);
router.post('/users', tokenRequired, createUser);
router.delete('/users/:id', tokenRequired, deleteUser);

export default router;