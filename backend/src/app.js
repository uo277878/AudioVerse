import express from 'express'
import morgan from 'morgan'
import cookieParser from 'cookie-parser';
import routers from './routes/auth.js'

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', routers)

export default app