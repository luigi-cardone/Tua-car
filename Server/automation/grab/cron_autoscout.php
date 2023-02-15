<?php
require_once('/var/www/vhosts/leads.tua-car.it/httpdocs/classes/adodb5/adodb.inc.php');

$db_hostname = 'localhost';
$db_username = 'tuacarusr';
$db_password = 'Ck#v00b3';
$db_dbname = 'tuacardb';

$db = &ADONewConnection('mysqli');
if (!$db->Connect($db_hostname, $db_username, $db_password, $db_dbname))
{
  
  echo "could not connect to database: ". $db->errorMsg();
  exit;
}

/* Set the desired charset after establishing a connection */
$db->Execute("SET character_set_results = 'utf8mb4', character_set_client = 'utf8mb4', character_set_connection = 'utf8mb4', character_set_database = 'utf8mb4', character_set_server = 'utf8mb4'");

$dealer = array();
date_default_timezone_set("Europe/Rome");

$max_pages = 21;
    $i=1;
    $exit_crawl = false;

for ($page = 1; $page < $max_pages; $page++){
    # set_time_limit(60);
    ob_start();
    
    $o_param = ($page==1)?"":"&page=".$page."";
    
    $dealer['crawl_url'] = "https://www.autoscout24.it/lst?sort=age&desc=1&cy=I&atype=C&ustate=N%2CU&powertype=kw&custtype=P".$o_param;

    echo "<br /><hr /><br />url = <a href='".$dealer['crawl_url']."' />".$dealer['crawl_url']."</a><br /><hr /><br />";

      
      //$file = file_get_contents($dealer['crawl_url'], false, $context);
      $p_data = getPage($dealer['crawl_url']);
      $file = $p_data['content'];
      
      //var_dump($http_response_header);
      //echo $file;



    # tuacarusr
    # tuaPwCar1!

    /* $ch = curl_init(); 
    curl_setopt ($ch, CURLOPT_URL, $url); 
    $result = curl_exec ($ch); 
    echo $result;  
    curl_close($ch);
     */



      $doc = new DOMDocument; 
      @$doc->loadHTML($file);


    $finder = new DomXPath($doc);
    
    //$articles = $doc->getElementsByTagName('article')->item(0);
    /* $anchors = $finder->query("//article/div/a");
    foreach($anchors as $a)
    { 
        echo $a->nodeValue." - ".$a->getAttribute("href")."<br/>";
    } */
    
    $id= '__NEXT_DATA__';
    $ndata = $finder->query("//*[@id='$id']")->item(0)->nodeValue;
    
    $jdec_data = json_decode($ndata, true);
    $entries = $jdec_data["props"]["pageProps"]["listings"];
    // print_r($entries);
    
    //$entries = $finder->query('//article');
    foreach ($entries as $k => $entry) {
        
        echo "<br />";
        
        /* 
        $href = $finder->query(".//a",$entry);
        $url = $href->item(0)->getAttribute('href');
        
        $article_id = $entry->getAttribute('id'); */
        
        $article_id = $entry["id"];
        $url = $entry["url"];
		echo "Questo è il time:" . date("Y-m-d H:i:s", time($t));
        if(isset($article_id)){
            // fn: get_location by zip :: $item['location']['zip']
            $check_result = $db->Execute("SELECT id FROM cars_autoscout where urn='".$article_id."'");
            if ($check_result->recordCount() == 0){
                
                echo '<br /><b>Insert: ' . $article_id .'</b> :: '. $url . '<br />';
        
                $v_data = getPage("https://www.autoscout24.it".$url);
                $v_page = $v_data['content'];
                $pd = new DOMDocument;
                @$pd->loadHTML($v_page);
                
                $vfinder = new DomXPath($pd);
                
                $vid= '__NEXT_DATA__';
                $elements = $vfinder->query("//*[@id='$vid']")->item(0)->nodeValue;

                // print_r($elements);

                $jdec = json_decode($elements, true);
                $item = $jdec['props']['pageProps']['listingDetails'];
        
                
                $geoTag = getGeoTags($db, $item['location']['zip']);

                $subject = preg_replace("/\s+/", " ", $item['vehicle']['make'].' '.$item['vehicle']['model'].' '.str_replace($item['vehicle']['model'], '', $item['vehicle']['modelVersionInput']));
                $advertiser_phone = str_replace('+39', '', $item['seller']['phones']['0']['callTo']);
                $advertiser_name = (isset($item['seller']['contactName']))?$item['seller']['contactName']:'';
                $year = substr($item['vehicle']['firstRegistrationDate'], -4, 4);
                
                $data = array(
                              'urn' => $item['id'],
                              'subject' => $subject,
                              'body' => '',// $item['description'],
                              'date_remote' => date("Y-m-d H:i:s", time()),
                              'pollution' => $item['vehicle']['environmentEuDirective']['formatted'],
                              'fuel' => $item['vehicle']['fuelCategory']['formatted'],
                              'vehicle_status' => $item['vehicle']['legalCategories'][0],
                              'price' => $item['prices']['public']['priceRaw'],
                              'mileage_scalar' => $item['vehicle']['mileageInKmRaw'],
                              'doors' => $item['vehicle']['numberOfDoors'],
                              'register_date' => $item['vehicle']['firstRegistrationDate'],
                              'register_year' => $year,
                              'geo_region' => $geoTag['regione'],
                              'geo_provincia' => $geoTag['provincia'],
                              'geo_town' => ucwords(strtolower($item['location']['city'])),
                              'url' => $item['webPage'],
                              'advertiser_name' => $advertiser_name,
                              'advertiser_phone' => $advertiser_phone,
                               
                              );
                              
                $cols = array_keys($data);
                $bindCols = implode(", ", $cols);
                $bindVars = array_values($data);
                
                $sql = "INSERT INTO cars_autoscout (urn, subject, body, date_remote, pollution, fuel, vehicle_status, price, mileage_scalar, doors, register_date, register_year, geo_region, geo_provincia, geo_town, url, advertiser_name, advertiser_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                // echo $sql."<br />";
                $qw = $db->Execute($sql,$bindVars);
                
                $e = $db->errorMsg();
                print $e;
                
                print_r($data);

            } else {
                echo "<br /><b>".$article_id." already exists</b><br />";
                //$exit_crawl = true;
            }

            
        }
        
        $i++;
    
    }
    
    if($exit_crawl){
        ob_end_flush();
        break;
    }
    
    ob_end_flush();

}

