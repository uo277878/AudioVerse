import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import { getToken, search } from '../controllers/spotify.js';
import { createPlaylist } from '../controllers/songscontroller.js';

const router = new Router();

router.get('/search', tokenRequired, getToken);
router.post('/search', tokenRequired, search);
router.post('/playlists/new', tokenRequired, createPlaylist);

export default router;