import db from '../config/dataBaseOptions.js'

const handlerLogOut = (req, res) =>{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204)
    const refreshToken = cookies.jwt

    var q = 'SELECT * FROM `users_remembered` WHERE `token` = ?'
    db.query(q, [refreshToken], async (err, data)=>{
        if(err) console.log(err)
        if(data.length === 0){
            res.clearCookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 86400})
            return res.sendStatus(204)
        }
        const foundUser = data[0]
        q = 'UPDATE `users_remembered` SET `token`= ? WHERE `user` = ? '   
        db.query(q, ["", foundUser.user], (err, data) =>{
            if(err) console.log(err)
            res.clearCookie('jwt', refreshToken, {httpOnly: true, sameSite: 'None', secure: true, maxAge: 86400})
            res.sendStatus(204)
        })
    }
    )
}

export default handlerLogOut