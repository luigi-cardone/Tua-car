import mysql from "mysql"
import util from 'util'
import fs from 'fs'
import {parse} from 'csv-parse'
import path from "path"
import fetch, {Headers} from 'node-fetch'
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = mysql.createConnection({
    host: "141.95.54.84",
    user: "luigi_tuacar",
    password: "Tuacar.2023",
    database: "tuacarDb"
})

const AddToSpoki = (name, tel, api_key) =>{
    var raw = `{\n    \"phone\": \"${tel}\",\n    \"first_name\": \"${name}\",\n    \"last_name\": \"\",\n    \"email\": \"\",\n    \"language\": \"it\",\n    \"contactfield_set\": []\n}`;
    const userData = JSON.stringify({
        phone: tel,
        first_name: name,
        last_name: "",
        email: "",
        language: "it",
        contactfield_set: []
    })
    var requestOptions = {
    method: 'POST',
    headers: [{"X-Spoki-Api-Key": api_key}, {"Content-Type": "application/json"}],
    body: userData,
    redirect: 'follow'
    };

    fetch("https://app.spoki.it/api/1/contacts/sync/", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .finally(() => 0)
    .catch(error => console.log('error', error));
}

const SendMessage = (name, tel, secret, uuID, vehicle_name) =>{

    var raw = `{\n    \"secret\": \"{{secret}}\",\n    \"phone\": \"+393331234567\",\n    \"first_name\": \"Mario\",\n    \"last_name\": \"Rossi\",\n    \"email\": \"mario.rossi@domain.com\",\n    \"custom_fields\": {\n        \"ORDER_ID\": \"1234\"\n    }\n}`;

    const userData = JSON.stringify({
        secret: secret,
        phone: tel,
        first_name: name,
        last_name: "",
        email: "",
        custom_fields: {
        link_auto: vehicle_name
        }
    })

    var requestOptions = {
    method: 'POST',
    headers: {"Content-Type": "application/json"},
    body: userData,
    redirect: 'follow'
    };

    fetch(`https://app.spoki.it/wh/ap/${uuID}`, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .finally(() => 0)
    .catch(error => console.log('error', error));
}

db.connect()
const query = util.promisify(db.query).bind(db);
const spokiUsers = await query(`SELECT * FROM users_data WHERE IsSpokiEnabled = true`)
const usersId = spokiUsers.map(user => user.user_id)
const spokiTasks = (await query('SELECT * FROM `searches` WHERE `SpokiSchedActive` = true')).filter(search => usersId.includes(search.user_id))
const customersInfo = []
setTimeout(() => process.exit(), 5000)
console.log(`Got ${spokiTasks.length} flagged to run:`)

for(var i = 0; i < spokiTasks.length; i++){
    var user = spokiUsers.find(user => user.user_id === spokiTasks[i].user_id)
    fs.createReadStream(path.join(__dirname , '../' + spokiTasks[i].search_path))
    .pipe(parse({ delimiter: ";", from_line: 1, columns: true, ltrim: true}))
    .on("data", function (row) {
        customersInfo.push({tel : row.Cel === '' ? row.Tel : row.Cel, customer: row.Nominativo || "Gentile Cliente", vehicle: row['Veicolo (Marca Modello Versione)']})
    })
    .on("error", function (error) {
        console.log(error.message);
    })
    .on("end", async function () {
        for(var i = 0; i < customersInfo.length; i++){
            AddToSpoki(customersInfo[i].customer, customersInfo[i].tel, user.spoki_api)
            SendMessage(customersInfo[i].customer, customersInfo[i].tel, user.Secret, user.uuID, customersInfo[i].vehicle)
        }
    });
    //await query(`UPDATE searches SET SpokiSchedActive = false WHERE search_id = ${spokiTasks[i].search_id}`)
}



