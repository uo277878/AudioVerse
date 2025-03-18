import { createContext, useContext, useState, useEffect } from "react";
import { getUserRequest, updateUserRequest, updatePasswordRequest, updateProfilePicRequest } from "../api/users";

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
    const getUser = async (id) => {
        try{
            const res = await getUserRequest(id);
            return res.data;
        } catch(error){
            console.error(error);
        }
    }

    const updateUser = async (user, userData) => {
        try{
            const res = await updateUserRequest(user, userData);
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
            console.log(res.data);
            return res;
        } catch(error){
            console.log(error);
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
        <UserContext.Provider value={{getUser, updateUser, errors, updatePassword, updateProfilePic}}>
            {children}
        </UserContext.Provider>
    ) 
}
