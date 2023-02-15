import bcrypt from 'bcrypt'
import db from '../config/dataBaseOptions.js'
import math from 'math'
import roles from '../config/userRoles.js'

const handleNewUser = async (req, res) =>{
    const user = req.body
    const email = user.email
    const pwd = user.password
    if(!email || !pwd) return res.status(400).json({ 'message': 'Username and password required'})
    // Check if username already exists (res.sendStatus(409))
    var q = 'SELECT `email` FROM `users` WHERE `email` = ?'
    db.query(q, [email], async (err, data)=>{
        if(err) console.log(err)
        if(data.length !== 0){
            return res.status(409).json({'message' : 'Username already exits'})
        }
        try{
            const hashedPwd = await bcrypt.hash(pwd, 10)
            // Store the new user 
            var q = 'INSERT INTO `users`( `id`, `email`, `password`, `status`, `verified`, `resettable`, `roles_mask`, `registered`, `force_logout`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ? ) '
            var currentDateTime = new Date();
            db.query(q, [0, email, hashedPwd, 0, 0, 1, roles["Admin"], math.floor(currentDateTime.getTime() / 1000), 0] ,(err, data)=>{
                if(err) console.log(err)
                var q = 'SELECT `id` FROM `users` WHERE `email` = ?'
                db.query(q, [email] ,(err, data)=>{
                    if(err) console.log(err)
                    const user_id = data[0].id
                    q = 'INSERT INTO `users_data`(`id`, `user_id`, `name`, `company`, `vat_number`, `ssn_number`, `address`, `zip`, `city`, `state`, `region`, `location`, `phone`, `user_config`, `spoki_api`, `IsSpokiEnabled`, `Secret`, `uuID`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) '
                    db.query(q, [0, user_id ,user.name, user.company, 0, 0, user.addr, user.zip, user.city, user.state, user.region, 0, user.tel, "", "", 0, "", ""] ,(err, data)=>{
                        if(err) console.log(err)
                        res.status(201).json({'success' : "New user created"})
                    })
                })
            })
        }
        catch (err){
            console.log(err)
            res.status(500).json({'message': err.message})
        }
    })
}


export default handleNewUser