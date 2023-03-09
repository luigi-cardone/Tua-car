import bcrypt from 'bcryptjs'
import db from '../config/dataBaseOptions.mjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import math from 'math'

dotenv.config()
const handleLogin = (req, res) =>{
    const {email, password} = req.body
    if(!email || !password) return res.sendStatus(400).json({ 'message': 'Username and password required'})
    //Check if the user exists (return res.sendStatus(401))
    var q = 'SELECT users.id, users.password, users.email, users.roles_mask, users_data.name FROM `users` INNER JOIN `users_data` ON users.id = users_data.user_id WHERE `email` = ?'
    db.query(q, [email], (err, data)=>{
        if(err) console.log(err)
        if(data.length === 0){
            return res.sendStatus(401).json({'message' : 'User does not exit'})
        }
        const foundUser = data[0]
        const hashedPassword = foundUser.password
        bcrypt.compare(password, hashedPassword, function(error, match){
            if(match){
                const {id, email, roles_mask, name} = foundUser
                const accessToken = jwt.sign(
                    { 
                        "UserInfo" : {
                            "user_id" : id,
                            "email" : email,
                            "roles" : roles_mask,
                            "name" : name
                        }
                    },
                    process.env.ACCESS_TOKEN_SECRET,
                    {expiresIn: '30s'}
                    )
                const refreshToken = jwt.sign(
                    { "user_id" : id },
                    process.env.REFRESH_TOKEN_SECRET,
                    {expiresIn: '1d'}
                    )
                q = 'SELECT * FROM `users_remembered` WHERE `user` = ?'
                db.query(q, [id], (err, data) =>{
                    if(err) console.log(err)
                    var currentDate = new Date()
                    var expireDate = math.floor(currentDate.getTime() / 1000) + 86400
                    res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });
                    if(data.length === 0){
                        q = 'INSERT INTO `users_remembered`(`id`, `user`, `selector`, `token`, `expires`) VALUES (?, ?, ?, ?, ?)'
                        db.query(q, [0, id, refreshToken, refreshToken, expireDate], (err, data) =>{
                            if(err) console.log(err)
                            res.json({name: name, roles: [roles_mask], user_id: id, accessToken: accessToken});
                        })
                    }
                    else{
                        q = 'UPDATE `users_remembered` SET `token`= ? ,`expires`= ? WHERE `user` = ? '   
                        db.query(q, [refreshToken, expireDate, id], (err, data) =>{
                            if(err) console.log(err)
                            res.json({name: name, roles: [roles_mask], user_id: id, accessToken: accessToken});
                        })
                    }
    
                })
            }
            else if(error)console.log(error)
            else{
                res.status(401).json({'message' : 'Password errata'})
            }
        });
    })
}

export default handleLogin