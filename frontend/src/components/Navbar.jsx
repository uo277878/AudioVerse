import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react";

function Navbar(){
    const { user, isAuthenticated, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <nav className="bg-zinc-700 mb-3 flex justify-between py-5 px-10 rounded-b-lg">
            <Link to="/"><img src="/logo.png" alt="Logo AudioVerse" className="h-8" /></Link>
            {isAuthenticated && (
                <>
                    <button 
                        className="md:hidden text-white text-2xl focus:outline-none" 
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>

                    </button>
                    <ul className={`absolute md:static top-16 left-0 w-full bg-zinc-700 md:flex md:gap-x-4 p-4 md:p-0 md:w-auto rounded-lg 
                        ${menuOpen ? "flex" : "hidden"} flex-col justify-center items-center w-full first:mt-2 md:flex-row md:w-auto md:space-x-10 md:flex z-50`}>
                    
                    
                        <li>¡Hola, {user?.username}!</li>
                        <li>
                            <Link to="/users/followed" className="block text-white py-2 md:py-0">Mis seguidos</Link>
                        </li>
                        <li>
                            <Link to="/users/search" className="block text-white py-2 md:py-0">Buscar personas</Link>
                        </li>
                        <li>
                            <Link to="/playlists/getAll" className="block text-white py-2 md:py-0">Mi biblioteca</Link>
                        </li>
                        <li>
                            <Link to="/users/profile" className="block text-white py-2 md:py-0">Mi perfil</Link>
                        </li>
                        <li>
                            <Link
                                to="/login"
                                onClick={() => logout()}
                                className="block bg-red-500 px-4 py-2 rounded-md text-white text-center md:inline"
                            >
                                Cerrar sesión
                            </Link>
                        </li>
                    </ul>
                </>
            )}
        </nav>
    )
}

export default Navbar