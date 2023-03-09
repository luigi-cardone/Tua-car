import db from '../config/dataBaseOptions.mjs'
const getUsers = (req, res) =>{
    const q = "SELECT users_data.*, users.email, users.status, users.verified, users.roles_mask FROM `users_data` INNER JOIN `users` ON users_data.user_id = users.id"
    db.query(q, (err, data)=>{
        if(err) return res.json(err)
        return res.json(data)
    })
}
export default getUsers