/* Delete old records, 90 days ago */
$deleteIntevalTs = time() - 86400 * 90; // 1day * 90
$q = "delete from cars_autoscout where date_remote < '".date("Y-m-d H:i:s", $deleteIntevalTs)."'";
$db->Execute($q);
// mail("devtest@vbstudio.it", "delquery", $q);

function getPage($url){
    
        $cookieFileLocation = "cookie_as.txt";
        $cookieJarFileLocation = "cookie_as_jar.txt";
        $useragent = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36';
        $referer = "https://www.google.com";
    
         $s = curl_init($url);

         curl_setopt($s,CURLOPT_URL,$url);
         
         curl_setopt($s,CURLOPT_SSL_VERIFYPEER, false);
         //curl_setopt($s,CURLOPT_SSL_VERIFYSTATUS, false);
         
         
         curl_setopt($s,CURLOPT_AUTOREFERER,true);
         //curl_setopt($s,CURLOPT_HTTPHEADER,array('Expect:'));
         curl_setopt($s,CURLOPT_TIMEOUT,30);
         curl_setopt($s,CURLOPT_MAXREDIRS,10);
         curl_setopt($s,CURLOPT_RETURNTRANSFER,true);
         curl_setopt($s,CURLOPT_FOLLOWLOCATION,true);
         curl_setopt($s,CURLOPT_COOKIEJAR,$cookieJarFileLocation);
         curl_setopt($s,CURLOPT_COOKIEFILE,$cookieFileLocation);
         curl_setopt($s,CURLOPT_VERBOSE,true);
         //curl_setopt($s,CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_2TLS);

         curl_setopt($s,CURLOPT_USERAGENT,$useragent);
         curl_setopt($s,CURLOPT_REFERER,$referer);
      
        $content = curl_exec($s);
        $curl_errno = curl_errno($s);
        $curl_error = curl_error($s);
         
         $status = curl_getinfo($s,CURLINFO_HTTP_CODE);
         curl_close($s);
         
         $data = array(
                       "status" => $status,
                       "curl_errno" => $curl_errno,
                       "curl_error" => $curl_error,
                       "content" => $content,
                       );
         
         return $data;

}

function getGeoTags($db, $zip){
    $data = array(
                  "regione" => '',
                  "provincia" => '',
                  "sigla" => '',
                  "comune" => '',
                  "cap" => $zip,
                  );
    
    $q = $db->Execute("SELECT c.comune, c.regione, p.sigla, p.provincia from italy_cities c, italy_provincies p where c.cap='".$zip."' and p.sigla = c.provincia limit 1");
    if ($q->RecordCount() > 0){
        $r = $q->fetchRow();
    } else {
        $limcap = substr($zip, 0, 3);
        $q = $db->Execute("SELECT c.comune, c.regione, p.sigla, p.provincia from italy_cities c, italy_provincies p where c.cap like '".$limcap."%' and p.sigla = c.provincia limit 1");
        $r = $q->fetchRow();
    }

    $data['regione'] = $r['regione'];
    $data['provincia'] = $r['provincia'];
    $data['sigla'] = $r['sigla'];
    $data['comune'] = $r['comune'];
    
    return $data;
}