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

$user_agent = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36";//$_SERVER['HTTP_USER_AGENT']
  $options = array(
    'http'=>array(
      'method'=>"GET",
      "ignore_errors" => true,
      'header'=> array(
                       //"User-Agent: ".$user_agent // i.e. An iPad 
                       ":authority" => "www.subito.it",
                        ":method" => "GET",
                        ":path" => "/annunci-italia/vendita/auto/?from=box-motor",
                        ":scheme" => "https",
                        "accept" => "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                        "accept-encoding" => "gzip, deflate, br",
                        "accept-language" => "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7,de;q=0.6",
                        "cookie" => "akacd_orodha=2177452799~rv=20~id=3c971c9cd90fada2979c3ece88f6a641; didomi_token=eyJ1c2VyX2lkIjoiMTc1NjVhODktODA3OC02MTQ4LWE0MTMtNDU3NmM2N2ZiNTljIiwiY3JlYXRlZCI6IjIwMjItMDUtMzFUMTU6NDM6MjUuMjg2WiIsInVwZGF0ZWQiOiIyMDIyLTA1LTMxVDE1OjQzOjI1LjI4NloiLCJ2ZW5kb3JzIjp7ImVuYWJsZWQiOlsic2FsZXNmb3JjZSIsImdvb2dsZSIsImM6bWVkYWxsaWEtaWh6cnlGTFkiLCJjOmhvdGphcmNvbS1IS1QyVHhYVSJdfSwicHVycG9zZXMiOnsiZW5hYmxlZCI6WyJjb29raWVhbmEta0NDUkd6NG0iLCJkZXZpY2VfY2hhcmFjdGVyaXN0aWNzIiwiZ2VvbG9jYXRpb25fZGF0YSJdfSwidmVyc2lvbiI6MiwiYWMiOiJBRm1BQ0FGay5BQUFBIn0=; euconsent-v2=CPZ1YkAPZ1YkAAHABBENCRCsAP_AAAAAAAAAIxtf_X__b3_j-_5___t0eY1f9_7__-0zjhfdt-8N3f_X_L8X_2M7vF36pq4KuR4Eu3LBIQdlHOHcTUmw6okVrzPsbk2cr7NKJ7PEmnMbe2dYGH9_n93T-ZKY7_____77__-_______f__-_f___5_3__-_f_V_997bn9_____9_P___9v__9_________4AAACSUAGAAIIxhoAMAAQRjFQAYAAgjGUgAwABBGMdABgACCMZCADAAEEYwkAGAAIIxiIAMAAQRjGQAYAAgjGAA.f_gAAAAAAAAA; kppid=6FF906B46994A2E41849A1E4; _hjSessionUser_124009=eyJpZCI6Ijk1NDY3YzgwLWU5MTYtNTNiMy05ZTcwLTUwYTk5Y2RjMjkxZCIsImNyZWF0ZWQiOjE2NTM2NzQ5OTM2NjMsImV4aXN0aW5nIjp0cnVlfQ==; _hjSession_124009=eyJpZCI6Ijg0YWRhMmQ4LWI1Y2UtNDgyZC1iNTU5LWIyOTYyNjRmY2NhOSIsImNyZWF0ZWQiOjE2NTQyNjcyODI3MjgsImluU2FtcGxlIjpmYWxzZX0=; _hjAbsoluteSessionInProgress=0; _hjIncludedInSessionSample=0; _pulse2data=047e9a0a-905e-46b4-bce3-adca61540f80%2Cv%2C%2C1654270260387%2CeyJpc3N1ZWRBdCI6IjIwMjAtMDctMTRUMTg6MzM6MjNaIiwiZW5jIjoiQTEyOENCQy1IUzI1NiIsImFsZyI6ImRpciIsImtpZCI6IjIifQ..H2W3rbOzhsS3XJM905vD3g.njEs-ELipOZ1yhkAaVsFCWLKMypoCPp8KPYvy2bzrrhpspgQDD5YrJO552zvfI0cnJ3U8gpcH9CSy1bmjy2tGIedmlxUU_EU3bCv8PtP0K1Ch_nX9l35STUZ7Gc4vYpO27e17AOriw20yrBNC6XQSQmjYSzUTxtzzGKzk6ahKyvdJY2zPY0YP5OyO0KF2R815eZi6iIM2zGoa-ksLw4fha4BYBNXLjbcQ_OTv-AG8qg.sLCTAJoo0jS2XfXxbKQ1NA%2C6423147766685772771%2C%2Ctrue%2C%2CeyJraWQiOiIyIiwiYWxnIjoiSFMyNTYifQ..Ww31ttLbtZlI4CFYkxCUXpSNL8WnI2fpiiNLAqe7OzM",
                        "device-memory" => "8",
                        "ect" => "4g",
                        "referer" => "https://www.subito.it/",
                        "sec-ch-ua" => '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
                        "sec-ch-ua-mobile" => "?0",
                        "sec-ch-ua-platform" => '"Windows"',
                        "sec-fetch-dest" => "document",
                        "sec-fetch-mode" => "navigate",
                        "sec-fetch-site" => "same-origin",
                        "sec-fetch-user" => "?1",
                        "sec-gpc" => "1",
                        "upgrade-insecure-requests" => "1",
                        "user-agent" => "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
                       )
    )
  );



  $context = stream_context_create($options);

