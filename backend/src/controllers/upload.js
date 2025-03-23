import { v2 as cloudinary } from "cloudinary";
import User from '../models/user.js'
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ msg: "No se ha subido ninguna imagen" });
        }
        console.log(req.files);
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: "Usuario no encontrado" });
        }

        if (user.profilePic) {
            const publicId = user.profilePic.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`profile_pictures/${publicId}`);
        }

        const result = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
            folder: "profile_pictures",
        });

        console.log(result.secure_url);

        user.profilePic = result.secure_url;
        await user.save();

        res.json({ profilePic: user.profilePic });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al subir la imagen", error });
    }
};
