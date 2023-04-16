<?php
	$db = new \PDO("mysql:host=141.95.54.84;dbname=tuacarDb", "luigi_tuacar", "Tuacar.2023");
    AddBulkContacts($db);
    
	function AddBulkContacts($db){
        // It add all contacts from the csv files collected during the day
        $tasks = array();
        $tasks = GetAllSpokiTasks($db);
        print_r("Got " . count($tasks) . " to run\n");
        if($tasks != false){
            foreach ($tasks as $task){
            $userDataQuerry = $db->query("SELECT * FROM `users_data` WHERE `user_id`=". $task['user_id'] ." && `IsSpokiEnabled`= true");
            $userData = $userDataQuerry->fetch(PDO::FETCH_ASSOC);
            if($userData != false)
            {
                ReadAndSendToSpoki($userData['spoki_api'], $task["search_filename"], $task["user_id"], $userData['Secret'], $userData['uuID']);
                $db->query("UPDATE `searches` SET `SpokiSchedActive`= false WHERE `search_id` = ". $task["search_id"] ."");
				print_r("Task eseguita\n");
            }
            }
        }
	}
	
	function ReadAndSendToSpoki($api_key, $file_name, $user_id, $secret, $uuID){
		/* Column:
        2 -> Nominativo
        6 -> tel
        7 -> email
		*/
		$row = 1;
		$count = 1;
		$handle = fopen(__DIR__ . "/../webfiles/exports/$user_id/$file_name", 'r');
		print_r($handle . "\n");
		if ($handle)
		{
            while (($data = fgetcsv($handle, 0, ';')) !== FALSE) 
            {
                //skips first row (aka the header)
                if ($count == 1) { $count++;continue; }
                $row++;
                SendContact($data[2],$data[6], $api_key);
				if($data[2] != ""){
                RunAutomation($data[2],$data[6], $secret, $uuID, $data[0]);
				}
            }
		fclose($handle);
        }
    }

	function SendContact($nominativo, $tel, $api_key){
		$curl = curl_init();

		curl_setopt_array($curl, array(
		  CURLOPT_URL => 'https://app.spoki.it/api/1/contacts/sync/',
		  CURLOPT_RETURNTRANSFER => true,
		  CURLOPT_ENCODING => '',
		  CURLOPT_MAXREDIRS => 10,
		  CURLOPT_TIMEOUT => 0,
		  CURLOPT_FOLLOWLOCATION => true,
		  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
		  CURLOPT_CUSTOMREQUEST => 'POST',
		  CURLOPT_POSTFIELDS =>'{
			"phone": "'.$tel.'",
			"first_name": "'.$nominativo.'",
			"last_name": "",
			"email": "",
			"language": "it",
			"contactfield_set": []
		}',
		  CURLOPT_HTTPHEADER => array(
			'X-Spoki-Api-Key: '.$api_key.'',
			'Content-Type: application/json'
		  ),
		));

		$response = curl_exec($curl);

		curl_close($curl);
	}
	
	function GetAllSpokiTasks($db)
    {
        $db;
        $q = $db->query("SELECT * FROM `searches` WHERE `SpokiSchedActive`= true");
        return $q->fetchAll(PDO::FETCH_ASSOC);
    }

    function RunAutomation($nominativo, $tel, $secret, $uuID, $name_auto){
        $curl = curl_init();

        curl_setopt_array($curl, array(
        CURLOPT_URL => "https://app.spoki.it/wh/ap/".$uuID."/",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_POSTFIELDS =>'{
            "secret": "'.$secret.'",
            "phone": "'.$tel.'",
            "first_name": "'.$nominativo.'",
            "last_name": "",
            "email": "",
            "custom_fields": {
                "link_auto": "'.$name_auto.'"
            }
        }',
        ));
        curl_close($curl);
        }