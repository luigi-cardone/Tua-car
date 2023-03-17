import mysql from "mysql"
import axios from 'axios';
const db = mysql.createConnection({
    host: "141.95.54.84",
    user: "luigi_tuacar",
    password: "Tuacar.2023",
    database: "tuacarDb"
})
const url = 'https://tua-car-test.online/'
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
    const hh_mm = task.schedule_start.split(":");
    const runHour = parseInt(hh_mm[0]) -(timeOffset / 60)=== 24 ? 0 : parseInt(hh_mm[0]) -(timeOffset / 60);
    const runMinute = parseInt(hh_mm[1]);
    const currentDate = new Date();
    const runDate = currentDate;
    var nextRun = currentDate
    runDate.setHours(runHour, runMinute, 0, 0);
    let rd = "";
    while (runDate < dtNow) {
        rd = runDate.toISOString().slice(0, 19).replace('T', ' ');
        console.log(`rd: ${rd}`);
        runDate.setHours(runDate.getHours() + task.schedule_repeat_h);
    }
    let rs = (new Date(new Date(rd).getTime() - (timeOffset * 60 * 1000))).getTime() / 1000;
    //(rs < ts_hhmmAfter) && (rs > ts_hhmmBefore)
    if (1) {
        // run current scheduled task
        const mail_list = JSON.parse(task.schedule_cc)
        console.log("RUN NOW!!!");
        var res = await axios.get(url+"user/user/"+task.user_id)
        const user = res.data[0]
        mail_list.push(user.email)
        console.log("The email will be sent to the following addresses:")
        console.log(mail_list)
        await axios.post(url+'search', {name: user.name, mail_list: mail_list, setSpokiActive: 1, schedule_content: JSON.parse(task.schedule_content), user_id: task.user_id})
        let nextRunTs = new Date(nextRun + (task.schedule_repeat_h - (timeOffset / 60)=== 24 ? 0 : runHour-(timeOffset / 60)) * 3600 );
        console.log(`RunHour : ${runHour}`);
        console.log(`NextRun : ${nextRunTs.toLocaleString()}`);
        return {...task, last_run: new Date(new Date().getTime() - (timeOffset * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' '), next_run: nextRunTs.toISOString().slice(0, 19).replace('T', ' ')}
    }
    return 0;
}