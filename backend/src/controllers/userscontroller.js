import User from '../models/user.js';
import Playlist from '../models/playlist.js';
import bcrypt from 'bcryptjs'
import {validationResult} from "express-validator";

export const getUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
}

export const createUser = async (req, res) => {
    const {username, email, password, role, dateBirth} = req.body
    try {
        const passwordEncriptada = await bcrypt.hash(password, 10)

        const user = new User({
            username, 
            email, 
            password: passwordEncriptada, 
            role, 
            dateBirth
        });

        const newUser = await user.save();

        res.json({newUser}); 
    } catch(error){
        return res.status(500).json({ message: error.message });
    }
}

export const getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            res.json(user);
        }
    } catch(error){
        return res.status(404).json({ message: "Usuario no encontrado"});
    }
}

export const updateProfile = async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
        }
        const usernameExists = await User.findOne({username: req.body.username, _id: { $ne: req.user.id } });

        if (usernameExists) {
            return res.status(401).json({ msg: "Nombre de usuario no disponible" });
        }

        const emailExists = await User.findOne({email: req.body.email, _id: { $ne: req.user.id }});

        if (emailExists) {
            return res.status(402).json({ msg: "Email no disponible" });
        }
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true});
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        }
    } catch(error){
        return res.status(500).json({ message: "Usuario no encontrado"});
    }
}

export const updateUser = async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
        }
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true});
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            res.json({
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            });
        }
    } catch(error){
        return res.status(500).json({ message: "Usuario no encontrado"});
    }
}

export const updatePassword = async (req, res) => {
    try{
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
        }
        const user = await User.findById(req.user.id,);
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "La contraseña actual es incorrecta" });
        }
        const passwordEncriptada = await bcrypt.hash(req.body.newPassword, 10);
        user.password = passwordEncriptada;
        await user.save();

        return res.json(user);
    } catch(error){
        return res.status(500).json({ message: "Usuario no encontrado"});
    }
}

export const getFollowedUsers = async(req, res) => {
    try{
        const user = await User.findById(req.params.id).populate("followed");
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            res.json({followed: user.followed});
        }
    } catch(error){
        return res.status(500).json({ message: "Usuario no encontrado"});
    }
}

export const deleteUser = async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            return res.sendStatus(204);
        }
    } catch(error){
        return res.status(404).json({ message: "Usuario no encontrado"});
    }
}

export const profile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el perfil" });
    }
};

export const passwordPage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        return res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            password: user.password,
            role: user.role
        });

    } catch (error) {
        return res.status(500).json({ message: "Error al obtener el perfil" });
    }
};

export const searchUser = async (req, res) => {
    try{
        const input = req.body.input;
        const orderBy = req.body.orderBy;
        const authId = req.body.userAuth.id;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
        }

        const authUser = await User.findById(authId);
        let users = await User.find({ username: { $regex: new RegExp(input, 'i') }, _id: { $ne: authId } });

        if (orderBy == "matches") {
            const likedIds = new Set(authUser.songsLiked.map(id => id.toString()));
            users = users
                .map(user => {
                    const userObj = user.toJSON();
                    const matchCount = Array.isArray(userObj.songsLiked)
                    ? userObj.songsLiked.filter(songId => likedIds.has(songId.toString())).length
                    : 0;
                    console.log(matchCount);
                    return { ...userObj, matchCount };
                })
                .sort((a, b) => b.matchCount - a.matchCount); 
        }
        console.log(users);
        return res.json({users});
    } catch(error){
        console.error(error);
        return res.status(500).json({ message: "Error al buscar el usuario" });
    }
}

export const followUser = async (req, res) => {
    try{
        const userToFollow = await User.findById(req.params.id);
        if (!userToFollow) {
            return res.status(404).json({ message: "Usuario a seguir no encontrado" });
        } else{
            const authUser = await User.findById(req.body.user.id);
            if (!authUser.followed.includes(userToFollow._id)) {
                authUser.followed.push(userToFollow._id);
                await authUser.save();
            }
            return res.status(200).json({authUser});
        }
    } catch(error){
        return res.status(500).json({message: "No se ha podido seguir a este usuario"});
    }
}

export const unfollowUser = async (req, res) => {
    try{
        const userToUnfollow = await User.findById(req.params.id);
        if (!userToUnfollow) {
            return res.status(404).json({ message: "Usuario a dejar de seguir no encontrado" });
        } else{
            const authUser = await User.findById(req.body.user.id);
            if (authUser.followed.includes(userToUnfollow._id)) {
                authUser.followed.pull(userToUnfollow._id);
                await authUser.save();
            }
            return res.status(200).json({authUser});
        }
    } catch(error){
        return res.status(500).json({message: "No se ha podido dejar de seguir a este usuario"});
    }
}

export const likeSong = async (req, res) => {
    try{
        const user = await User.findById(req.body.user.id);
        const idSong = req.body.id;
        if (!user.songsLiked.includes(idSong)) {
            user.songsLiked.push(idSong);
            await user.save();
        }
        const mgPlaylist = await Playlist.findOne({creator: user._id, name: "Canciones que me gustan"});
        if (!mgPlaylist.songs.includes(idSong)) {
            mgPlaylist.songs.push({
                songId: idSong,
                text: "",
                likedBy: []
            });
            await mgPlaylist.save();
        }
        return res.status(200).json({user});
    } catch(error){
        console.error(error);
        return res.status(500).json({ message: "Se ha producido un error al darle me gusta a la canción" });
    }
}

export const dislikeSong = async (req, res) => {
    try{
        const user = await User.findById(req.body.user.id);
        const idSong = req.body.id;
        if (user.songsLiked.includes(idSong)) {
            user.songsLiked.pull(idSong);
            await user.save();
        }
        const mgPlaylist = await Playlist.findOne({creator: user._id, name: "Canciones que me gustan"});
        if (mgPlaylist) {
            const index = mgPlaylist.songs.findIndex(s => s.songId === idSong);
            if (index !== -1) {
                mgPlaylist.songs.splice(index, 1);
                await mgPlaylist.save();
            }
        }
        return res.status(200).json({user});
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error al eliminar el me gusta de la canción" });
    }
}

export const getLikedSongs = async(req, res) => {
    console.log(req);
    try{
        const user = await User.findById(req.params.id).populate("songsLiked");
        console.log(user);
        if(!user){
            return res.status(404).json({ message: "Usuario no encontrado"});
        } else{
            res.json({songsLiked: user.songsLiked});
        }
    } catch(error){
        console.error(error);
        return res.status(500).json({ message: "Usuario no encontrado"});
    }
}