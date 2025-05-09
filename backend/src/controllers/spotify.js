import dotenv from "dotenv";
import {validationResult} from "express-validator";

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

    if (!token) {
        res.status(401).json({ msg: "Token inválido" });
        return;
    } 

    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }
        var searchParams = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        }
        const url = "https://api.spotify.com/v1/search?q=" + input + "&type=artist%2Calbum%2Cplaylist%2Ctrack&limit=50";
        const result = await fetch(url, searchParams).then(response => response.json());
        return res.json(result);
    } catch(error){
        res.status(500).json({ msg: "Error en la búsqueda de artistas" });
    }
    
}

export const getTrack = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const id = req.params.id;

    if (!token || !id) {
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
        const url = "https://api.spotify.com/v1/tracks/" + id;
        const result = await fetch(url, searchParams).then(response => response.json());
        return res.json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención de la canción" });
    }
}

export const getAlbum = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const id = req.params.id;

    if (!token || !id) {
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
        const url = "https://api.spotify.com/v1/albums/" + id;
        const result = await fetch(url, searchParams).then(response => response.json());
        return res.json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención del album" });
    }
}

export const getPlaylistSpotify = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const id = req.params.id;

    if (!token || !id) {
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
        const url = "https://api.spotify.com/v1/playlists/" + id;
        const result = await fetch(url, searchParams).then(response => response.json());
        return res.json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención de la playlist" });
    }
}

export const getArtist = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const id = req.params.id;

    if (!token || !id) {
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
        const url = "https://api.spotify.com/v1/artists/" + id;
        const result = await fetch(url, searchParams).then(response => response.json());
        return res.json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención del artista" });
    }
}