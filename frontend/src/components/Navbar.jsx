import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import user from "../../../backend/src/models/user";

function Navbar(){
    const { user, isAuthenticated, logout } = useAuth();
    return (
        <nav className="bg-zinc-700 my-3 flex justify-between py-5 px-10 rounded-lg">
            <Link to="/"><img src="/logo.png" alt="Logo AudioVerse" className="h-8" /></Link>
            {isAuthenticated && (
                <ul className="flex gap-x-2">
                    <li>¡Hola, {user?.username}!</li>
                    <li>
                        <Link to="/users/followed">Mis seguidos</Link>
                    </li>
                    <li>
                        <Link to="/playlists/getAll">Mi biblioteca</Link>
                    </li>
                    <li>
                        <Link to="/users/profile">Mi perfil</Link>
                    </li>
                    <li>
                        <Link
                            to="/login"
                            onClick={() => logout()}
                            className="bg-red-400 px-4 py-1 rounded-sm"
                        >
                            Cerrar sesión
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    )
}

export default Navbar