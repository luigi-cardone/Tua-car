import db from '../config/dataBaseOptions.js'
import moment from 'moment'
const db_platform = {
    "platform-01": "cars_autoscout",
    "platform-02": "cars_subito"
  }

const setScheduleSearch = async (req, res) => {
    const search_params = req.body
    const user_id = req.body.user_id
    setSchedule(db, search_params, user_id, res)
}


function setSchedule(db, inputData, userId, res) {
    var debugText = "<br />Debug::<br />";
    console.log(inputData)
    let timeOffset = new Date().getTimezoneOffset()
    var dtNow = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
    var dtSched = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
    var hh_mm = inputData.schedule_start.split(":");
    dtSched.setHours(parseInt(hh_mm[0]), parseInt(hh_mm[1]), 0);

    var tsNow = dtNow.getTime();
    var tsSched = dtSched.getTime();

    // L'orario di pianificazione deve essere almeno 10 minuti in futuro
    var diffMinutes = (tsSched - tsNow) / 60 / 1000;
    var nextSchedTs = tsSched;
    while (diffMinutes < 10) {
        nextSchedTs += inputData.schedule_repeat_h * 3600 * 1000;
        diffMinutes = (nextSchedTs - tsNow) / 60 / 1000;
    }

    var dtNowString = dtNow.toISOString().slice(0, 19).replace("T", " ");
    var dtSchedString = dtSched.toISOString().slice(0, 19).replace("T", " ");

    var nextRunDate = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
    nextRunDate.setTime(nextSchedTs);
    var nextRunAt = nextRunDate.toISOString().slice(0, 16).replace("T", " ");

    debugText += "<br />Timediff:: " + dtSchedString + " - " + dtNowString + " = " + diffMinutes + " minuti --> nextRunAT: " + nextRunAt + "  <br />";

    var additionalMails = [];
    inputData.schedule_cc = inputData.schedule_cc.replace(/ /g, "");
    if (inputData.schedule_cc) {
        var mailCCs = inputData.schedule_cc.replace(/[,; ]/g, "|");
        additionalMails = mailCCs.split("|");
    }

    for (var k = 0; k < additionalMails.length; k++) {
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(additionalMails[k])) {
            return res.json({
                error: true,
                message: "Uno o pi?? indirizzi aggiuntivi non sono validi (" + additionalMails[k] + ")"
            });
        }
    }

    var qVars = {
        user_id: userId,
        schedule_active: '1',
        schedule_start: inputData.schedule_start,
        schedule_repeat_h: inputData.schedule_repeat_h,
        schedule_cron_style: '',
        schedule_cc: JSON.stringify(additionalMails),
        schedule_content: JSON.stringify(inputData.schedule_content),
        created_at: new Date(),
        next_run : nextRunAt
    }

    
    // esegue una query per verificare se c'?? gi?? una schedulazione attiva per l'utente
    let hasTask = false;
    var cnt = 0
    db.query("select * from scheduled_tasks where user_id = ? and schedule_active = '1'", [userId] , (err, hasTaskResult)=>{
        if (err) {
            console.log(err)
            return 0
        }
        if (hasTaskResult.length > 0) {
            hasTask = true;
        }
        else{
            let returnText = "La tua ricerca ?? stata programmata.\nLa cadenza impostata ?? ogni " + hasTaskResult[0].schedule_repeat_h + " ore a partire dalle " + hasTaskResult[0].schedule_start + ", quindi la prossima esecuzione sar?? " + (moment(hasTaskResult[0].next_run).format("Y-m-d") === moment(dtNow).format('Y-m-d') ? "oggi" : "domani") + " alle ore " + moment(hasTaskResult[0].next_run).format("hh:mm")
        }
        
            // debug:
            if (hasTask) {
                return res.json({
                    error: true,
                    message: "Hai gi?? una ricerca programmata. Per programmare una nuova ricerca ?? necessario disattivare la programmazione attuale."
                })
            } else {
                let q = "insert into scheduled_tasks (" + Object.keys(qVars).join(", ") + ") values (" + Array(qVars.length).fill("?").join(", ") + ")";
                db.query(q, [Object.values(qVars)] ,(err, data) =>{
                    if(err) console.log(err)
                    debugText += q;
                    return res.json({
                        error: false,
                        message: returnText
                    })
                });
            }
    });
    
}

export default setScheduleSearch