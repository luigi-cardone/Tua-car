<?php

// namespace Maco;

//require_once('../classes/autoload.php');

class Search{
    
    var $db;
    var $userId;
    
    function __construct($db, $userId){
        $this->db = $db;
        $this->userId = $userId;
    }
    
    public function getPlatform($platform){
        if ($platform == 'platform-01'){
            return array('platformName' => 'TuaCar - S', 'platformTable' => 'cars_subito');
        }
        if ($platform == 'platform-02'){
            return array('platformName' => 'TuaCar - A', 'platformTable' => 'cars_autoscout');
        }
        
    }
    
    public function doSearch($platform, $towns=array(), $yearFrom = 0, $yearTo = 0, $mileageFrom = 0, $mileageTo = 0, $limit=200){
        // prepare where conditions
        $where_conditions = array();
        $resultText = '';
        $returnData = array();
        
        if(!empty($towns)){
            $where_conditions[] = "geo_town in (".implode(",", $towns).")";
        }
        
        if(!empty($yearFrom)){
            $where_conditions[] = "register_year >= '".$yearFrom."'";
        }
        
        if(!empty($yearTo)){
            $where_conditions[] = "register_year <= '".$yearTo."'";
        }
        
        if(!empty($mileageFrom)){
            $where_conditions[] = "mileage_scalar >= ".$mileageFrom."";
        }
        
        if(!empty($mileageTo)){
            $where_conditions[] = "mileage_scalar <= ".$mileageTo."";
        }
        
        $where_clause = "where ".implode(' and ', $where_conditions);
        
        // FOR DEBUG!! DA commentare in production
        //if($this->userId == 2){ $limit=2; }
        
        $queryString = "select id, url, subject, fuel, pollution, price, mileage_scalar, register_date, advertiser_phone, advertiser_name, geo_town from ".$platform['platformTable']." $where_clause order by date_remote desc limit $limit";
         // error_log($queryString);
        $query = $this->db->query($queryString);
        
        // get duplicates file
        $duplicates=array();
        $duplicates = $this->getDuplicates($platform['platformTable']);
        $flippedDuplicates = (!empty($duplicates))?array_flip($duplicates):array();
        
        
        $newDuplicates = array();
        while($result = $query->fetch()){
            
            //check if id is in duplicates
            if (!isset($flippedDuplicates[$result['id']])){
                $newDuplicates[] = $result['id'];
                $returnData[] = $result;
            } else {
                // no data to be returned
            }
            
            // make csv
            // send mail csv
        }
        
        
        // write duplicates file
        $nw = array_merge($duplicates, $newDuplicates);
        $wd = $this->writeDuplicates($nw, $platform['platformTable']);
        
        return $returnData;
        
    }
    
    
    
    public function getDuplicates($platform) {
        $q = $this->db->query("select duplicates_file from searches_duplicates where user_id='".$this->userId."' and platform='".$platform."'");
        $r = $q->fetch();
        
        if(!$r){
            // create new db_record and file for platform 
            $filename = $this->userId . "_" . $platform .".txt";
            $q = $this->db->query("insert into searches_duplicates (user_id, platform, duplicates_file) values ('".$this->userId."', '$platform', '$filename')");
            $data = [];
            $initialData = json_encode($data);
            
            // first time init:: make file
            if(!is_file(DUPLICATES_PATH . $filename)){
                file_put_contents(DUPLICATES_PATH . $filename, $initialData);
            }
            
            return $data;
        } else {
            // read file contens by returned row
            $data = file_get_contents(DUPLICATES_PATH . $r['duplicates_file']);
            $returnData = json_decode($data, true);
            if ($data=='null'){ $returnData = [];}
            // return "<br /> data = ".print_r($returnData, true);
            return $returnData;
        }
        
        return [];
        
        
    }
    
    public function writeDuplicates($newDuplicates, $platform){
        $q = $this->db->query("select * from searches_duplicates where user_id='".$this->userId."' and platform='".$platform."'");
            while($r = $q->fetch()){
                // $result = array_merge($duplicates, $newDuplicates);
                $data = json_encode($newDuplicates);
                file_put_contents(DUPLICATES_PATH . $r['duplicates_file'], $data);
                return $data;
            }
    }
    
    public function writeCsv($data = array(), $searchOptions = ''){
        
        $filePath = EXPORTS_PATH . $this->userId;
        $fileName = date("Ymd_His")."_export.csv";
        
        if(!is_dir($filePath)){
            $this->createPath($filePath);
        }
        
        $spokiData = array();
        
        $fp = fopen("$filePath/$fileName", 'w');
        chmod("$filePath/$fileName",0755);
        
        $headers = array("Veicolo (Marca Modello Versione)","Trattativa","Nominativo","Indirizzo","Località","Tel","Cel","Mail","WebLink","Nota_1","Nota_2","Nota_3","Nota_4","Nota_5","PrezzoMin","PrezzoMax");
        fputcsv($fp, $headers, ";");
        
        $cnt=0;
        
        foreach ($data as $p){
            foreach ($p as $item){
                $cnt++;
                //$item['body'] = preg_replace('/[^\p{L}\p{N}]/u', ' ', $item['body']);
                $item['body'] = preg_replace('/[\s+]/u', ' ', $item['body']);
                $item['advertiser_name'] = ($item['advertiser_name'] == '') ? "Gentile Cliente" : $item['advertiser_name'];
                $field = array($item['subject'], "A", $item['advertiser_name'], "", $item['geo_town'], "", $item['advertiser_phone'], "", $item["url"], $item['mileage_scalar'], $item['fuel'], $item['pollution'], "", "", "", $item['price']);
                fputcsv($fp, $field, ";");
            }

        }
	
        fclose($fp);
        
        $q = $this->db->query("insert into searches (user_id, search_filename, search_path, search_options, search_results, search_date, SpokiSchedActive) values('".$this->userId."', '$fileName', '$filePath/$fileName', '$searchOptions', '$cnt', '".date("Y-m-d H:i:s")."', '1')");
        
        $response = array(
                          'fileName' => $fileName,
                          'fileNamePath' => "$filePath/$fileName",
        );
        
        return $response;
    }
    
    public function createPath($path) {
        if (is_dir($path)) return true;
        $prev_path = substr($path, 0, strrpos($path, '/', -2) + 1 );
        $return = $this->createPath($prev_path);
        return ($return && is_writable($prev_path)) ? mkdir($path,0775) : false;
    }
	
}