<?php

require_once("../classes/autoload.php");

//Debug:: token force
$_REQUEST['token'] = "YZKvrHUZ7t5ZyT087sPjyeuIvH3KvXO4";

// ToDo:: call with token!!!
$tokens = array(
"YZKvrHUZ7t5ZyT087sPjyeuIvH3KvXO4", // crontab call
);
if(empty($_REQUEST['token']) && !in_array($_REQUEST['token'], $tokens)){
    die("Operazione non consentita.");
}

/* Logic::
*  - trova tutte le task attive nell'orario di run del cron
*  - verifica se l'utente è ancora attivo
*  - ricerca database per ogni task valido
*  - invia risultato per mail
*  - aggiorna datetime "nextRun" della task appena eseguita
*/

echo "Debug:: - tkn={$_REQUEST['token']} <br />";

$tasks = new \Tasks($db);

//print_r($tasks->getAllByUser('2'));



/* get active tasks by now() */

date_default_timezone_set("Europe/Rome");


$dtNow = new \DateTime();
$tsNow = $dtNow->getTimestamp();

$dtSched = new \DateTime();
//$tsSched = $dtSched->getTimestamp();

// interval for selecting tasks
$ts_hhmmBefore = $tsNow - 2 * 60;
$ts_hhmmAfter = $tsNow + 3 * 60;

$hhmmBefore = date("H:i", $ts_hhmmBefore);
$hhmmAfter = date("H:i", $ts_hhmmAfter);

echo "select * from scheduled_tasks where schedule_active = '1' and next_run <= '".date("Y-m-d H:i:s", $ts_hhmmAfter)."'";

$getScheduledQ = $db->query("select * from scheduled_tasks where schedule_active = '1' and next_run <= '".date("Y-m-d H:i:s", $ts_hhmmAfter)."'");

// runTasks is :: Array con solo tasks che possano essere avviate, inizialmente vuoto
$runTasks = array();

foreach ($getScheduledQ->fetchAll() as $scheduled){
    print_r($scheduled);
    
    
    $hh_mm = explode(":",$scheduled['schedule_start']);
    $schedHour = (int)$hh_mm[0];
    $schedMinute = (int)$hh_mm[1];
    
    $runHour = $schedHour;
    $runMinute = $schedMinute;
    $nowHour = $dtNow->format("H");
    
    $runDate = new \DateTime();
    $runDate->setTime((int)$runHour, $runMinute, 0);
    $runSched = $runDate->getTimestamp();
    
    if($runSched > $tsNow){
        $runDate->modify("-1 day");
    }
    $runSched = $runDate->getTimestamp();
    
    echo "<br />".$runDate->format("Y-m-d H:i:s");
        echo "before while (".$runDate->format("Y-m-d H:i:s")." < ".$dtNow->format("Y-m-d H:i:s").")<hr />";
    while($runDate < $dtNow){
        $rd = $runDate->format("Y-m-d H:i:s");
         echo " rd:".$rd;
        $runDate->add(new DateInterval('PT'.$scheduled['schedule_repeat_h'].'H'));
        $runSched = $runDate->getTimestamp();
    }
    
    $rs = strtotime($rd);
    if( ($rs < $ts_hhmmAfter) && ($rs > $ts_hhmmBefore) ){
        // run current scheduled task
        echo " <hr />RUN NOW!!! ";
        $nextRunTs = $rs + $scheduled['schedule_repeat_h'] * 3600;
        $nextRunAt = date("Y-m-d H:i:s", $nextRunTs);
        
        $runTasks[] = array(
                            "user_id" => $scheduled["user_id"],
                            "task_id" => $scheduled["task_id"],
                            "next_run" => $nextRunAt
                            );
        
        echo "nextRun inside : $nextRunAt; <hr />";
    }
        echo "<br />runHour : $runHour;<hr />";
        echo "after while (".$runDate->format("Y-m-d H:i:s")." < ".$dtNow->format("Y-m-d H:i:s").")<hr />";
        echo "while ($runHour != $nowHour && $runHour < $nowHour)<hr />";
        echo "nextRun : $nextRunAt; <hr />";
        echo "if( ($runSched < $ts_hhmmAfter) && ($runSched > $ts_hhmmBefore) )<hr />";
        echo "if( (".date('Y-m-d H:i:s',$runSched)." < ".date('Y-m-d H:i:s',$ts_hhmmAfter).") && (".date('Y-m-d H:i:s',$runSched)." > ".date('Y-m-d H:i:s',$ts_hhmmBefore).") )<hr />";
        echo "if( (".$rd." < ".date('Y-m-d H:i:s',$ts_hhmmAfter).") && (".$rd." > ".date('Y-m-d H:i:s',$ts_hhmmBefore).") )<hr />";
        echo "<br /> diffMinutes: $diffMinutes / RunAt:: " . $nextRunAt . "<hr />";
    
    
}





