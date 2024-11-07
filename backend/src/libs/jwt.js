import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config.js";

export function createToken(payload){
    return new Promise((resolve, reject) => {
        jwt.sign(payload, TOKEN_SECRET, { expiresIn: "1h", }, 
        (err, token) =>{
            if(err){
                reject(err)
            } else{
                resolve(token)
            }
        });
    });
}
