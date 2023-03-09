import db from '../config/dataBaseOptions.js'
const getRegions = (req, res) =>{
    const q = "SELECT `regione`,`id_regione`  FROM `italy_regions`"
    db.query(q, (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}
const getStateFromRegion = (req, res) =>{
    const region_id = req.params.id
    const q = "SELECT `provincia`, `sigla` FROM `italy_provincies` WHERE `id_regione` = ?"
    db.query(q, [region_id], (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}
const getCityFromState = (req, res) =>{
    const procince_sigla = req.params.province_sigla
    const q = "SELECT `comune`, `cap`, `provincia`, `regione` FROM `italy_cities` WHERE `provincia` = ?"
    db.query(q, [procince_sigla], (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}

const getLocationFromZip = (req, res) =>{
    const maxZip = parseInt(req.params.zip) + 30
    const minZip = parseInt(req.params.zip) - 30
    const q = "SELECT `comune`, `regione`, `provincia` FROM `italy_cities` WHERE `cap` BETWEEN ? AND ?"
    db.query(q, [minZip, maxZip], (err, data)=>{
        if(err) {return res.json(err)}
        console.log(minZip + " " + maxZip)
        return res.json(data)
    })
}

export {
    getRegions,
    getStateFromRegion,
    getCityFromState,
    getLocationFromZip
}