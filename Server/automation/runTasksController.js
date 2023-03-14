import db from '../config/dataBaseOptions.js'
import axios from 'axios';
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito"
  }
const url = 'http://localhost/' //http://localhost/ http://tua-car-test.online/
let timeOffset = new Date().getTimezoneOffset()
let dtNow = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
let tsNow = Math.floor(dtNow.getTime() / 1000);

// interval for selecting tasks
let ts_hhmmBefore = tsNow - 2 * 60;
let ts_hhmmAfter = tsNow + 3 * 60;

const q = `select * from scheduled_tasks where schedule_active = '1' and next_run <= '${new Date(ts_hhmmAfter * 1000).toISOString().slice(0, 19).replace('T', ' ')}'`
console.log(q)
db.query(q, async (err, scheduledTasks) =>{
    if(err) {
        console.log(err)
        return 0
    }
    console.log("Got the following scheduled tasks:")
    console.log(scheduledTasks.length)
    const executedTasks = []
    for(var taskIndex = 0; taskIndex < scheduledTasks.length; taskIndex++){
            const task = await tryExecuteTask(scheduledTasks[taskIndex])
            executedTasks.push(task)
    }
    console.log("Got the following running tasks:")
    console.log(executedTasks)
    executedTasks.map( async (task) =>{
        if(task === 0) return 0
        const q = `UPDATE scheduled_tasks SET last_run = '${new Date().toISOString()}', next_run = '${task.next_run}' WHERE task_id = '${task.task_id}'`;
        db.query(q, (err, res) =>{
            if(err) console.log(err)
            console.log("Aggiornamento effettuato con successo")
            return 0
        })
    })
    process.exit()
})

async function tryExecuteTask(task) {
    const hh_mm = task.schedule_start.split(":");
    const runHour = parseInt(hh_mm[0]);
    const runMinute = parseInt(hh_mm[1]);
    let timeOffset = new Date().getTimezoneOffset()
    const runDate = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
    runDate.setHours(runHour-(timeOffset / 60)=== 24 ? 0 : runHour- (timeOffset / 60), runMinute, 0, 0);
    let rd = "";
    while (runDate < dtNow) {
        rd = runDate.toISOString().slice(0, 19).replace('T', ' ');
        console.log(`rd: ${rd}`);
        runDate.setHours(runDate.getHours() + task.schedule_repeat_h);
    }
    let rs = (new Date(new Date(rd).getTime() - (timeOffset * 60 * 1000))).getTime() / 1000;
    let nextRunAt = "";
    //(rs < ts_hhmmAfter) && (rs > ts_hhmmBefore)
    if (1) {
        // run current scheduled task
        const mail_list = JSON.parse(task.schedule_cc)
        console.log("RUN NOW!!!");
        var res = await axios.get(url+"user/user/"+task.user_id)
        const user = res.data[0]
        console.log(user)
        mail_list.push(user.email)
        console.log(mail_list)
        await axios.post(url+'search', {name: user.name, mail_list: mail_list, setSpokiActive: 1, schedule_content: JSON.parse(task.schedule_content), user_id: task.user_id})
        let nextRunTs = (rs + task['schedule_repeat_h'] * 3600);
        nextRunAt = new Date(nextRunTs * 1000).toISOString().slice(0, 19).replace('T', ' ');
        console.log(`RunHour : ${runHour}`);
        console.log(`NextRun : ${nextRunAt}`);
        return {...task, last_run: new Date(), next_run: nextRunAt}
    }
    return 0;
}
