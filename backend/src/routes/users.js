import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {getUsers, getUser, createUser, deleteUser, updateProfile, profile, updatePassword, updateUser, passwordPage, getFollowedUsers} from '../controllers/userscontroller.js';
import {updateProfileValidator, updatePasswordValidator} from '../middlewares/authValidator.js';
import { uploadProfileImage } from '../controllers/upload.js';

const router = new Router();

router.get('/users/getAllUsers', tokenRequired, getUsers);
router.get('/users/profile', tokenRequired, profile);
router.put('/users/profile', updateProfileValidator, tokenRequired, updateProfile);
router.get('/users/profile/password', tokenRequired, passwordPage);
router.put('/users/profile/password', updatePasswordValidator, tokenRequired, updatePassword);
router.put('/users/profile/image', tokenRequired, uploadProfileImage);
router.post('/users', tokenRequired, createUser);
router.get('/users/followed/:id', tokenRequired, getFollowedUsers);
router.delete('/users/:id', tokenRequired, deleteUser);
router.get('/users/edit/:id', tokenRequired, getUser);
router.put('/users/edit/:id', tokenRequired, updateUser);


export default router;