import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import {createPost, getPosts, likePost} from '../controllers/postscontroller.js';

const router = new Router();

router.post('/home/createPost', tokenRequired, createPost);
router.get('/home/getPosts', tokenRequired, getPosts);
router.put('/home/like/:id', tokenRequired, likePost);

export default router;