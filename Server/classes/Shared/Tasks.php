<?php

class Tasks {
    
    var $db;
    
    function __construct($db){
        $this->db = $db;
    }
    
    public function getAllActive(){
        $q = $this->db->query("select * from scheduled_tasks where schedule_active = '1'");
        return $q->fetchAll();
    }
    
    public function getAllByUser($userId = 0, $active = null){
        $qw = array();
        if(!empty($active)){
            $qw[] = "schedule_active = '$active'";
        }
        $qw[] = "user_id='$userId'";
        $where = implode(" and ", $qw);
        $q = $this->db->query("select * from scheduled_tasks where $where");
        return $q->fetchAll();
    }
    
    public function getActiveByTime($time = null){
        if(!$time){ $time = time();}
        
        $q = $this->db->query("select * from scheduled_tasks where schedule_active = '1'");
        return $q->fetchAll();
    }

    public function getNextTasks($time = null){
        if(!$time){ $time = time();}
        
        // $intl = 5 minuti
        
        date_default_timezone_set("Europe/Rome");
        
        /* $timestampNow = time();
        
        /* metti un range tra "adesso" e 3 mintuti in avanti e 2 minuti indietro */
        /* $timestampPlus = $timestampNow + 3 * 60;
        $timestampMinus= $timestampNow - 2 * 60;
        
        $hmStart = date("H:i", $timestampMinus);
        $hmEnd = date("H:i", $timestampPlus);
        
        $dtNow = new \DateTime();
        $tsNow = $dtNow->getTimestamp();
        
        $currentHHmm = $dtNow->format('H:i');
        $intervalStart = '18:25';
        $intervalEnd = '18:35';
        // first query for current tasks
        $q = $this->db->query("SELECT * FROM scheduled_tasks WHERE schedule_active= '1' and schedule_start between '$intervalStart' and '$intervalEnd'");
        return $q->fetchAll();
        
        $dtSched = new \DateTime();
        $hh_mm = explode(":",$inputData['scheduleStart']);
        $dtSched->setTime((int)$hh_mm[0], (int)$hh_mm[1], 0);
        
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

        
        
        $q = $this->db->query("select * from scheduled_tasks where schedule_active = '1'");
        return $q->fetchAll(); */
    }

}