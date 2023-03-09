import express from "express";
import cors from "cors"
import corsOptions from "./config/corsOptions.mjs";
import register from './routes/register.mjs'
import login from './routes/login.mjs'
import geoData from './routes/geoData.mjs'
import refresh from './routes/refresh.mjs'
import logout from './routes/logout.mjs'
import users from './routes/users.mjs'
import user from './routes/user.mjs'
import searches from './routes/searches.mjs'
import search from './routes/search.mjs'
import scheduledSearch from './routes/scheduledSearch.mjs'
import deleteSchedule from "./routes/deleteSchedule.mjs";
import verifyJWT from "./middleware/verify.mjs";
import cookieParser from 'cookie-parser'
import credentials from "./middleware/credentials.mjs";
import towns from "./routes/towns.mjs";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
app.use(express.json())

app.use(credentials)
app.use(cors(corsOptions))
app.use(cookieParser())

app.use(express.static(path.join(__dirname + "/public")))
app.use('/register', register)
app.use('/login', login)
app.use('/refresh', refresh)
app.use('/logout', logout)
app.use('/geoData', geoData)
app.use('/users', users)
app.use('/searches', searches)
app.use('/user', user)
app.use('/search', search)
app.use('/scheduledSearch', scheduledSearch)
app.use('/deleteSchedule', deleteSchedule)
app.use('/towns', towns)
app.post('/webfiles/exports/', (req, res) =>{
    const file_path = req.body.file_path
    res.sendFile("./webfiles/exports/"+file_path, {root: __dirname})
})
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, '/public/index.html'), function(err) {
      if (err) {
        res.status(500).send(err)
      }
    })
  })
app.use(verifyJWT)

app.listen(process.env.PORT || 8000, ()=>{
    console.log("Backend started")
})