import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {getUsers, getUser, createUser, deleteUser, updateUser} from '../controllers/userscontroller.js';

const router = new Router();

router.get('/users', tokenRequired, getUsers);
router.get('/users/:id', tokenRequired, getUser);
router.post('/users', tokenRequired, createUser);
router.delete('/users/:id', tokenRequired, deleteUser);
router.put('/users/:id', tokenRequired, updateUser);

export default router;