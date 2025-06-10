import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {createPost, getPosts, likePost, deletePost} from '../controllers/postscontroller.js';
import { createPostValidator } from '../middlewares/postValidator.js';

const router = new Router();

router.post('/home/createPost', createPostValidator, tokenRequired, createPost);
router.get('/home/getPosts', tokenRequired, getPosts);
router.put('/home/like/:id', tokenRequired, likePost);
router.delete('/home/delete/:id', tokenRequired, deletePost);

export default router;