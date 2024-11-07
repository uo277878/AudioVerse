import {Router} from 'express'
import {login, signup, logout, myprofile} from '../controllers/authcontroller.js'
import { tokenRequired } from '../middlewares/validateToken.js';
import { singUpValidatorInsert } from '../middlewares/authValidator.js';
import { loginValidator } from '../middlewares/authValidator.js';

const router = new Router();

router.post('/signup', singUpValidatorInsert, signup);
router.post('/login', loginValidator, login);
console.log("llega")
router.post('/logout', logout);
router.get('/myprofile', tokenRequired, myprofile);

export default router;