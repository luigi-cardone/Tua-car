import db from '../config/dataBaseOptions.js'
import Search from './classes/search.js'
import fs from 'fs'
import Mailer from './classes/mailer.js'
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito"
  }

const EXPORTS_PATH = "webfiles/exports/"

const doSearch = async (req, res) =>{
    const search_params = req.body.schedule_content
    const user_id = req.body.user_id
    const csvFile = await doSearchHandler(user_id, search_params, (csvFile =>{
        const mail = new Mailer(req.body.email, "Nuova ricerca effettuata")
        const search_options = Object.keys(search_params).map(platform => {
            var options = search_params[platform]
            options = {...options, platform: db_platform[platform]}
            return options
        })
        mail.SendEmail({user: req.body.name, options: {search_options}, fileName: csvFile?.fileName, filePath: csvFile?.fileNamePath})
        
        return res.json(csvFile)
    }))
}

const doSearchHandler = async (user_id, search_params, callback) =>{
    const csvData = []
    var loop_counter = 0
    if(search_params !== {}){
        Object.entries(search_params).forEach(([platform, platform_params]) =>{
            const search = new Search({...platform_params, user_id : user_id})
            const search_query = search.fabricateSearchQuery()
            db.query(search_query, (err, results)=>{
                if(err) if (typeof callback == "function") callback(err);
                var duplicates_query = "select duplicates_file from searches_duplicates where user_id= ? and platform= ? "
                db.query(duplicates_query, [user_id, db_platform[platform_params.platform]] , async (err, data)=>{
                    if(err) if (typeof callback == "function") callback(err);
                    search.getDuplicates(data, db, async (duplicates) =>{
                        var flippedDuplicates = (duplicates.length > 0) ? Object.fromEntries(duplicates.map((item) => [item, true])) : {};
                        var returnData = []
                        var newDuplicates = []
                        console.log("Results found: " + results.length)
                        if(results.length > 0){
                            results.forEach((result) =>{
                                if (JSON.stringify(flippedDuplicates) === '{}'){
                                    console.log(result.id + "added")
                                    newDuplicates.push(result.id);
                                    returnData.push(result);
                                }
                                else{
                                    if (!flippedDuplicates[result.id]) {
                                        console.log(result.id + " added")
                                        newDuplicates.push(result.id);
                                        returnData.push(result);
                                        }
                                }
                            })
                        }
                        var nw = duplicates.concat(newDuplicates);
                        await search.writeDuplicates(nw, db)
                        csvData.push(returnData)
                        loop_counter++
                        if(loop_counter === Object.entries(search_params).length){
                            await writeCsv(csvData, search_params, db, user_id, (csv_file) =>{
                                if (typeof callback == "function") callback(csv_file);
                            })
                        }
                    })
                })
            })
        })
    }
}

async function writeCsv(data, searchOptions, db, user_id, callback) {
    searchOptions = JSON.stringify(searchOptions)
    const filePath = `${EXPORTS_PATH}${user_id}`;
    const fileName = `${new Date().getFullYear()}_${(new Date().getMonth())}_${(new Date().getDay())}_${(new Date().getHours())}${(new Date().getMinutes())}_export.csv`;
    if(!fs.existsSync(filePath)) {
        fs.mkdirSync(path, 0o775)
    }
    const fp = fs.openSync(`${filePath}/${fileName}`, 'w');
    fs.chmodSync(`${filePath}/${fileName}`, 0o755);
  
    const headers = ["Veicolo (Marca Modello Versione)", "Trattativa", "Nominativo", "Indirizzo", "Località", "Tel", "Cel", "Mail", "WebLink", "Nota_1", "Nota_2", "Nota_3", "Nota_4", "Nota_5", "PrezzoMin", "PrezzoMax"];
    fs.writeSync(fp, headers.join(";") + "\n");
  
    let cnt = 0;
    data.forEach((platform_index) => {
        platform_index.forEach((item) =>{
            cnt++;
            item.advertiser_name = item.advertiser_name || "Gentile Cliente";
            const field = [item.subject, "A", item.advertiser_name, "", item.geo_town, "", item.advertiser_phone, "", item.url, item.mileage_scalar, item.fuel, item.pollution, "", "", "", item.price];
            fs.writeSync(fp, field.join(";") + "\n");
        })
    });
  
    fs.closeSync(fp);
    var q = "insert into searches (user_id, search_filename, search_path, search_options, search_results, search_date, SpokiSchedActive) values( ? , ?, ?, ?, ?, ?, ?)"
    db.query(q, [user_id, fileName, `${filePath}/${fileName}`, searchOptions, cnt, new Date().toISOString().split('T')[0], 1], (err, data)=>{
        if(err) return JSON.stringify(err)
        const response = {
          fileName: fileName,
          fileNamePath: `${filePath}/${fileName}`,
          searchCnt: cnt
        }
        if (typeof callback == "function") callback(response);

        
    })
    
  
  }

export default doSearch