import axios from 'axios'

const API = 'http://localhost:3000/api'

export const getTokenRequest = () => {
    return axios.get(`${API}/search`, { withCredentials: true });
};

export const searchRequest = (token, input) => {
    return axios.post(`${API}/search`, {token, input}, {withCredentials: true});
}

export const createPlaylistRequest = (user, data) => {
    const playlistData = {
        name: data.name,
        creator: user.id,
        pic: data.pic[0]
    };
    return axios.post(`${API}/playlists/new`, playlistData, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" }});
};

export const getPlaylistRequest = (id) => {
    return axios.get(`${API}/playlists/${id}`, { withCredentials: true });
};

export const getPlaylistsRequest = () => {
    return axios.get(`${API}/playlists/getAll`, { withCredentials: true });
}