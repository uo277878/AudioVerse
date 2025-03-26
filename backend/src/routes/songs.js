import {Router} from 'express'
import { getToken, search } from '../controllers/spotify.js';

const router = new Router();

router.get('/search', getToken);
router.post('/search', search);

export default router;