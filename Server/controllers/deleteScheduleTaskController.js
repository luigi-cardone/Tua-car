import db from '../config/dataBaseOptions.js'
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito"
  }

const deleteSchedule = async (req, res) => {
    const user_id = req.body.user_id
    const q = "UPDATE `scheduled_tasks` SET `schedule_active` = 0 WHERE user_id = ? && `schedule_active` = 1"
    db.query(q, [user_id], (err, data)=>{
        if(err) return res.json(err)
        return res.json({"message" : "Task rimossa con successo"})
    })
}

export default deleteSchedule