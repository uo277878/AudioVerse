import dotenv from "dotenv";
import {validationResult} from "express-validator";

dotenv.config();

const CLIENT_ID = process.env.SPOTIFY_API_KEY;
const CLIENT_SECRET = process.env.SPOTIFY_API_SECRET;

/**
 * Obtiene un token válido de Spotify dado un client_id y un client_secret
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns token de spotify
 */
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

/**
 * Busca unos elementos de Spotify dado unos criterios de búsqueda
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns elementos que cumplen las condiciones
 */
export const search = async (req, res) => {
    const {token, input, orderBy} = req.body;

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

        if (orderBy === "popularity") {
            if (result.artists?.items) {
                result.artists.items.sort((a, b) => b.popularity - a.popularity);
            }
            if (result.tracks?.items) {
                result.tracks.items.sort((a, b) => b.popularity - a.popularity);
            }
        } else if(orderBy === "releaseDate"){
            if (result.albums?.items) {
                result.albums.items.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
            }
            if (result.tracks?.items) {
                result.tracks.items.sort((a, b) => {
                    const dateA = a.album?.release_date || "1900-01-01";
                    const dateB = b.album?.release_date || "1900-01-01";
                    return new Date(dateB) - new Date(dateA);
                });
            }
        }
        return res.status(200).json(result);
    } catch(error){
        res.status(500).json({ msg: "Error en la búsqueda de artistas" });
    }
    
}

/**
 * Obtiene canciones dados unos criterios de búsqueda
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns las canciones encontradas
 */
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
        return res.status(200).json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención de la canción" });
    }
}

/**
 * Obtiene álbumes dados unos criterios de búsqueda
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns los álbumes encontrados
 */
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
        return res.status(200).json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención del album" });
    }
}

/**
 * Obtiene playlists dados unos criterios de búsqueda
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns las playlists encontradas
 */
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
        return res.status(200).json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención de la playlist" });
    }
}

/**
 * Obtiene artistas dados unos criterios de búsqueda
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns los artistas encontrados
 */
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
        return res.status(200).json(result);
    } catch(error){
        res.status(500).json({ message: "Error en la obtención del artista" });
    }
}