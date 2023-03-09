import db from '../config/dataBaseOptions.js'

const getTowns = (req, res) =>{
    var towns = req.body
    towns = towns.join('","')
    const q = `SELECT * FROM italy_cities WHERE comune in ("${towns}")`
    db.query(q, (err, data)=>{
        if(err) {
            console.log(err)
            return res.json(err)
        }
        return res.json(data)
    })
}

export default getTowns