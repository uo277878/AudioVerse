import { createContext,useContext,useState } from "react";
import { signupRequest, loginRequest } from '../api/auth';
import { useEffect } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context){
        throw new Error("useAuth debería estar dentro de un provider");
    }
    return context;
}

export const AuthProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [errors, setErrors] = useState([]);

    const signup = async (user) => {
        try{
            const res = await signupRequest(user);
            console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch(error){
            console.log(error);
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
        }
        
    }

    const login = async (user) => {
        try{
            const res = await loginRequest(user);
            console.log(res.data);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
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
        <AuthContext.Provider value={{signup, login, user, isAuthenticated, errors}}>
            {children}
        </AuthContext.Provider>
    )
}