import User from '../models/user.js';
import bcrypt from 'bcryptjs'

export const getUsers = async (req, res) => {
    try{
        const users = await User.find();
        res.json(users);
    } catch(error){
        return res.status(500).json({ message: "Se ha producido un error" });
    }
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

export const updateUser = async (req, res) => {
    try{
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