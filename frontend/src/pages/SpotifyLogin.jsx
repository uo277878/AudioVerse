import { useSpotify } from "../context/SpotifyAuthContext";

function SpotifyLogin(){
    const {redirectToSpotifyAuth} = useSpotify();

    return (
        <button onClick={redirectToSpotifyAuth}>Iniciar sesión con Spotify</button>
    );
}

export default SpotifyLogin;
