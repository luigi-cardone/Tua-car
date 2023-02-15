import mysql from "mysql"

const db = mysql.createConnection({
    host: "5.249.148.208",
    port: 3306,
    user: "tuacarusr",
    password:"Ck#v00b3",
    database: "tuacardb"
})

export default db