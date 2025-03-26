import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_API_KEY;
const CLIENT_SECRET = process.env.SPOTIFY_API_SECRET;

export const getToken = async (req, res) => {
    const authParams = new URLSearchParams();
    authParams.append("grant_type", "client_credentials");
    authParams.append("client_id", CLIENT_ID);
    authParams.append("client_secret", CLIENT_SECRET);

    try {
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: authParams
        });

        const data = await response.json();
        res.json(data.access_token); 
    } catch (error) {
        res.status(500).json({ error: "Error al obtener el token" });
    }
    
};

export const search = async (req, res) => {
    const {token, input} = req.body;

    if (!token || !input) {
        return res.status(400).json({ message: "Faltan parámetros" });
    }

    try{
        var searchParams = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }
        var artistID = await fetch("https://api.spotify.com/v1/search?q=" + input + "&type=artist", searchParams)
        .then(response => response.json())
        .then(data => {return data.artists.items[0].id});

        var albums = await fetch("https://api.spotify.com/v1/artists/" + artistID + "/albums?limit=50", searchParams)
        .then(response => response.json());
        console.log(albums);
        return res.json(albums);
    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Error en la búsqueda de artistas" });
    }
    
}