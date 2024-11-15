import mysql from "mysql"
import axios from 'axios';
const db = mysql.createConnection({
    host: "141.95.54.84",
    user: "luigi_tuacar",
    password: "Tuacar.2023",
    database: "tuacarDb"
})
const url = 'https://leads.tua-car.it/'
let timeOffset = new Date().getTimezoneOffset()
let dtNow = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
let tsNow = Math.floor(dtNow.getTime() / 1000);

// interval for selecting tasks
let ts_hhmmBefore = tsNow - 2 * 60;
let ts_hhmmAfter = tsNow + 3 * 60;

const q = `select * from scheduled_tasks where schedule_active = '1' and next_run <= '${new Date(ts_hhmmAfter * 1000).toISOString().slice(0, 19).replace('T', ' ')}'`
console.log(q)
db.query(q, async (err, scheduledTasks) =>{
    if(err) console.log(err)
    console.log("Got the following scheduled tasks:")
    console.log(scheduledTasks.length)
    const executedTasks = []
    for(var taskIndex = 0; taskIndex < scheduledTasks.length; taskIndex++){
            const task = await tryExecuteTask(scheduledTasks[taskIndex])
            executedTasks.push(task)
    }
    console.log("Got the following running tasks:")
    executedTasks.map( async (task) =>{
        if(task === 0) return 0
        const q = `UPDATE scheduled_tasks SET last_run = '${task.last_run}', next_run = '${task.next_run}' WHERE task_id = '${task.task_id}'`;
        console.log(q)
        db.query(q, (err, res) =>{
            if(err) console.log(err)
            console.log("Aggiornamento effettuato con successo")
            return task.task_id
        })
    })
    console.log(executedTasks)
    process.exit()
})

async function tryExecuteTask(task) {
    try {
        const [hour, minute] = task.schedule_start.split(":").map(Number);
        const adjustedHour = (hour - timeOffset / 60 + 24) % 24; // Adjust for offset and wrap around
        const currentDate = new Date();
        const runDate = new Date(currentDate);
        runDate.setHours(adjustedHour, minute, 0, 0);

        // Calculate the last run time
        while (runDate < dtNow) {
            runDate.setHours(runDate.getHours() + task.schedule_repeat_h);
        }

        const lastRunTime = runDate.toISOString().slice(0, 19).replace('T', ' ');
        const lastRunTimestamp = new Date(lastRunTime).getTime() - timeOffset * 60 * 1000;

        if (lastRunTimestamp < ts_hhmmAfter && lastRunTimestamp > ts_hhmmBefore) {
            console.log("RUN NOW!!!");

            const mailList = JSON.parse(task.schedule_cc);
            const userRes = await axios.get(`${url}user/user/${task.user_id}`);
            const user = userRes.data[0];
            mailList.push(user.email);

            console.log("The email will be sent to the following addresses:", mailList);

            await axios.post(`${url}search`, {
                name: user.name,
                mail_list: mailList,
                setSpokiActive: 1,
                schedule_content: JSON.parse(task.schedule_content),
                user_id: task.user_id,
            });

            const nextRun = new Date(
                currentDate.getTime() + task.schedule_repeat_h * 3600 * 1000
            );
            console.log(`Next Run Scheduled at: ${nextRun.toLocaleString()}`);

            return {
                ...task,
                last_run: new Date(currentDate.getTime() - timeOffset * 60 * 1000)
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' '),
                next_run: nextRun.toISOString().slice(0, 19).replace('T', ' '),
            };
        }
    } catch (err) {
        console.error("Error in tryExecuteTask:", err);
        return 0;
    }
    console.log("Error in outer loop:");
    return 0;
}
