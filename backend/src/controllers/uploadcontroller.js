import { v2 as cloudinary } from "cloudinary";
import User from '../models/user.js'
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube una imagen de perfil a cloudinary
 * @param {*} req petición realizada
 * @param {*} res respuesta devuelta
 * @returns la foto de perfil
 */
export const uploadProfileImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ msg: "No se ha subido ninguna imagen" });
        }
        
        const ext = ["image/jpeg", "image/png"];
        if (!ext.includes(req.files.image.mimetype)) {
            return res.status(401).json({ msg: "Formato de imagen no permitido. Solo JPG y PNG" });
        }

        const size = 2 * 1024 * 1024; 
        if (req.files.image.size > size) {
            return res.status(402).json({ msg: "La imagen debe ser menor de 2MB" });
        }

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

        user.profilePic = result.secure_url;
        await user.save();

        res.status(200).json({ profilePic: user.profilePic });

    } catch (error) {
        res.status(500).json({ msg: "Error al subir la imagen", error });
    }
};
