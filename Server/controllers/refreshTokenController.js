import db from '../config/dataBaseOptions.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const handleRefreshToken = (req, res) =>{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401)
    const refreshToken = cookies.jwt
    var q = 'SELECT `user` FROM `users_remembered` WHERE `token` = ?'
    db.query(q, [refreshToken], async (err, data)=>{
        if(err) console.log(err)
        if(data.length === 0){
            return res.sendStatus(403)
        }
        const user_id = data[0].user
        q = 'SELECT users_data.user_id, users_data.name, users.roles_mask, users_remembered.token FROM `users_data` INNER JOIN `users_remembered` ON users_data.user_id = users_remembered.user JOIN `users` ON users_data.user_id = users.id WHERE `user_id` = ?'
        db.query(q, [user_id], async (err, data)=>{
            if(err) console.log(err)
            if(data.length === 0){
                return res.sendStatus(403)
            }
            const user = data[0]
            jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
                (err, decoded) =>{
                    if(err || user.user_id !== decoded.user_id) {
                        console.log("founUser id: " +  user.user_id + " and decoded_id: " +decoded.user_id)
                        return res.sendStatus(403)
                    }
                    const accessToken = jwt.sign(
                        { 
                            "UserInfo" : {
                                "user_id" : user.user_id,
                                "roles" : user.roles_mask,
                                "name" : user.name
                            }
                        },
                        process.env.ACCESS_TOKEN_SECRET,
                        {expiresIn: '30s'}
                    )
                    res.json({name: user.name, roles: [user.roles_mask], user_id: user.user_id, accessToken: accessToken})
                }
             )
        })
        }
    )
}

export default handleRefreshToken