import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser';
import authRouters from './routes/auth.js'
import usersRouters from './routes/users.js'

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRouters)
app.use('/api', usersRouters)

export default app