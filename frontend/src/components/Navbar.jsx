import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import user from "../../../backend/src/models/user";

function Navbar(){
    const { user, isAuthenticated, logout } = useAuth();
    return (
        <nav className="bg-zinc-700 my-3 flex justify-between py-5 px-10 rounded-lg">
            <Link to="/"><h1 classname="text-2xl font-bold">AudioVerse</h1></Link>
            <ul className="flex gap-x-2">
                {isAuthenticated ? (
                    <>
                    <li>
                        ¡Hola, {user.username}!
                    </li>
                    <li>
                        <Link to="/users/profile">Mi perfil</Link>
                    </li>
                    <li>
                        <Link to="/login" onClick={() => {logout();}} className="bg-red-400 px-4 py-1 rounded-sm">Cerrar sesión</Link>
                    </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login" className="bg-red-400 px-4 py-1 rounded-sm">Login</Link>
                        </li>
                        <li>
                            <Link to="/signup" className="bg-red-400 px-4 py-1 rounded-sm">Registrarse</Link>
                        </li>
                    </>
                )}
                
            </ul>
        </nav>
    )
}

export default Navbar