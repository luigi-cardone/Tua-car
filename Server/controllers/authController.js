import bcrypt from 'bcryptjs'
import db from '../config/dataBaseOptions.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import math from 'math'

dotenv.config()
const handleLogin = (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(400).json({ 'message': 'Sono richiesti username e password'});
    }

    // Query to check if the user exists
    const q = 'SELECT users.id, users.password, users.email, users.roles_mask, users_data.name, users.status FROM `users` INNER JOIN `users_data` ON users.id = users_data.user_id WHERE `email` = ?';
    db.query(q, [email], (err, data) => {
        if(err) {
            console.error(err);
            return res.sendStatus(500); // Internal Server Error if query fails
        }

        // Check if user exists
        if(data.length === 0) {
            return res.status(401).json({'message': "L'utente non esiste"});
        }

        const foundUser = data[0];
        if(foundUser.status != 0) {
            return res.status(401).json({'message': "L'utente è stato sospeso"});
        }

        const hashedPassword = foundUser.password;
        bcrypt.compare(password, hashedPassword, (error, match) => {
            if(error) {
                console.error(error);
                return res.sendStatus(500); // Internal Server Error if bcrypt fails
            }

            if(!match) {
                return res.status(401).json({'message': 'Password errata'});
            }

            // Generate tokens for a matched user
            const {id, email, roles_mask, name} = foundUser;
            const accessToken = jwt.sign(
                { 
                    "UserInfo": {
                        "user_id": id,
                        "email": email,
                        "roles": roles_mask,
                        "name": name
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                {expiresIn: '30s'}
            );

            const refreshToken = jwt.sign(
                { "user_id": id },
                process.env.REFRESH_TOKEN_SECRET,
                {expiresIn: '1d'}
            );

            // Set up the remembered user
            const checkRememberedQuery = 'SELECT * FROM `users_remembered` WHERE `user` = ?';
            db.query(checkRememberedQuery, [id], (err, rememberedData) => {
                if(err) {
                    console.error(err);
                    return res.sendStatus(500);
                }

                const currentDate = new Date();
                const expireDate = Math.floor(currentDate.getTime() / 1000) + 86400;

                res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

                if(rememberedData.length === 0) {
                    const insertRememberedQuery = 'INSERT INTO `users_remembered`(`id`, `user`, `selector`, `token`, `expires`) VALUES (?, ?, ?, ?, ?)';
                    db.query(insertRememberedQuery, [0, id, refreshToken, refreshToken, expireDate], (err) => {
                        if(err) {
                            console.error(err);
                            return res.sendStatus(500);
                        }
                        return res.json({name, roles: [roles_mask], user_id: id, accessToken});
                    });
                } else {
                    const updateRememberedQuery = 'UPDATE `users_remembered` SET `token`= ? ,`expires`= ? WHERE `user` = ?';
                    db.query(updateRememberedQuery, [refreshToken, expireDate, id], (err) => {
                        if(err) {
                            console.error(err);
                            return res.sendStatus(500);
                        }
                        return res.json({name, roles: [roles_mask], user_id: id, accessToken});
                    });
                }
            });
        });
    });
};


export default handleLogin