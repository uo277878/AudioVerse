import User from '../models/user.js';
import bcrypt from 'bcryptjs'

export const getUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
}

export const createUser = async (req, res) => {
    const {username, email, password, role, creationDate} = req.body
    try {
        const passwordEncriptada = await bcrypt.hash(password, 10)

        const user = new User({
            username, 
            email, 
            password: passwordEncriptada, 
            role, 
            creationDate
        });

        const newUser = await user.save();

        res.json({newUser}); 
    } catch(error){
        res.status(500).json({ message: error.message });
    }
}

export const getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(404).json({ message: "Usuario no encontrado"});
    } else{
        res.json(user);
    }
}

export const updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true});
    if(!user){
        return res.status(404).json({ message: "Usuario no encontrado"});
    } else{
        res.json(user);
    }
}

export const deleteUser = async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if(!user){
        return res.status(404).json({ message: "Usuario no encontrado"});
    } else{
        return res.sendStatus(204);
    }
}