$max_pages = 21;
    $i=1;
    $exit_crawl = false;

for ($page = 1; $page < $max_pages; $page++){
    

    $dealer['crawl_url'] = "https://www.subito.it/annunci-italia/vendita/auto/?o=".$page."&advt=0";

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

    // print_r( $doc);
    $id= '__NEXT_DATA__';
    $elements = $finder->query("//*[@id='$id']")->item(0)->nodeValue;

    // print_r($elements);

    $jdec = json_decode($elements, true);
     //print_r($jdec);


    foreach ($jdec['props']['state']['items']['list'] as $item){
        echo "<hr /><b>Item: $i:</b><br />";
        //echo $item['body']."<br />";
        $getphone='';
        if(isset($item['item']['urn'])){
            
            $check_result = $db->Execute("SELECT id FROM cars_subito where urn='".$item['item']['urn']."'");
            if ($check_result->recordCount() == 0){
            
                //$getphone = json_decode(file_get_contents('https://www.subito.it/hades/v1/contacts/ads/'.$item['item']['urn'], false, $context), true);
                
                $ph_data = getPage('https://www.subito.it/hades/v1/contacts/ads/'.$item['item']['urn']);
                $getphone = json_decode($ph_data['content'],true);
                    print_r($ph_data);
                    echo $getphone;
               /*      die();
                
                if ($p_data['curl_errno']){
                    
                } */

                
                $data = array(
                              'urn' => $item['item']['urn'],
                              'subject' => $item['item']['subject'],
                              'body' => '',//$item['item']['body'],
                              'date_remote' => $item['item']['date'],
                              'pollution' => $item['item']['features']['/pollution']['values']['0']['value'],
                              'fuel' => $item['item']['features']['/fuel']['values']['0']['value'],
                              'vehicle_status' => $item['item']['features']['/vehicle_status']['values']['0']['value'],
                              'price' => $item['item']['features']['/price']['values']['0']['key'],
                              'mileage_scalar' => $item['item']['features']['/mileage_scalar']['values']['0']['key'],// $item['item']['features']['/mileage_scalar']['values']['0']['value'],
                              'doors' => $item['item']['features']['/doors']['values']['0']['value'],
                              'register_date' => $item['item']['features']['/register_date']['values']['0']['value'],
                              'register_year' => $item['item']['features']['/year']['values']['0']['value'],
                              'geo_region' => $item['item']['geo']['region']['value'],
                              'geo_provincia' => $item['item']['geo']['city']['value'],
                              'geo_town' => $item['item']['geo']['town']['value'],
                              'url' => $item['item']['urls']['default'],
                              'advertiser_name' => $item['item']['advertiser']['name'],
                              'advertiser_phone' => $getphone['phone_number'],
                              
                              );
                              
                              
                $cols = array_keys($data);
                $bindCols = implode(", ", $cols);
                $bindVars = array_values($data);
                
                $sql = "INSERT INTO cars_subito (urn, subject, body, date_remote, pollution, fuel, vehicle_status, price, mileage_scalar, doors, register_date, register_year, geo_region, geo_provincia, geo_town, url, advertiser_name, advertiser_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                echo $sql."<br />";
                $db->execute($sql,$bindVars);
                
                print_r($data);
                
            } else {
                echo "<br /><b>".$item['item']['urn']." already exists</b><br />";
                //$exit_crawl = true;
            }
            
        }
        
        /* 
        
        echo $item['item']['urn'] . '(https://www.subito.it/hades/v1/contacts/ads/'.$item['item']['urn'] . ") phone:: ";
        print_r($getphone);
        
        unset($item['item']['images']);
        unset($item['item']['after']['images']);
        print_r($item); */
        $i++;
    }
    
    if($exit_crawl){
        break;
    }

}

/* Delete old records, 90 days ago */
$deleteIntevalTs = time() - 86400 * 90; // 1day * 90
$q = "delete from cars_subito where date_remote < '".date("Y-m-d H:i:s", $deleteIntevalTs)."'";
$db->Execute($q);
// mail("devtest@vbstudio.it", "delquery", $q);



function getPage($url){
    
        $cookieFileLocation = "cookie_sbt.txt";
        $cookieJarFileLocation = "cookie_sbt_jar.txt";
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
