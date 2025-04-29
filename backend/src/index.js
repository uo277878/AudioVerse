import app from './app.js'
import {connectDb} from './db.js'
import crypto from 'crypto';

process.env.TOKEN_SECRET = crypto.randomBytes(64).toString('hex');
console.log(process.env.TOKEN_SECRET);

connectDb();

app.listen(3000)
console.log('Server on port', 3000)