foreach ($runTasks as $task) {
    
    /*
    * Esecuzione Tasks dopo i calcoli preventivi
    * - get info (parametri, userId)
    * - make search e salva risultati temp (+invio mail per ogni CC)
    * - update nextRun of schedule
    * - $task = [task_id, next_run];
    */
    
    // Get all runnable tasks
    $getTasksQ = $db->query("select * from scheduled_tasks where schedule_active = '1' and task_id = '".$task["task_id"]."'");
    
    while ( $t = $getTasksQ->fetch()) {
        print_r($t);
        
        setScheduledSearch($db, $t, $task['next_run']); //json_decode($t['schedule_content'], true), $t['user_id']);
    }
    
    
    
    
    // get user mail
    // search options
    
}


function setScheduledSearch($db, $task, $next_run){
    $userId = $task['user_id'];
    $searchOptions = $task['schedule_content']; // json encoded
    $inputData = json_decode($searchOptions, true);
    
    $return = '';
    $results = array();
    $textResult = 'Hai cercato:<br />';
    
    $mailText = '';
    
    $search = new \Search($db, $userId);
    $location = new \Location($db);
    
    $i = 1;
    
    //$searchOptions = json_encode($inputData);
    
    
    foreach ($inputData as $options){
        
        $platform = $search->getPlatform($options['platform']);
        
        $mailText .= "<br /><b>Piattaforma: ".$platform['platformName']."</b><br />";

        // get towns by zipcode thrown from multiselect
        $towns = array();
        foreach($options['towns'] as $cap){
            $town = $location->fromCap($cap);
            foreach ($town as $k => $v){
                $towns[] = $v['comune'];
            }
        }
        $mailText .= "Localit&agrave;: ". (implode(", ", $towns))."<br />";
        $p_anno = " - Anno da ".((!empty($options['yearFrom']))?$options['yearFrom']:"qualsiasi")." a ".((!empty($options['yearTo']))?$options['yearTo']:"qualsiasi");
        $p_km = " - Km da ".((!empty($options['mileageFrom']))?$options['mileageFrom']:"qualsiasi")." a ".((!empty($options['mileageTo']))?$options['mileageTo']:"qualsiasi");
        $mailText .= "Parametri:<br />$p_anno<br />$p_km<br /><br />";
        
        // add results by platform
        $results[$platform['platformTable']] = $search->doSearch($platform, $towns, $options['yearFrom'], $options['yearTo'], $options['mileageFrom'], $options['mileageTo']);
        
        //$textResult .= "<b>$i:: </b>UserID = $userId & Platform - ".$platform['platformTable']."<br />";//$qresult;
        
        //$textResult .= "<hr />";
        $i++;
    }
    
    /* generate csv file (with options values saved in db for next processing)
    returns array:
    $csvFile['fileName'] = 'Ymd_His_file.csv';
    $csvFile['fileNamePath'] = '/webfiles/exports/{userId}/Ymd_His_file.csv';
    */
    $csvFile = $search->writeCsv($results, $searchOptions);
    $textResult .= $mailText;
    $textResult .= "<br /><br />E' stato generato il file " . $csvFile['fileName'];
    // fileNamePath = $csvFile['fileNamePath']

        $return .= $textResult;
    
    $mailer = new \MacoMail;
    $template= new \Eftec\Bladeone\BladeOne('../views');
    $q = $db->query("select u.email, ud.* from users u, users_data ud where ud.user_id='".$userId."' and ud.user_id = u.id");
    $userData = $q->fetch();
    $data = array(
                 'title' => "Risultati ricerca programmata",
                 'data' => ["toUser" => $userData['name']],
                 'options' => $mailText,
                 'host' => HOSTNAME,
                 'rif_id' => $csvFile,
                 );
    
    $maildata = array(
                      'from' => MAIL_FROM,
                      'to' => $userData['email'],
                      'subject' => $data['title'],
                      'body' => '',
                      'immediate' => true,
                      'send_as_html' => 1,
                      );
    //debug::
    // error_log(" -- UserID = $userId // UserEmail = :: " . print_r($maildata, true));
    $maildata['body'] = $template->run('Mails.sendCsvTemplate', $data);
    
    $ccs = json_decode($task['schedule_cc']);
    foreach($ccs as $cc){
        $mailer->AddCC(trim($cc));
    }
    // ToDo :: not for production!!!
    $mailer->AddBCC('devtest@vbstudio.it');
    
    if (is_file($csvFile['fileNamePath'])){
        $mailer->AddAttachment($csvFile['fileNamePath']);
    }
    
    $mailer->data = $maildata;
    $result = $mailer->send();
    
    $upd=$db->query("update scheduled_tasks set last_run='".date('Y-m-d H:i:s')."', next_run='".$next_run."' where task_id = '".$task["task_id"]."'");
    //error_log($return);
    //$q = $db->query("update u.email, ud.* from users u, users_data ud where ud.user_id='".$userId."' and ud.user_id = u.id");
    return $return;
}



