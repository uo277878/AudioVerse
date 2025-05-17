import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useState } from "react";

function Navbar(){
    const { user, isAuthenticated, logout } = useAuth();
    
    return (
        <nav className="fixed top-0 left-0 h-screen bg-zinc-700 w-64 p-6 flex flex-col gap-6 z-50">
            {isAuthenticated ? (
                <>
                    <Link to="/home"><img src="/logo.png" alt="Logo AudioVerse" className="h-9" /></Link>
                </>
            ) : (
                <>
                    <Link to="/"><img src="/logo.png" alt="Logo AudioVerse" className="h-9" /></Link>
                </>
            )}
            {isAuthenticated && (
                <>
                    <span className="md:text-xl text-red-200">¡Hola, {user?.username}!</span>
                    <Link to="/users/followed" className="text-white md:text-xl py-2 md:py-0">Mis seguidos</Link>
                    <Link to="/search" className="text-white md:text-xl py-2 md:py-0">Buscador Spotify</Link>
                    <Link to="/users/search" className="text-white md:text-xl py-2 md:py-0">Explorar</Link>
                    <Link to={`/playlists/getAllByUser/${user.id}`} className="text-white md:text-xl py-2 md:py-0">Mi biblioteca</Link>
                    <Link to="/users/profile" className="text-white md:text-xl py-2 md:py-0">Mi perfil</Link>
                    <Link to="/login" onClick={() => logout()} 
                    className="mt-auto bg-red-500 px-4 py-2 rounded-md text-white text-center md:text-xl">
                        Cerrar sesión
                    </Link>
                </>
            )}
        </nav>
    )
}

export default Navbar