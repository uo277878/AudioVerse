import jwt from 'jsonwebtoken';

/**
 * Comprueba que existe un token para permitir que la solicitud continúe
 */
export const tokenRequired = (req, res, next) => {
    const {token} = req.cookies;

    if(!token){
        return res.status(401).json({ message: "No existe un token, acceso denegado"});
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if(err){
            return res.status(402).json({ message: "Token inválido"});
        }
        req.user = user;

        next();
    })
}