import dotenv from "dotenv";
dotenv.config();

import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser';
import authRouters from './routes/auth.js'
import usersRouters from './routes/users.js'
import songsRouters from './routes/songs.js'
import postsRouters from './routes/posts.js'
import cors from 'cors'
import fileUpload from "express-fileupload";

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload({ useTempFiles: true }));

app.use('/api', authRouters)
app.use('/api', usersRouters)
app.use('/api', songsRouters)
app.use('/api', postsRouters)

export default app