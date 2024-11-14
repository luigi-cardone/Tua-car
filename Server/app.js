import express from "express";
import cors from "cors"
import corsOptions from "./config/corsOptions.js";
import register from './routes/register.js'
import login from './routes/login.js'
import geoData from './routes/geoData.js'
import refresh from './routes/refresh.js'
import logout from './routes/logout.js'
import users from './routes/users.js'
import user from './routes/user.js'
import searches from './routes/searches.js'
import search from './routes/search.js'
import scheduledSearch from './routes/scheduledSearch.js'
import deleteSchedule from "./routes/deleteSchedule.js";
import verifyJWT from "./middleware/verify.js";
import cookieParser from 'cookie-parser'
import credentials from "./middleware/credentials.js";
import towns from "./routes/towns.js";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express()
// General middleware
app.use(express.json());
app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser());

// Unprotected routes
app.use('/register', register);
app.use('/login', login);
app.use('/refresh', refresh);
app.use('/logout', logout);

// Protected routes (apply `verifyJWT` only here)
app.use('/geoData', verifyJWT, geoData);
app.use('/users', verifyJWT, users);
app.use('/searches', verifyJWT, searches);
app.use('/user', verifyJWT, user);
app.use('/search', verifyJWT, search);
app.use('/scheduledSearch', verifyJWT, scheduledSearch);
app.use('/deleteSchedule', verifyJWT, deleteSchedule);
app.use('/towns', verifyJWT, towns);

// Serve static files
app.use(express.static(path.join(__dirname, '/public')));

// Fallback route for SPA (does not require verifyJWT)
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'), (err) => {
        if (err) {
            res.status(500).send(err);
        }
    });
});

app.listen(process.env.PORT || 8000, ()=>{
    console.log("Backend started")
})