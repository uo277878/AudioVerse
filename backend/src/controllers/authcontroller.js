import User from '../models/user.js'
import bcrypt from 'bcryptjs'
import { createToken} from '../libs/jwt.js';
import {validationResult} from "express-validator";

export const signup = async (req, res) => {
    const {username, email, password} = req.body
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
        const creationDate = new Date();

        const user = new User({
            username, 
            email, 
            password: passwordEncriptada, 
            role, 
            creationDate
        });

        const newUser = await user.save();

        const token = await createToken({ id: newUser._id });

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
        const userFound = await User.findOne({ email });
        if(!userFound){
            return res.status(400).json({ msg: "Usuario no encontrado"});
        }

        const passwordMatch = await bcrypt.compare(password, userFound.password);
        if(!passwordMatch){
            console.log("Llega")
            return res.status(400).json({ msg: "Contraseña incorrecta"});
        }

        const token = await createToken({ id: userFound._id });

        res.cookie('token', token)
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role
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

export const myprofile = async (req, res) => {
    const userFound = await  User.findById(req.user.id);

    if(!userFound){
        return res.status(400).json({ message: "Usuario no encontrado"});
    }
    return res.json({
        id: userFound._id,
        username: userFound.username,
            email: userFound.email,
            role: userFound.role
    });
}