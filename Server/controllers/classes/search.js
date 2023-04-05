import fs from 'fs'

/*
Classe che definisce l'oggetto ricerca composto dai parametri di ricerca.
I metodi, azioni, possibili sono le seguenti
-> Creare la query in base ai parametri ottenuti
-> Prendere i duplicati con i comuni già cercati
-> Scrivere i duplicati con i comuni cercati
*/

const DUPLICATES_PATH = "webfiles/duplicates/";
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito",
    "platform-03": "cars_facebook"
  }
export default class Search{
    constructor({user_id, platform, yearFrom, yearTo, mileageFrom, mileageTo, geoRegion, geoProvince, geoTowns}){
        this.user_id = user_id
        this.platform = platform
        this.yearFrom = yearFrom
        this.yearTo = yearTo
        this.mileageFrom = mileageFrom
        this.mileageTo = mileageTo
        this.geoRegion = geoRegion
        this.geoProvince = geoProvince
        this.geoTowns = geoTowns
    }

    fabricateSearchQuery() {
        var query_conditions = []
        if (this.geoTowns.length > 0) query_conditions.push(`geo_town in ("${this.geoTowns.join('","')}")`)
        if (this.yearFrom !== "" && this.yearFrom !== undefined) query_conditions.push(`register_year >= '${this.yearFrom}'`)
        if (this.yearTo !== "" && this.yearTo !== undefined) query_conditions.push(`register_year <= '${this.yearTo}'`)
        if (this.mileageFrom !== "" && this.mileageFrom !== undefined) query_conditions.push(`mileage_scalar >= ${this.mileageFrom}`)
        if (this.mileageTo !== "" && this.mileageTo !== undefined) query_conditions.push(`mileage_scalar <= ${this.mileageTo}`)
        query_conditions = `where ${query_conditions.join(" and ")}`
        var query = "select id, url, subject, fuel, pollution, price, mileage_scalar, register_date, advertiser_phone, advertiser_name, geo_town from " + db_platform[this.platform] + " " + query_conditions + " order by date_remote desc";
        return query
    }

    getDuplicates(duplicates, db, callback) {
        if(duplicates.length === 0) {
            var file_name = this.user_id + "_" + db_platform[this.platform] + ".txt"
            var q = "insert into searches_duplicates (user_id, platform, duplicates_file) values ( ? ,  ? ,  ? )"
            db.query(q, [this.user_id, db_platform[this.platform], file_name], (err, data)=>{
                var returnData = []
                if(err)
                {
                    if (typeof callback == "function") callback(err)
                }
                fs.writeFile(DUPLICATES_PATH + file_name, JSON.stringify(returnData),  {flag: "w"}, (error) => {
                    if (error) {
                        if (typeof callback == "function") callback(error)
                    }
                        if (typeof callback == "function") callback(returnData);
                    });
                });
            }
        else{
            fs.readFile(DUPLICATES_PATH + duplicates[0].duplicates_file, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    if (typeof callback == "function") callback([]);
                }
                let returnData = JSON.parse(data);
                if (data === 'null') {
                    returnData = [];
                }
                if (typeof callback == "function") callback(returnData);
        });
        }
        
    }

    async writeDuplicates(newData, db) {
        var q = "select * from searches_duplicates where user_id= ? and platform= ? "
            db.query(q, [this.user_id, db_platform[this.platform]], (err, path)=>{
                if(err) return JSON.stringify(err)
                if (!fs.existsSync(DUPLICATES_PATH)) {
                    fs.mkdirSync(DUPLICATES_PATH);
                }
                fs.writeFile(DUPLICATES_PATH + path[0].duplicates_file, JSON.stringify(newData), (err) => {
                    if (err) {
                        console.error(err);
                    }
                    return 0;
                });
            })
    }
}