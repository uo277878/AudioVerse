import { useSpotify } from "../context/SpotifyAuthContext";

function SpotifyLogin(){
    const {redirectToSpotifyAuth} = useSpotify();

    return (
        <div className='flex h-screen items-center justify-center'>
            <div className='bg-zinc-800 max-w-lg w-full p-10 rounded-md'>
                <h1 className='text-2xl font-bold'>Iniciar sesión con Spotify</h1>
                <p className="mt-4 text-xl">¡Atención! Para esta funcionalidad es necesario disponer de una <span className="font-bold">cuenta premium</span> de Spotify</p>
                <div className="mt-4 flex justify-center text-lg">
                    <button className="bg-red-500 text-white p-2 mt-4 rounded-md text-center justify-center" onClick={redirectToSpotifyAuth}>Iniciar sesión</button>
                </div>
            </div>
        </div>
    )
}

export default SpotifyLogin;
