import axios from 'axios'

const API = 'http://localhost:3000/api'

export const getTokenRequest = () => {
    return axios.get(`${API}/search`, { withCredentials: true });
};

export const searchRequest = (token, input, orderBy) => {
    return axios.post(`${API}/search`, {token, input, orderBy}, {withCredentials: true});
}

export const getTrackRequest = (token, id) => {
    return axios.get(`${API}/getTrack/${id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
}

export const getArtistRequest = (token, id) => {
    return axios.get(`${API}/getArtist/${id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
}

export const getPlaylistSpotifyRequest = (token, id) => {
    return axios.get(`${API}/getPlaylist/${id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
}

export const getAlbumRequest = (token, id) => {
    return axios.get(`${API}/getAlbum/${id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
}

export const createPlaylistRequest = (user, data) => {
    const playlistData = new FormData();
    playlistData.append("name", data.name);
    playlistData.append("description", data.description);
    playlistData.append("creator", user.id);

    if (data.pic && data.pic[0]) {
        playlistData.append("pic", data.pic[0]); 
    }
    return axios.post(`${API}/playlists/new`, playlistData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }});
};

export const addSongToPlaylistRequest = (playlistId, songId, txtSong) => {
    return axios.post(`${API}/playlists/add`, {playlistId, songId, txtSong}, { withCredentials: true });
}

export const removeSongPlaylistRequest = (songId, playlistId) => {
    console.log(songId);
    console.log(playlistId);
    return axios.delete(`${API}/playlists/remove`, {data: { songId, playlistId },  withCredentials: true });
}

export const getPlaylistRequest = (id) => {
    return axios.get(`${API}/playlists/${id}`, { withCredentials: true });
};

export const getAllByUserRequest = (id) => {
    return axios.get(`${API}/playlists/getAllByUser/${id}`, { withCredentials: true });
}

export const likeTextRequest = (playlistId, songId, userId) => {
    return axios.put(`${API}/playlists/likeText`, {playlistId, songId, userId}, { withCredentials: true });
}

export const getTotalLikesAndLikedRequest = (playlistId, songId, userId) => {
    return axios.get(`${API}/playlists/getTotalLikesAndLiked`, {params: { playlistId, songId, userId}, withCredentials: true });
}