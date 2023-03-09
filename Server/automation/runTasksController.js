import db from '../config/dataBaseOptions.js'
import doSearchHandler from '../controllers/doSearchController.js';
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito"
  }

let dtNow = new Date();
let tsNow = Math.floor(dtNow.getTime() / 1000);

// interval for selecting tasks
let ts_hhmmBefore = tsNow - 2 * 60;
let ts_hhmmAfter = tsNow + 3 * 60;

const q = `select * from scheduled_tasks where schedule_active = '1' and next_run <= '${new Date(ts_hhmmAfter * 1000).toISOString().slice(0, 19).replace('T', ' ')}'`
console.log(q)
db.query(q, async (err, scheduledTasks) =>{
    if(err) console.log(err)
    console.log(scheduledTasks)
    const runTasks = []
    await scheduledTasks.map((task) =>{
        selectToDoTasks(task);
        return 0
    })
    console.log(runTasks)
    runTasks.map( async (selectedTask) =>{
        await doSearchHandler(selectedTask.user_id, selectedTask.schedule_content)
        const q = `UPDATE scheduled_tasks SET last_run = '${new Date().toISOString()}', next_run = '${selectedTask.next_run}' WHERE task_id = '${task.task_id}'`;
        db.query(q, (err, res) =>{
            if(err) console.log(err)
            console.log("Aggiornamento effettuato con successo")
        })
    })
})    


function selectToDoTasks(task) {
    const hh_mm = task['schedule_start'].split(":");
    const runHour = parseInt(hh_mm[0]);
    const runMinute = parseInt(hh_mm[1]);
    
    const nowHour = parseInt(dtNow.getHours());

    const runDate = new Date();
    runDate.setHours(runHour, runMinute, 0, 0);
    var runSched = runDate.getTime() / 1000;
    let rd = "";
    while (runDate < dtNow) {
        rd = runDate.toISOString().slice(0, 19).replace('T', ' ');
        console.log(`rd: ${rd}`);
        runDate.setHours(runDate.getHours() + task['schedule_repeat_h']);
        runSched = Math.floor(runDate.getTime() / 1000);
    }
    
    let rs = new Date(rd).getTime() / 1000;
    let nextRunAt = "";
    if ((rs < ts_hhmmAfter) && (rs > ts_hhmmBefore)) {
        // run current scheduled task
        console.log("<hr />RUN NOW!!!");
        let nextRunTs = rs + task['schedule_repeat_h'] * 3600;
        nextRunAt = new Date(nextRunTs * 1000).toISOString().slice(0, 19).replace('T', ' ');
        
        runTasks.push({...task, next_run: nextRunAt});
        console.log(`nextRun inside : ${nextRunAt}; <hr />`);
    }
    console.log("<br />runHour : " + runHour + ";<hr />");
    console.log("after while (" + runDate.toISOString().slice(0, 19).replace('T', ' ') + " < " + dtNow.toISOString().slice(0, 19).replace('T', ' ') + ")<hr />");
    console.log("while (" + runHour + " != " + nowHour + " && " + runHour + " < " + nowHour + ")<hr />");
    console.log("nextRun : " + nextRunAt + "; <hr />");
    console.log("if( (" + runSched + " < " + ts_hhmmAfter + ") && (" + runSched + " > " + ts_hhmmBefore + ") )<hr />");
    console.log("if( (" + new Date(runSched).toISOString().slice(0, 19).replace('T', ' ') + " < " + new Date(ts_hhmmAfter * 1000).toISOString().slice(0, 19).replace('T', ' ') + ") && (" + new Date(runSched).toISOString().slice(0, 19).replace('T', ' ') + " > " + new Date(ts_hhmmBefore * 1000).toISOString().slice(0, 19).replace('T', ' ') + ") )<hr />");
    console.log("if( (" + rd + " < " + new Date(ts_hhmmAfter * 1000).toISOString().slice(0, 19).replace('T', ' ') + ") && (" + rd + " > " + new Date(ts_hhmmBefore * 1000).toISOString().slice(0, 19).replace('T', ' ') + ") )<hr />");
    return 0;
}
