import db from '../config/dataBaseOptions.js'

const getSearchesHistory = (req, res) =>{
    const user_id = req.params.user_id
    const q = "SELECT * FROM `searches` WHERE user_id = ? ORDER BY `search_id` DESC "
    db.query(q, [user_id], (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}

export default getSearchesHistory