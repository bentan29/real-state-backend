import express from 'express'
import path from 'path'
import cors from 'cors'
import cookieParser from "cookie-parser"
import dbConnect from './config/dbConnect.js'
import propertysRouter from './routes/public-propertys/property-router.js'
import authRouter from './routes/auth/auth-routes.js'
import favouritesRouter from './routes/favourites/favourites-router.js'
import relatorRouter from './routes/relator/relator-router.js'

const app = express(); //-Creamos servidor express

dbConnect(); //-Conexion con base de datos

app.use(express.json());

app.use(cookieParser()); // 🔥 Necesario para leer cookies

app.use(
    cors({
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'Cache-Control',
            'Expires',
            'Pragma'
        ],
        credentials: true
    })
);

app.use('/api/auth', authRouter)

app.use('/api/propertys', propertysRouter)

app.use('/api/relator', relatorRouter)

app.use('/api/favourites', favouritesRouter)

app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'))
})

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on port ${port}`))