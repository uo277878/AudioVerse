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

        const { name, creator } = req.body;
        console.log(creator);
        const playlist = new Playlist({
            name,
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
    const {playlistId, songId} = req.body;
    const playlist = await Playlist.findById(playlistId);
    console.log(playlist);
    if (!playlist) {
        return res.status(404).json({ message: "Playlist no encontrada" });
    } else if(!songId){
        return res.status(403).json({ message: "Id de canción inválido" });
    } else{
        if (!playlist.songs.includes(songId)) {
            playlist.songs.push(songId);
            await playlist.save();
        } else{
            return res.status(402).json({ message: "La playlist ya contiene esa canción" });
        }
        return res.status(200).json({playlist});
    }
}

export const getAllByUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        console.log(user);
        if(!user){
            return res.status(404).json({ message: "No se ha encontrado ningún usuario con ese id" });
        }
        const playlists = await Playlist.find({creator: { $in: [user._id] }});
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