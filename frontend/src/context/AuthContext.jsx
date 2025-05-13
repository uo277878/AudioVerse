import { createContext,useContext,useState, useEffect } from "react";
import { signupRequest, loginRequest, verifyTokenRequest } from '../api/auth';
import Cookies from 'js-cookie';

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
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        try{
            const res = await signupRequest(user);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
        }
        
    }

    const login = async (user) => {
        try{
            const res = await loginRequest(user);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch(error){
            if(Array.isArray(error.response.data)){
                return setErrors(error.response.data);
            }
            setErrors([error.response.data])
        }
        
    }

    const logout = () => {
        Cookies.remove("token");
        setIsAuthenticated(false);
        setUser(null);
    }

    useEffect(() => {
        if(errors.length > 0){
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000)
            return () => clearTimeout(timer);
        }
    }, [errors])

    useEffect(() => {
        async function checkLogin(){
            const token = Cookies.get("token");
            if (!token) {
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await verifyTokenRequest(token);
                if (res.data) {
                    setUser(res.data);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setUser(null);
                    Cookies.remove("token");
                }
            } catch (error) {
                setIsAuthenticated(false);
                setUser(null);
                Cookies.remove("token");
            } finally{
                setLoading(false);
            }
        }
        checkLogin();
    }, [])

    return (
        <AuthContext.Provider value={{signup, login, logout, user, setUser, isAuthenticated, errors, loading}}>
            {children}
        </AuthContext.Provider>
    )
}