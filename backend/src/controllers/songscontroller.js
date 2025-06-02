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

export const createPlaylist = async (req, res) => {
    try {
        let image = req.files?.pic ? req.files.pic.tempFilePath : "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png";
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
        res.status(500).json({ message: error.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    const {playlistId, songId, txtSong} = req.body;
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json({ msg: "Playlist no encontrada" });
    } else if(!songId){
        return res.status(403).json({ msg: "Id de canción inválido" });
    } else{
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push({
                songId: songId,
                text: txtSong,
                likedBy: []
            });
            await playlist.save();
        } else{
            return res.status(402).json({ msg: "La playlist ya contiene esa canción" });
        }
        return res.status(200).json({playlist});
    }
}

export const removeSongPlaylist = async (req, res) => {
    const {songId, playlistId} = req.body;
    console.log("SongID: " + songId);
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        return res.status(404).json({ msg: "Playlist no encontrada" });
    } else if(!songId){
        return res.status(404).json({ msg: "Id de canción inválido" });
    } else{
        try{
            const index = playlist.songs.findIndex(i => i.songId === songId);
            console.log(playlist.songs);
            if(index == -1){
                return res.status(404).json({ msg: "La playlist no contiene esa canción" });
            }
            playlist.songs.splice(index, 1);
            await playlist.save();
            
            return res.status(200).json({playlist});    
        } catch(error){
            console.error(error);
            return res.status(500).json({ message: "Se ha producido un error al eliminar la canción dela playlist" });
        }
        
    }
}

export const followPlaylist = async (req, res) => {
    try{
        const {playlistId, userId} = req.body;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }
        if (!playlist.followedBy.includes(userId)) {
            playlist.followedBy.push(userId);
            await playlist.save();
        } else{
            return res.status(402).json({ msg: "La playlist ya está seguida por este usuario" });
        }
        return res.status(200).json({playlist});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

export const unfollowPlaylist = async (req, res) => {
    try{
        const {playlistId, userId} = req.body;
        const playlist = await Playlist.findById(playlistId);
        if(!playlist){
            return res.status(404).json({ message: "Playlist no encontrada"});
        }
        if (playlist.followedBy.includes(userId)) {
            playlist.followedBy.pull(userId);
            await playlist.save();
        } else{
            return res.status(402).json({ msg: "La playlist no es seguida por este usuario" });
        }
        return res.status(200).json({playlist});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

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

export const searchPlaylist = async (req, res) => {
    try{
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

        const totalLikes = song.likedBy.length;
        let liked = false;
        if(totalLikes > 0){
            liked = song.likedBy.includes(userId);
        }
        return res.status(200).json({liked, totalLikes});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
};