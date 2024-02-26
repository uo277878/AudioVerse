import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from '../config.js';

export const tokenRequired = (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({ message: "No existe un token, acceso denegado"});
    }

    jwt.verify(token, TOKEN_SECRET, (err, user) => {
        if(err){
            return res.status(402).json({ message: "Token inválido"});
        }
        req.user = user;

        next();
    })
}