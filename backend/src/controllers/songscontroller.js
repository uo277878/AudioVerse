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
        if (!req.files || !req.files.pic) {
            return res.status(400).json({ msg: "No se ha subido ninguna imagen" });
        }

        const { name, creator } = req.body;
        const image = req.files.pic;

        const result = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: "playlist_pictures",
        });

        const playlist = new Playlist({
            name,
            creator,
            pic: result.secure_url,
        });

        const newPlaylist = await playlist.save();
        res.json({ newPlaylist });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}