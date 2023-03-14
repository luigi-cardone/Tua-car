import mysql from "mysql"
import dotenv from 'dotenv'
dotenv.config()
 
// const db = mysql.createConnection({
//     host: "5.249.148.208",
//     port: 3306,
//     user: "tuacarusr",
//     password:"Ck#v00b3",
//     database: "tuacardb"
// })
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME
})

export default db