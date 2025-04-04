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
    playlistData.append("creator", user._id);

    if (data.pic && data.pic[0]) {
        playlistData.append("pic", data.pic[0]); 
    } else{
        playlistData.append("pic", "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png");
    }
    return axios.post(`${API}/playlists/new`, playlistData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }});
};

export const getPlaylistRequest = (user) => {
    return axios.get(`${API}/playlists/${user._id}`, { withCredentials: true });
};

export const getAllPlaylistsRequest = () => {
    return axios.get(`${API}/playlists/getAll`, { withCredentials: true });
}