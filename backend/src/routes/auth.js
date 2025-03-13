import {Router} from 'express'
import {login, signup, logout, verifyToken} from '../controllers/authcontroller.js'
import { singUpValidatorInsert } from '../middlewares/authValidator.js';
import { loginValidator } from '../middlewares/authValidator.js';

const router = new Router();

router.post('/signup', singUpValidatorInsert, signup);
router.post('/login', loginValidator, login);
router.post('/logout', logout);
router.get('/verify', verifyToken);

export default router;