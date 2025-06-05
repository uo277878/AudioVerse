import { createContext,useContext,useState, useEffect } from "react";
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = "http://localhost:5173/player"; 
const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
].join(" ");

export const SpotifyAuthContext = createContext();

export const useSpotify = () => {
    const context = useContext(SpotifyAuthContext)
    if(!context){
        throw new Error("useAuth debería estar dentro de un provider");
    }
    return context;
}

export const SpotifyProvider = ({children}) => {
    const [accessToken, setAccessToken] = useState(null);

    const generateRandomString = (length) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));
        return values.reduce((acc, x) => acc + possible[x % possible.length], "");
    }

    const sha256 = async (plain) => {
        const encoder = new TextEncoder()
        const data = encoder.encode(plain)
        return window.crypto.subtle.digest('SHA-256', data)
    }

    const base64encode = (input) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
    }

    const redirectToSpotifyAuth = async () => {
        const verifier = generateRandomString(64);
        const hashed = await sha256(verifier);
        const codeChallenge = base64encode(hashed);

        localStorage.setItem("code_verifier", verifier);

        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: "code",
            redirect_uri: REDIRECT_URI,
            code_challenge_method: "S256",
            code_challenge: codeChallenge,
            scope: SCOPES,
        });
        window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    const getAccessToken = async (code) => {
        const codeVerifier = localStorage.getItem("code_verifier");

        const url = "https://accounts.spotify.com/api/token";
        const payload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier,
            }),
        }

        const body = await fetch(url, payload);
        const response = await body.json();
        console.log(response);

        if (response.access_token) {
            localStorage.setItem("spotify_access_token", response.access_token);
            setAccessToken(response.access_token);
            return response.access_token;
        } else {
            console.error("Error obteniendo el token:", response);
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("spotify_access_token");
        if (token) {
            setAccessToken(token);
            /*
            fetch("https://api.spotify.com/v1/me", {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => {
            if (res.ok) {
                setAccessToken(token);
            } else {
                localStorage.removeItem("spotify_access_token");
                redirectToSpotifyAuth();
            }
            })
            .catch(err => {
            console.error("Error validando token:", err);
            redirectToSpotifyAuth();
            });*/
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get("code");
            console.log("Código recibido desde Spotify:", code);
            if (code) {
                getAccessToken(code);
                window.history.replaceState({}, null, window.location.pathname); 
            } else{
                redirectToSpotifyAuth();
            }
        }
    }, []);

    return (
        <SpotifyAuthContext.Provider value={{accessToken, redirectToSpotifyAuth}}>
            {children}
        </SpotifyAuthContext.Provider>
    )
}