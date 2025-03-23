import axios from 'axios'
import user from '../../../backend/src/models/user';

const API = 'http://localhost:3000/api'

export const updateProfileRequest = (user, data) => {
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

    return axios.put(`${API}/users/profile/password`, userData, { withCredentials: true });
};

export const updateProfilePicRequest = async (data) => {
    return axios.put(`${API}/users/profile/image`, data, {withCredentials: true, headers: {"Content-Type": "multipart/form-data"}})
}

export const updateUserRequest = async(id, user) => {
    const userData = {
        username: user.username,
        email: user.email,
        role: user.rol
    };

    return axios.put(`${API}/users/${id}`, userData, { withCredentials: true });
};

export const getUserRequest = (id) => {return axios.get(`${API}//users/${id}`, { withCredentials: true })};

export const getUsersAdminRequest = () => {return axios.get(`${API}/users/getAllUsers`, { withCredentials: true })};

export const deleteUserRequest = (id) => axios.delete(`${API}/users/${id}`, { withCredentials: true })