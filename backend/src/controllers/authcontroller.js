import User from '../models/user.js'
import Playlist from '../models/playlist.js'
import bcrypt from 'bcryptjs'
import { createToken} from '../libs/jwt.js';
import {validationResult} from "express-validator";
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    const {username, email, password, dateBirth} = req.body
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }

        const userFound = await User.findOne({email});
        if(userFound){
            return res.status(400).json({msg: "El email ya existe"});
        }

        const passwordEncriptada = await bcrypt.hash(password, 10)

        const role = "user";

        const user = new User({
            username, 
            email, 
            password: passwordEncriptada, 
            role, 
            dateBirth,
            profilePic: "https://res.cloudinary.com/dtlhuysrz/image/upload/v1742580474/default_h6yht5.webp",
            followed: [],
            songsLiked: []
        });

        const newUser = await user.save();

        const token = await createToken({ id: newUser._id });

        let image = "https://res.cloudinary.com/dtlhuysrz/image/upload/v1743524882/default_playlist_qv9jx6.png";
        let name = "Canciones que me gustan";
        const playlist = new Playlist({
            name,
            creator: newUser._id,
            pic: image
        });

        await playlist.save();

        res.cookie('token', token)
        res.json({
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role
        }); 
    } catch(error){
        res.status(500).json({ msg: error.message });
    }
};

export const login = async (req, res) => {
    const {email, password} = req.body

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(422).json(errors.array().map(error => ({ msg: error.msg })));
            return;
        }
        
        // No existe usuario
        const userFound = await User.findOne({ email });
        if(!userFound){
            return res.status(400).json({ msg: "Credenciales incorrectas"});
        }

        // La contraseña está mal
        const passwordMatch = await bcrypt.compare(password, userFound.password);
        if(!passwordMatch){
            return res.status(400).json({ msg: "Credenciales incorrectas"});
        }

        const token = await createToken({ id: userFound._id });
        
        res.cookie('token', token)
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role,
            profilePic: userFound.profilePic,
            followed: userFound.followed,
            songsLiked: userFound.songsLiked
        }); 
    } catch(error){
        res.status(500).json({ message: error.message});
    }
};

export const logout = (req, res) => {
    res.cookie('token', "", {
        expires: new Date(0)
    });
    return res.sendStatus(200);
};

export const verifyToken = async (req, res) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({message: "Unauthorized"});
    }

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
        if(err){
            return res.status(401).json({message: "Unauthorized"});
        }
        const userFound = await User.findById(user.id);
        if(!userFound){
            return res.status(401).json({ msg: "Unauthorized"});
        }
        return res.json({
                id: userFound._id,
                username: userFound.username,
                email: userFound.email,
                role: userFound.role,
                profilePic: userFound.profilePic,
                followed: userFound.followed,
                songsLiked: userFound.songsLiked
            });
    });
};