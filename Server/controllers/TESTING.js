import Mailer from './classes/mailer.js'

const search_params = {
    "user_id": 11,
    "setSpokiActive": 1,
    "schedule_active": 1,
    "schedule_start": "",
    "schedule_repeat_h": "",
    "schedule_cc": "",
    schedule_content: {
        "platform-01": {
            "platform": "platform-01",
            "yearFrom": "",
            "yearTo": "",
            "mileageFrom": "",
            "mileageTo": "",
            "geoRegion": "",
            "geoProvince": "",
            "geoTowns": [
                "Abano Terme",
                "Bagnoli di Sopra",
                "Borgoricco",
                "Bovolenta",
                "Padova"
            ]
        }
    },
    "created_at": "",
    "last_run": "",
    "next_run": ""
}
const mail = new Mailer("luigi@macoweb.eu", "Nuova ricerca effettuata")
const search_options = Object.keys(search_params.schedule_content).map(platform => search_params.schedule_content[platform])
mail.SendEmail({user: "user_id", options: search_options, fileName: "csvFile.csv", filePath: "./Server/webfiles/exports/11/2023_2_2_1529_export.csv"})