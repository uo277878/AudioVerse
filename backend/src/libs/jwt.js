import jwt from 'jsonwebtoken';

/**
 * Crea un token dado un elemento
 * @param {*} payload elemento a utilizar para crear el token
 * @returns un token válido durante una hora
 */
export function createToken(payload){
    return new Promise((resolve, reject) => {
        jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn: "1h", }, 
        (err, token) =>{
            if(err){
                reject(err)
            } else{
                resolve(token)
            }
        });
    });
}
