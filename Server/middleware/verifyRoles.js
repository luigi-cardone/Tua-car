const verifyRoles = (...allowedRoles) =>{
    return (req, res, next) =>{
        if (!req?.roles) return res.sendStatus(401)
        const rolesArray = [...allowedRoles]
        console.log(rolesArray)
        console.log(req.roles)
        const result = req.roles.map((role) => rolesArray.includes(role)).find(wal => val === true)
        if (!result) res.sendStatus(401)
        next()
    }
}

export default verifyRoles