import Playlist from "../models/playlist.js";
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
        let image = req.body.pic;
        if (!req.files || !req.files.pic) {
            return res.status(400).json({ msg: "No se ha subido ninguna imagen" });
        } else{
            const result = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: "playlist_pictures",
            });
            image = result.secure_url;
        }

        const { name, creator } = req.body;
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

export const getAll = async (req, res) => {
    try{
        const playlists = await Playlist.find();
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