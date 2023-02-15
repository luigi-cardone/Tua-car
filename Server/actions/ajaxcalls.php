<?php

namespace Maco;

// require_once("../classes/webconfig.php"); //main_vars

require_once('../classes/autoload.php');
        // echo json_encode($_REQUEST);

if(!empty($_POST['fname'])){
    
    if($_POST['fname'] == 'send_search_data'){
        if(!empty($_POST['data'])){
            //$serId = $auth->getUserId();
            $sendData = json_decode($_POST['data'], true);
            $response = setSearch($db, $sendData, $_POST['user_id']);
            echo $_POST['data'];
        }
    }
    
    if($_POST['fname'] == 'send_scheduling_data'){
        if(!empty($_POST['data'])){
            $scheduleData = json_decode($_POST['data'], true);
            $response = setSchedule($db, $scheduleData, $_POST['user_id']);
        } else {
            $response = "No data sent!";
        }
        echo json_encode($response);
    }
    
}

function setSearch($db, $inputData, $userId){
    $return = '';
    $results = array();
    $textResult = 'Hai cercato:<br />';
    
    $mailText = '';
    
    $search = new \Search($db, $userId);
    $location = new \Location($db);
    
    $i = 1;
    
    $searchOptions = json_encode($inputData);
    
    
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
                 'title' => "Risultati ricerca singola",
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
    if (is_file($csvFile['fileNamePath'])){
        $mailer->AddAttachment($csvFile['fileNamePath']);
    }
    
    $mailer->data = $maildata;
    $result = $mailer->send();
    
    return $return;
}

function setSchedule($db, $inputData, $userId){
    date_default_timezone_set("Europe/Rome");
	
    $returnText = '';
    
    $debugText = '<br />Debug::<br />';
    
    $dtNow = new \DateTime();
    $dtSched = new \DateTime();
    $hh_mm = explode(":",$inputData['scheduleStart']);
    $dtSched->setTime((int)$hh_mm[0], (int)$hh_mm[1], 0);
    
    $tsNow = $dtNow->getTimestamp();
    $tsSched = $dtSched->getTimestamp();
    
    // orario di schedulazione dev'essere almeno 10 minuti in futuro
    $diffMinutes = ($tsSched - $tsNow)/60;
    $nextSchedTs = $tsSched;
    while($diffMinutes < 10){
        $nextSchedTs += $inputData['scheduleRepeatHours'] * 3600;
        $diffMinutes = ($nextSchedTs - $tsNow)/60;
    }
    
    $dtNowString = $dtNow->format('Y-m-d H:i:s');
    $dtSchedString = $dtSched->format('Y-m-d H:i:s');
    
    
    $nexRunDate = new \DateTime();
    $nexRunDate->setTimestamp($nextSchedTs);
    $nextRunAt = $nexRunDate->format('Y-m-d H:i');
    //$nextRunText = "<strong>" . (($nexRunDate->format("Y-m-d") == $dtNow->format('Y-m-d'))? "oggi" : "domani") ."</strong> alle ore <strong>". $nexRunDate->format("H:i") ."</strong>"; 
    
    
    $debugText .= "<br />Timediff:: $dtSchedString - $dtNowString = $diffMinutes minuti --> nextRunAT: $nextRunAt  <br />";
    
    $additionalMails=array();
    $inputData['scheduleCc'] = str_replace(" ","",$inputData['scheduleCc']);
    if(!empty($inputData['scheduleCc'])){
        $mailCCs = str_replace(array(",", ";", " "),"|",$inputData['scheduleCc']);
        $additionalMails = explode("|",$mailCCs);
    }
    
    foreach($additionalMails as $k=>$mailbox){
        if(!filter_var($mailbox, FILTER_VALIDATE_EMAIL)){
            return json_encode(array("error" => true, "message" => "Uno o più indirizzi aggiuntivi non sono validi ($mailbox)"));
        }
    }
    
    $qVars = array(
                   "user_id" => $userId,
                   "schedule_active" => '1',
                   "schedule_start" => $inputData['scheduleStart'],
                   "schedule_repeat_h" => $inputData['scheduleRepeatHours'],
                   "schedule_cron_style" => '',
                   "schedule_cc" => json_encode($additionalMails),
                   "schedule_content" => json_encode($inputData['sendData']),
                   "created_at" => date("Y-m-d H:i:s"),
                   //"last_run" => '',
                   "next_run" => $nextRunAt,
                   );
    
    
    //$debugText .= "<br />Qvars:: " .print_r($qVars, true);
    //$debugText .= "<br /><br />sData:: " .json_encode($inputData);
    
    $returnText .= "La tua ricerca è stata programmata.<br />La cadenza impostata è ogni <strong>".$inputData['scheduleRepeatHours']." ore</strong> a partire dalle <strong>".$inputData['scheduleStart']."</strong>, quindi la prossima esecuzione sarà <strong>" . (($nexRunDate->format("Y-m-d") == $dtNow->format('Y-m-d'))? "oggi" : "domani") ."</strong> alle ore <strong>". $nexRunDate->format("H:i") ."</strong><br />";
    
    // verifica se c'è già una schedulazione attiva per $userId
    $hasTaskQuery = $db->query("select count(task_id) as cnt from scheduled_tasks where user_id = '$userId' and schedule_active = '1'");
    $hasTaskResult = $hasTaskQuery->fetch();
    
    // debug::
    $hasTask = $hasTaskResult['cnt'];
    if($hasTask) {
        $return = json_encode(array("error" => true, "message" => "Hai già una ricerca programmata. Per programmare una nuova ricerca è necessario disattivare la programmazione attuale."));
    } else {
        
        $query = "insert into scheduled_tasks (" . implode(", ", array_keys($qVars)) . ") values (" . implode(', ', array_fill(0, count($qVars), '?')) . ")";
        $bindVars = array_values($qVars);
        $db->prepare($query)->execute($bindVars);
        $debugText .= $query;
        
        $return = json_encode(array("error" => false, "message" => $returnText));
    }
    
    
    return $return;
}


function scheduleRemove($db, $scheduleId, $userId){
    //return "update scheduled_tasks set schedule_active = '0' where task_id = '$scheduleId'";
    $q = $db->query("update scheduled_tasks set schedule_active = '0' where task_id = '$scheduleId'");
	if($q){
    return "ok";
	}
	else{
		return "not ok";
	}
}