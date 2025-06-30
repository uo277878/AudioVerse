import Playlist from "../models/playlist.js";
import User from "../models/user.js";
import {validationResult} from "express-validator";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Crea una playlist con una información dada
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns playlist creada
 */
export const createPlaylist = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }

        const size = 2 * 1024 * 1024; 
        if (req.files?.pic?.size > size) {
            return res.status(400).json({ msg: "La imagen debe ser menor de 2MB" });
        }
        let image = req.files?.pic ? req.files.pic.tempFilePath : "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png";
        
        if(image != "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png"){
            const ext = ["image/jpeg", "image/png"];
            if (!ext.includes(req.files?.pic?.mimetype)) {
                return res.status(400).json({ msg: "Formato de imagen no permitido. Solo JPG y PNG" });
            }
        }
        const result = await cloudinary.uploader.upload(image, {
            folder: "playlist_pictures",
        });
        image = result.secure_url;

        const { name, creator, description } = req.body;
        const playlist = new Playlist({
            name,
            description,
            creator,
            pic: image
        });

        const newPlaylist = await playlist.save();
        res.json({ newPlaylist });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

/**
 * Elimina una playlist dada
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns un código de estado
 */
export const removePlaylist = async (req, res) => {
    try{
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        } else{
            return res.sendStatus(204);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

/**
 * Añade una canción a una playlist concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist actualizada
 */
export const addSongToPlaylist = async (req, res) => {
    const {playlistId, songId, txtSong} = req.body;
    if(!playlistId){
        return res.status(402).json({ msg: "No se ha seleccionado ninguna playlist" });
    }
    if(!txtSong){
        return res.status(403).json({ msg: "No se ha proporcionado un texto para la canción" });
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json({ msg: "Playlist no encontrada" });
    } else if(!songId){
        return res.status(405).json({ msg: "Id de canción inválido" });
    } else{
        if (!playlist.songs.some(song => song.songId == songId)) {
            playlist.songs.push({
                songId: songId,
                text: txtSong,
                likedBy: []
            });
            await playlist.save();
        } else{
            return res.status(406).json({ msg: "La playlist ya contiene esa canción" });
        }
        return res.status(200).json({playlist});
    }
}

/**
 * Elimina una canción de una playlist concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist actualizada
 */
export const removeSongPlaylist = async (req, res) => {
    const {songId, playlistId} = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json({ msg: "Playlist no encontrada" });
    } else if(!songId){
        return res.status(404).json({ msg: "Id de canción inválido" });
    } else{
        try{
            const index = playlist.songs.findIndex(i => i.songId === songId);
            if(index == -1){
                return res.status(404).json({ msg: "La playlist no contiene esa canción" });
            }
            playlist.songs.splice(index, 1);
            if(playlist.name == "Canciones que me gustan"){
                const user = await User.findById(playlist.creator);
                user.songsLiked.pull(songId);
                await user.save();
            }
            await playlist.save();
            
            return res.status(200).json({playlist});    
        } catch(error){
            console.error(error);
            return res.status(500).json({ message: "Se ha producido un error al eliminar la canción dela playlist" });
        }
        
    }
}

/**
 * Hace que un usuario siga (y, por tanto, guarde en su biblioteca) una playlist concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist actualizada
 */
export const followPlaylist = async (req, res) => {
    try{
        const {playlistId, userId} = req.body;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }
        if (!playlist.followedBy.includes(userId)) {
            playlist.followedBy.push(userId);
            playlist.numFollows = playlist.followedBy.length;
            await playlist.save();
        } else{
            return res.status(402).json({ msg: "La playlist ya está seguida por este usuario" });
        }
        return res.status(200).json({playlist});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

/**
 * Hace que un usuario deje de seguir (y, por tanto, elimine de su biblioteca) una playlist concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist actualizada
 */
export const unfollowPlaylist = async (req, res) => {
    try{
        const {playlistId, userId} = req.body;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }
        if (playlist.followedBy.includes(userId)) {
            playlist.followedBy.pull(userId);
            playlist.numFollows = playlist.followedBy.length;
            await playlist.save();
        } else{
            return res.status(402).json({ msg: "La playlist no es seguida por este usuario" });
        }
        return res.status(200).json({playlist});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

/**
 * Obtiene todas las playlist de un usuario
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns todas las playlists
 */
export const getAllByUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({ message: "No se ha encontrado ningún usuario con ese id" });
        }
        const playlists = await Playlist.find({$or: [{ creator: user._id }, { followedBy: user._id } ]});
        res.json(playlists);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};

/**
 * Obtiene una playlist concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist concreta
 */
export const getPlaylist = async (req, res) => {
    try{
        const playlist = await Playlist.findById(req.params.id);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        } else{
            res.json(playlist);
        }
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};

/**
 * Busca las playlists que cumplen un criterio de búsqueda concreto
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns las playlists que coinciden con el criterio
 */
export const searchPlaylist = async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }
        const {input} = req.body;
        if (!input) {
            return res.status(400).json({ message: "El texto de búsqueda es necesario" });
        }
        const playlists = await Playlist.find({ name: { $regex: input, $options: 'i' } });
        if(!playlists || playlists.length == 0){
            return res.status(404).json({ message: "No se encuentran playlists para ese input"});
        } else{
            res.json(playlists);
        }
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};

/**
 * Da me gusta al texto asociado a una canción que forma parte de una playlist
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la playlist actualizada
 */
export const likeText = async (req, res) => {
    try{
        const {playlistId, songId, userId} = req.body;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }

        let songFound = false;
        playlist.songs = playlist.songs.map(song => {
            if (song.songId === songId) {
                songFound = true;
                if (!song.likedBy.includes(userId)) {
                    song.likedBy.push(userId); 
                } else {
                    song.likedBy.pull(userId); 
                }
            }
            return song;
        });

        if (!songFound) {
            return res.status(404).json({ message: 'No se encontró la canción en la playlist' });
        }

        await playlist.save();
        return res.status(200).json(playlist);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};

/**
 * Obtiene los me gusta totales y si un usuario concreto le ha dado me gusta a una canción concreta
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns los me gusta totales y si le ha dado me gusta un usuario
 */
export const getTotalLikesAndLiked = async (req, res) => {
    try{
        const {playlistId, songId, userId} = req.query;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }

        const song = playlist.songs.find(song => song.songId.toString() === songId);

        if (!song) {
            return res.status(404).json({ message: 'No se encontró la canción en la playlist' });
        }

        const totalLikes = song.likedBy?.length || 0;
        let liked = false;
        if(totalLikes > 0){
            liked = song.likedBy.includes(userId);
        }
        return res.status(200).json({liked, totalLikes});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};