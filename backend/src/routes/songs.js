import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import { getToken, getTrack, search } from '../controllers/spotify.js';
import { createPlaylist, getAllByUser, getPlaylist, addSongToPlaylist } from '../controllers/songscontroller.js';

const router = new Router();

router.get('/search', tokenRequired, getToken);
router.post('/search', tokenRequired, search);
router.get('/getTrack/:id', tokenRequired, getTrack);
router.post('/playlists/new', tokenRequired, createPlaylist);
router.post('/playlists/add', tokenRequired, addSongToPlaylist);
router.get('/playlists/getAllByUser/:id', tokenRequired, getAllByUser);
router.get('/playlists/:id', tokenRequired, getPlaylist);

export default router;