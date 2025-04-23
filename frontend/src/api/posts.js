import axios from 'axios'

const API = 'http://localhost:3000/api'

export const createPostRequest = (userId, text) => {
    return axios.post(`${API}/home/createPost`, {userId, text}, { withCredentials: true });
};

export const getPostsRequest = (user) => {
    return axios.get(`${API}/home/getPosts?userId=${user.id}`, { withCredentials: true });
};