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
//NEW IMPORT
import fs from 'fs';
import doSearch from "./controllers/doSearchController.js";

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

//EDITED
app.get("/export", (req, res) => {
  const { filePath, fileName } = req.query;
  const fullPath = path.join(__dirname, filePath);
  
    // Read the file contents
    fs.readFile(fullPath, (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return res.status(500).send("Internal Server Error" + err);
      }
  
      // Set the appropriate headers for CSV response
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  
      // Send the file contents as the response
      res.send(data);
    });
});
//NEW PATH
app.post("/searching", doSearch);

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