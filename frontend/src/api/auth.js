import axios from 'axios'

const API = 'http://localhost:3000/api'

export const signupRequest = user => {
    const userData = {
        username: user.username,
        email: user.email,
        password: user.password
    };

    return axios.post(`${API}/signup`, userData, { withCredentials: true });
};

export const loginRequest = user => {
    const userData = {
        email: user.email,
        password: user.password
    };

    return axios.post(`${API}/login`, userData, { withCredentials: true });
};