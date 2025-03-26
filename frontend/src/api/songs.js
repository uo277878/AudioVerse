import axios from 'axios'

const API = 'http://localhost:3000/api'

export const getTokenRequest = () => {
    return axios.get(`${API}/search`, { withCredentials: true });
};

export const searchRequest = (token, input) => {
    return axios.post(`${API}/search`, {token, input}, {withCredentials: true});
}