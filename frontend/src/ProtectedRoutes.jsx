import { useAuth } from "./context/AuthContext"
import { Navigate, Outlet } from "react-router-dom"

function ProtectedRoutes(){
    const {loading, user, isAuthenticated} = useAuth();
    if(loading){
        return <h1>Cargando...</h1>
    }
    if(!loading && !isAuthenticated){
        return <Navigate to='/login' replace />
    }
    return <Outlet />;
}

export default ProtectedRoutes