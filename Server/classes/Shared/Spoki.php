<?php

class Spoki {
    
    public function __construct($exceptions = null){
        
    }
    
    public function syncAll($spokiApiData, $data = array()){
        if(empty($data)){return false;}
        
        /*
        * $data is array as:
        * $data[key] = {
        *    "phone": "+393331234567",
        *    "first_name": "Mario",
        *    "last_name": "Rossi",
        *    "email": "mario.rossi@domain.com",
        *    "language": "it",
        *    }
        *
        */
        
        $data_string = json_encode($data);
        
        $options = array(
            CURLOPT_RETURNTRANSFER => true,     // return web page
            //CURLOPT_HEADER         => false,    // don't return headers
            CURLOPT_FOLLOWLOCATION => true,     // follow redirects
            CURLOPT_ENCODING       => "",       // handle all encodings
            //CURLOPT_USERAGENT      => "spider", // who am i
            CURLOPT_AUTOREFERER    => true,     // set referer on redirect
            CURLOPT_CONNECTTIMEOUT => 120,      // timeout on connect
            CURLOPT_TIMEOUT        => 120,      // timeout on response
            CURLOPT_MAXREDIRS      => 10,       // stop after 10 redirects
            CURLOPT_SSL_VERIFYPEER => false,     // Disabled SSL Cert checks
            CURLOPT_HTTPHEADER     => array(
                                            'X-Spoki-Api-Key: ' .$spokiApiData['api_key'],//. SPOKI_API_KEY,
                                            'Content-Type: application/json'
                                            ),
            CURLOPT_CUSTOMREQUEST  => "POST",
            CURLOPT_POST           => 1,
            CURLOPT_POSTFIELDS     => $data_string,
        );
        
        $url = "https://app.spoki.it/api/1/contacts/sync_all/";
        
        curl_setopt($ch, );
        //curl_setopt($ch, CURLOPT_POSTFIELDS, array("customer"=>$data_string));
        
        $ch      = curl_init( $url );
        curl_setopt_array( $ch, $options );
        $content = curl_exec( $ch );
        $err     = curl_errno( $ch );
        $errmsg  = curl_error( $ch );
        $header  = curl_getinfo( $ch );
        curl_close( $ch );

        $header['errno']   = $err;
        $header['errmsg']  = $errmsg;
        $header['content'] = $content;
        
        $msg = "file: ". __FILE__ ."@ line:". __LINE__ . "<br />data_string = $data_string <br /><br />response: " . print_r($header,true);
        mail('devtest@vbstudio.it', 'spoki', $msg);
        
        return $header;        
    }
    
}