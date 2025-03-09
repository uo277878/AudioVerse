import { createContext, useContext } from "react";
import { getUserRequest, updateUserRequest } from "../api/users";

const UserContext = createContext();

export const useUsers = () => {
    const context = useContext(UserContext)
    if(!context){
        throw new Error("useUsers debería estar dentro de un provider");
    }
    return context;
}

const getUser = async (id) => {
    try{
        const res = await getUserRequest(id);
        return res.data;
    } catch(error){
        console.error(error);
    }
}

const updateUser = async (user, userData) => {
    console.log(user);
    try{
        const res = await updateUserRequest(user, userData);
        console.log(res);
    } catch(error){
        console.error(error);
    }
}

export const UserProvider = ({children}) => {
    return (
        <UserContext.Provider value={{getUser, updateUser}}>
            {children}
        </UserContext.Provider>
    ) 
}
