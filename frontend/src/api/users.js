import axios from 'axios'
import user from '../../../backend/src/models/user';

const API = 'http://localhost:3000/api'

export const updateProfileRequest = (user, data) => {
    const userData = {
        username: data.username,
        email: data.email
    };

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

    return axios.put(`${API}/users/edit/${id}`, userData, { withCredentials: true });
};

export const getUserRequest = (id) => {return axios.get(`${API}/users/edit/${id}`, { withCredentials: true })};

export const getUsersAdminRequest = () => {return axios.get(`${API}/users/getAllUsers`, { withCredentials: true })};

export const getFollowedUsersRequest = (user) => {
    return axios.get(`${API}/users/followed/${user.id}`, { withCredentials: true });
}

export const deleteUserRequest = (id) => axios.delete(`${API}/users/${id}`, { withCredentials: true });

export const searchUserRequest = async (input) => {
    return await axios.post(`${API}/users/search`, {input}, {withCredentials: true});
}

export const followRequest = async (user, id) => {
    return axios.post(`${API}/users/follow/${id}`, {user}, {withCredentials: true});
}

export const unfollowRequest = async (user, id) => {
    return axios.post(`${API}/users/unfollow/${id}`, {user}, {withCredentials: true});
}

export const likeSongRequest = (user, id) => {
    console.log(user);
    console.log(id);
    return axios.post(`${API}/users/like`, {user, id}, { withCredentials: true })
}

export const dislikeSongRequest = (user, id) => {
    return axios.post(`${API}/users/dislike`, {user, id}, { withCredentials: true })
}