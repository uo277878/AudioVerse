import {Router} from 'express'
import {login, signup, logout, myprofile} from '../controllers/authcontroller.js'
import { tokenRequired } from '../middlewares/validateToken.js';

const router = new Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/myprofile', tokenRequired, myprofile);

export default router;