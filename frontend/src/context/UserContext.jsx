import { createContext, useContext, useState, useEffect } from "react";
import { getUserRequest, updateProfileRequest, updatePasswordRequest, 
    updateProfilePicRequest, updateUserRequest, getUsersAdminRequest, 
    deleteUserRequest, getFollowedUsersRequest, 
    searchUserRequest, followRequest, unfollowRequest, likeSongRequest, dislikeSongRequest, getLikedSongsRequest} from "../api/users";
import { useAuth } from "./AuthContext";

const UserContext = createContext();

export const useUsers = () => {
    const context = useContext(UserContext)
    if(!context){
        throw new Error("useUsers debería estar dentro de un provider");
    }
    return context;
}
export const UserProvider = ({children}) => {
    const [errors, setErrors] = useState([]);
    const [users, setUsers] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const {setUser} = useAuth();
    
    const getUser = async (id) => {
        try{
            const res = await getUserRequest(id);
            setLikedSongs(res.data.songsLiked);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }
    
    const getLikedSongs = async (id) => {
        try{
            const res = await getLikedSongsRequest(id);
            console.log(res.data);
            setLikedSongs(res.data.songsLiked);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const updateProfile = async (user, userData) => {
        try{
            const res = await updateProfileRequest(user, userData);
            setUser(res.data);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const updatePassword = async (userData) => {
        try{
            const res = await updatePasswordRequest(userData);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
        }
    }

    const updateProfilePic = async (file) => {
        try{
            setErrors([]); 

            const formData = new FormData();
            formData.append("image", file);

            const res = await updateProfilePicRequest(formData);
            return res;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const updateUser = async (id, user) => {
        try{
            const res = await updateUserRequest(id, user);
            return res.data;
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const getUsersAdmin = async () => {
        try{
            const res = await getUsersAdminRequest();
            setUsers(res.data);
        } catch(error){
            console.error(error);
        }
        
    }

    const getFollowedUsers = async (user) => {
        try{
            const res = await getFollowedUsersRequest(user);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const deleteUser = async (id) => {
        try{
            const res = await deleteUserRequest(id);
            if(res.status == 204){
                setUsers(users.filter(user => user._id != id));
            }
        } catch(error){
            console.error(error);
        }
    }

    const searchUsers = async (input, orderBy, userAuth) => {
        try{
            console.log(input);
            console.log(orderBy);
            console.log(userAuth);
            const res = await searchUserRequest(input, orderBy, userAuth);
            console.log(res);
            return res.data;
        } catch(error){
            console.log(error);
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data]);
        }
    }

    const follow = async (user, id) => {
        try{
            const res = await followRequest(user, id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const unfollow = async (user, id) => {
        try{
            const res = await unfollowRequest(user, id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const likeSong = async (user, id) => {
        try{
            const res = await likeSongRequest(user, id);
            setLikedSongs(res.data.user.songsLiked);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const dislikeSong = async (user, id) => {
        try{
            const res = await dislikeSongRequest(user, id);
            setLikedSongs(res.data.user.songsLiked);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    useEffect(() => {
            if(errors.length > 0){
                const timer = setTimeout(() => {
                    setErrors([]);
                }, 5000)
                return () => clearTimeout(timer);
            }
        }, [errors])

    return (
        <UserContext.Provider value={{users, getUser, updateProfile, errors, updatePassword, updateProfilePic, 
        updateUser, getUsersAdmin, deleteUser, getFollowedUsers, searchUsers, follow, unfollow, likeSong, dislikeSong, 
        likedSongs, getLikedSongs}}>
            {children}
        </UserContext.Provider>
    ) 
}
