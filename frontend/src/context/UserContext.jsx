import { createContext, useContext, useState, useEffect } from "react";
import { getUserRequest, updateProfileRequest, updatePasswordRequest, updateProfilePicRequest, updateUserRequest, getUsersAdminRequest, deleteUserRequest } from "../api/users";

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
    const getUser = async (id) => {
        try{
            const res = await getUserRequest(id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const updateProfile = async (user, userData) => {
        try{
            const res = await updateProfileRequest(user, userData);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
            console.log(errors);
        }
    }

    const updatePassword = async (userData) => {
        try{
            const res = await updatePasswordRequest(userData);
            console.log(res);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
            console.log(errors);
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
            console.log(error);
        }
    }

    const updateUser = async (id, user) => {
        try{
            const res = await updateUserRequest(id, user);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
            console.log(errors);
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

    const deleteUser = async (id) => {
        try{
            const res = await deleteUserRequest(id);
            console.log(res);
            if(res.status == 204){
                setUsers(users.filter(user => user._id != id));
            }
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
        <UserContext.Provider value={{users, getUser, updateProfile, errors, updatePassword, updateProfilePic, updateUser, getUsersAdmin, deleteUser}}>
            {children}
        </UserContext.Provider>
    ) 
}
