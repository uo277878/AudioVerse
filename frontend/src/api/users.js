import axios from 'axios'

const API = 'http://localhost:3000/api'

export const updateUserRequest = (user, data) => {
    const userData = {
        username: data.username,
        email: data.email
    };
    console.log(userData);

    return axios.put(`${API}/users/profile`, userData, { withCredentials: true });
};

export const updatePasswordRequest = async (data) => {
    const userData = {
        password: data.password,
        newPassword: data.newPassword,
        repeatPassword: data.repeatPassword
    };
    console.log(userData);

    return axios.put(`${API}/users/profile/password`, userData, { withCredentials: true });
};

export const getUserRequest = (id) => axios.get(`/users/${id}`);