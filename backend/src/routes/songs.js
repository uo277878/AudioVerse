import {Router} from 'express'
import { tokenRequired } from '../middlewares/validateToken.js';
import { getToken, getTrack, search, getAlbum, getArtist, getPlaylistSpotify } from '../controllers/spotify.js';
import { createPlaylist, getAllByUser, getPlaylist, addSongToPlaylist, removeSongPlaylist, likeText, 
    getTotalLikesAndLiked, searchPlaylist } from '../controllers/songscontroller.js';
import { searchSongValidator } from '../middlewares/songValidator.js';

const router = new Router();

router.get('/search', tokenRequired, getToken);
router.post('/search', searchSongValidator, tokenRequired, search);
router.post('/searchPlaylist', searchSongValidator, tokenRequired, searchPlaylist);
router.get('/getTrack/:id', tokenRequired, getTrack);
router.get('/getAlbum/:id', tokenRequired, getAlbum);
router.get('/getArtist/:id', tokenRequired, getArtist);
router.get('/getPlaylist/:id', tokenRequired, getPlaylistSpotify);
router.post('/playlists/new', tokenRequired, createPlaylist);
router.post('/playlists/add', tokenRequired, addSongToPlaylist);
router.delete('/playlists/remove', tokenRequired, removeSongPlaylist);
router.get('/playlists/getAllByUser/:id', tokenRequired, getAllByUser);
router.put('/playlists/likeText', tokenRequired, likeText);
router.get('/playlists/getTotalLikesAndLiked', tokenRequired, getTotalLikesAndLiked);
router.get('/playlists/:id', tokenRequired, getPlaylist);

export default router;