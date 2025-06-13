import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {getUsers, getUser, createUser, deleteUser, updateProfile, profile, updatePassword, updateUser, 
    passwordPage, getFollowedUsers, searchUser, followUser, unfollowUser, likeSong, dislikeSong, getLikedSongs} from '../controllers/userscontroller.js';
import {updateProfileValidator, updatePasswordValidator} from '../middlewares/authValidator.js';
import { uploadProfileImage } from '../controllers/uploadcontroller.js';
import { searchUserValidator } from '../middlewares/usersValidator.js';

const router = new Router();

router.get('/users/getAllUsers', tokenRequired, getUsers);
router.get('/users/profile', tokenRequired, profile);
router.put('/users/profile', updateProfileValidator, tokenRequired, updateProfile);
router.get('/users/profile/password', tokenRequired, passwordPage);
router.put('/users/profile/password', updatePasswordValidator, tokenRequired, updatePassword);
router.put('/users/profile/image', tokenRequired, uploadProfileImage);
router.post('/users', tokenRequired, createUser);
router.post('/users/search', searchUserValidator, tokenRequired, searchUser);
router.get('/users/followed/:id', tokenRequired, getFollowedUsers);
router.get('/users/edit/:id', tokenRequired, getUser);
router.put('/users/edit/:id', tokenRequired, updateUser);
router.post('/users/follow/:id', tokenRequired, followUser);
router.post('/users/unfollow/:id', tokenRequired, unfollowUser);
router.post('/users/like', tokenRequired, likeSong);
router.post('/users/dislike', tokenRequired, dislikeSong);
router.get('/users/getLikedSongs/:id', tokenRequired, getLikedSongs);
router.get('/users/:id', tokenRequired, getUser);
router.delete('/users/:id', tokenRequired, deleteUser);

export default router;