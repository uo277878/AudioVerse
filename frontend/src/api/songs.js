import axios from 'axios'

const API = 'http://localhost:3000/api'

export const getTokenRequest = () => {
    return axios.get(`${API}/search`, { withCredentials: true });
};

export const searchRequest = (token, input) => {
    return axios.post(`${API}/search`, {token, input}, {withCredentials: true});
}

export const getTrackRequest = (token, id) => {
    return axios.get(`${API}/getTrack/${id}`, {headers: { Authorization: `Bearer ${token}` }, withCredentials: true});
}

export const createPlaylistRequest = (user, data) => {
    const playlistData = new FormData();
    playlistData.append("name", data.name);
    playlistData.append("creator", user.id);

    if (data.pic && data.pic[0]) {
        playlistData.append("pic", data.pic[0]); 
    }
    return axios.post(`${API}/playlists/new`, playlistData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }});
};

export const addSongToPlaylistRequest = (playlistId, songId) => {
    console.log(playlistId);
    console.log(songId);
    return axios.post(`${API}/playlists/add`, {playlistId, songId}, { withCredentials: true });
}

export const getPlaylistRequest = (id) => {
    return axios.get(`${API}/playlists/${id}`, { withCredentials: true });
};

export const getAllByUserRequest = (id) => {
    return axios.get(`${API}/playlists/getAllByUser/${id}`, { withCredentials: true });
}