import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import { getToken, getTrack, search } from '../controllers/spotify.js';
import { createPlaylist, getAll } from '../controllers/songscontroller.js';

const router = new Router();

router.get('/search', tokenRequired, getToken);
router.post('/search', tokenRequired, search);
router.get('/getTrack/:id', tokenRequired, getTrack);
router.post('/playlists/new', tokenRequired, createPlaylist);
router.get('/playlists/getAll', tokenRequired, getAll);

export default router;