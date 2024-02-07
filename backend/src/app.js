import express from 'express'
import morgan from 'morgan'

import routers from './routes/index.js'

const app = express()

app.use(morgan('dev'))
app.use(express.json());

app.use('/api', routers)

export default app