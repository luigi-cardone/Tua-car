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
    const email = req.body.email
    await doSearchHandler(user_id, search_params, (csvFile =>{
        const mail = new Mailer(email, "Nuova ricerca effettuata")
        const search_options = Object.keys(search_params).map(platform => {
            var options = search_params[platform]
            options = {...options, platform: db_platform[platform]}
            return options
        })
        mail.SendEmail({user: req.body.name, options: search_options, fileName: csvFile?.fileName, filePath: csvFile?.fileNamePath})
        const msg = `E' stato creato il file${csvFile.Filename} ${csvFile.searchCnt > 0 ? ` con un totale di ${csvFile.searchCnt}` : ". Non è stato trovato nessun nuovo risultato, prova a cambiare i parametri di ricerca"}`
        return res.json({error: false, message: msg})
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
    const currentDate = new Date().toJSON().slice(0,10).replace(/-/g,'/').replaceAll("/", "_")
    const fileName = `${currentDate}_export.csv`;
    if(!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, 0o775)
    }
    const fp = fs.openSync(`${filePath}/${fileName}`, 'w');
    fs.chmodSync(`${filePath}/${fileName}`, 0o755);
  
    const headers = ["Veicolo (Marca Modello Versione)", "Trattativa", "Nominativo", "Indirizzo", "Località", "Tel", "Cel", "Mail", "WebLink", "Nota_1", "Nota_2", "Nota_3", "Nota_4", "Nota_5", "PrezzoMin", "PrezzoMax"];
    fs.writeFile(fp, headers.join(";") + "\n", (err) =>{
        if(err) console.log(err)
    });
    let cnt = 0;
    for(var platform_index = 0; platform_index < data.length; platform_index++){
        const platform_data = data[platform_index]
        for(var item_index = 0; item_index < platform_data.length; item_index++){
            cnt++;
            platform_data[item_index].advertiser_name = platform_data[item_index].advertiser_name || "Gentile Cliente";
            const field = [platform_data[item_index].subject, "A", platform_data[item_index].advertiser_name, "", platform_data[item_index].geo_town, "", platform_data[item_index].advertiser_phone, "", platform_data[item_index].url, platform_data[item_index].mileage_scalar, platform_data[item_index].fuel, platform_data[item_index].pollution, "", "", "", platform_data[item_index].price];
            fs.writeFile(fp, field.join(";") + "\n", (err) =>{
                if(err) console.log(err)
            });
        }
    }
    fs.close(fp);
    console.log((new Date().toISOString().split('T').join(" ").replace("Z", "")).slice(0, 19))
    var q = "insert into searches (user_id, search_filename, search_path, search_options, search_results, search_date, SpokiSchedActive) values( ? , ?, ?, ?, ?, ?, ?)"
    db.query(q, [user_id, fileName, `${filePath}/${fileName}`, searchOptions, cnt, (new Date().toISOString().split('T').join(" ").replace("Z", "")).slice(0, 19), 1], (err, data)=>{
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