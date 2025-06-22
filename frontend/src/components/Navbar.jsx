import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react";
import { usePosts } from "../context/PostContext";

function Navbar(){
    const { user, isAuthenticated, logout } = useAuth();
    const {resetPosts} = usePosts();
    const [menuOpen, setMenuOpen] = useState(false);
    
    return (
        <nav className="bg-zinc-700 w-full md:w-64 md:h-screen p-4 md:p-6 z-50 md:fixed md:top-0 md:left-0">
            <div className="flex justify-between items-center md:flex-col md:items-start">
                {isAuthenticated ? (
                <>
                    {user.role == "user" ? (
                        <>
                            <div className="flex items-center space-x-2">
                                <Link to="/home"><img src="/logo.png" alt="Logo AudioVerse" className="h-9" /></Link>
                                <span className="md:text-xl text-red-200">¡Hola, {user?.username}!</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center space-x-2">
                                <Link to="/users/getAllUsers"><img src="/logo.png" alt="Logo AudioVerse" className="h-9" /></Link>
                                <span className="md:text-xl text-red-200">¡Hola, {user?.username}!</span>
                            </div>
                        </>
                    )}
                </>
            ) : (
                <>
                    <Link to="/"><img src="/logo.png" alt="Logo AudioVerse" className="h-9" /></Link>
                </>
            )}

                {isAuthenticated && (
                    <button className="md:hidden text-white text-2xl focus:outline-none" onClick={() => setMenuOpen(!menuOpen)} >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                        </svg>
                        <span className="sr-only">Abrir barra de navegación</span>
                    </button>
                )}
            </div>
            
            {isAuthenticated && (
                <ul className={`mt-4 flex-col gap-3 md:flex md:gap-6 ${ menuOpen ? "flex" : "hidden" } md:flex`}>

                    {user.role === "user" && (
                        <>
                        <li>
                            <Link to="/users/followed" className="text-white block md:text-xl hover:underline">
                                Mis seguidos
                            </Link>
                        </li>
                        <li>
                            <Link to="/search" className="text-white block md:text-xl hover:underline">
                                Buscador Spotify
                            </Link>
                        </li>
                        <li>
                            <Link to={`/playlists/getAllByUser/${user.id}`} className="text-white block md:text-xl hover:underline">
                                Mi biblioteca
                            </Link>
                        </li>
                        <li>
                            <Link to="/player" className="text-white block md:text-xl hover:underline">
                                Reproductor
                            </Link>
                        </li>
                        <li>
                            <Link to="/spotifyLogin" className="text-white block md:text-xl hover:underline">
                                Spotify login
                            </Link>
                        </li>
                        </>
                    )}

                    <li>
                        <Link to="/users/search" className="text-white block md:text-xl hover:underline">
                            Explorar AudioVerse
                        </Link>
                    </li>
                    <li>
                        <Link to="/users/profile" className="text-white block md:text-xl hover:underline">
                            Mi perfil
                        </Link>
                    </li>
                    <li>
                        <Link to="/login" onClick={() => { logout(); resetPosts(); }} className="block bg-red-600 px-4 py-2 rounded-md text-white text-center md:text-xl hover:underline">
                            Cerrar sesión
                        </Link>
                    </li>
                </ul>
            )}
        </nav>
    )
}

export default Navbar