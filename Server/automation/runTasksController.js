import db from '../config/dataBaseOptions.js'
import doSearchHandler from '../controllers/doSearchController.js';
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
    console.log(scheduledTasks)
    const executedTasks = []
    executedTasks = await scheduledTasks.map(async (task) =>{
        await tryExecuteTask(task)
        return 0
    })
    console.log("Got the following running tasks:")
    console.log(executedTasks)
    executedTasks.map( async (task) =>{
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
    const hh_mm = task['schedule_start'].split(":");
    const runHour = parseInt(hh_mm[0]);
    const runMinute = parseInt(hh_mm[1]);
    const timeOffset = new Date().getTimezoneOffset()
    const runDate = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
    runDate.setHours(runHour - (timeOffset / 60), runMinute, 0, 0);
    var runSched = runDate.getTime() / 1000;
    let rd = "";
    while (runDate < dtNow) {
        rd = runDate.toISOString().slice(0, 19).replace('T', ' ');
        console.log(`rd: ${rd}`);
        runDate.setHours(runDate.getHours() + task['schedule_repeat_h']);
        runSched = Math.floor(runDate.getTime() / 1000);
    }
    let rs = (new Date(new Date(rd).getTime() - (timeOffset * 60 * 1000))).getTime() / 1000;
    let nextRunAt = "";
    if ((rs < ts_hhmmAfter) && (rs > ts_hhmmBefore)) {
        // run current scheduled task
        console.log("<hr />RUN NOW!!!");
        try{
            await doSearchHandler(task.user_id, task.schedule_content)
            let nextRunTs = (rs + task['schedule_repeat_h'] * 3600);
            nextRunAt = new Date(nextRunTs * 1000).toISOString().slice(0, 19).replace('T', ' ');
            console.log(`RunHour : ${runHour}`);
            console.log(`NextRun : ${nextRunAt}`);
            console.log({...task, last_run: dtNow.toISOString().slice(0, 19).replace('T', ' '), next_run: nextRunAt})
            return {...task, last_run: dtNow.toISOString().slice(0, 19).replace('T', ' '), next_run: nextRunAt}
        }
        catch(err){
            console.log(err)
        }
    }
    return 0;
}
