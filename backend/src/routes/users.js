import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {getUsers, getUser, createUser, deleteUser, updateUser, profile, updatePassword, passwordPage} from '../controllers/userscontroller.js';
import {updateUserValidator, updatePasswordValidator} from '../middlewares/authValidator.js';
import { uploadProfileImage } from '../controllers/upload.js';

const router = new Router();

router.get('/users/getAllUsers', tokenRequired, getUsers);
router.get('/users/profile', tokenRequired, profile);
router.put('/users/profile', updateUserValidator, tokenRequired, updateUser);
router.get('/users/profile/password', tokenRequired, passwordPage);
router.put('/users/profile/password', updatePasswordValidator, tokenRequired, updatePassword);
router.put('/users/profile/image', tokenRequired, uploadProfileImage);
router.get('/users/:id', tokenRequired, getUser);
router.post('/users', tokenRequired, createUser);
router.delete('/users/:id', tokenRequired, deleteUser);


export default router;