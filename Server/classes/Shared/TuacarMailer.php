<?php

//require_once('../classes/autoload.php');

//use \PHPMailer\PHPMailer;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

class MacoMail extends \PHPMailer\PHPMailer\PHPMailer {
    
    var $data = array();
    /* var $FromName = "TuaCar";
    var $Host     = "mail.vbstudio.it"; # "www.tuacar.it;smtp2.example.com";
    var $Mailer   = "smtp";   // Alternative to IsSMTP()
    var $WordWrap = 75;
    var $SMTPAuth   = true;   // enable SMTP authentication
    var $Port = 25;
    var $SMTPDebug = false;
    var $SetFrom = "devtest@vbstudio.it";
   
    var $Username   = "devtest@vbstudio.it"; // SMTP account username
    var $Password   = "Feii2^212";     // SMTP account password  */
    
    
    public function __construct($exceptions = null) {
        parent::__construct($exceptions);
        // $this->IsSendmail();  // tell the class to use Sendmail
        $this->IsSMTP();  // tell the class to use SMTP
        $this->SMTPOptions = array(
                                    'ssl' => array(
                                                    'verify_peer' => false,
                                                    'verify_peer_name' => false,
                                                    'allow_self_signed' => true
                                                    )
                                    );
        //$this->SetLanguage( "it" );
        $this->FromName = "TuaCar";
        $this->Host     = "smtps.aruba.it"; # "www.tuacar.it; smtp2.example.com";
        // $this->Mailer   = "smtp";   // Alternative to IsSMTP()
        $this->WordWrap = 75;
        $this->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        //$this->SMTPSecure = 'tls';                            
        $this->Port = 465;
        $this->SMTPAuth   = true;   // enable SMTP authentication
        // $this->Port = 25;
        // $this->SMTPDebug = true;
        $this->SetFrom = "leads@tua-car.it";
        
        // $this->SMTPDebug    = SMTP::DEBUG_SERVER;
       
        $this->Username   = "leads@tua-car.it"; // SMTP account username
        $this->Password   = "3dbewiu!DUseeffg";     // SMTP account password 
        
    }
    
    public function send(){
        
        $data = $this->data;
        
        if(empty($data)){
            error_log("Errore: \$data is empty in ". __FILE__ . " @ line " . __LINE__ . " (non hai indicato i dati utili)");
        }
        
        if ($data['replyto']) {
            $this->AddReplyTo($data['replyto'] ,"");
        } else {
            $this->AddReplyTo($data['from'] ,"");
        }
          
        if ($data['fromname']){
            $this->FromName=$data['fromname'];
        }
        
        $this->From = $data['from'];  
        $to = $data['to']; 
        $this->AddAddress($to);
        
        if (isset($data['bcc'])){
            $bccs = explode( ",", $data['bcc'] );
            if (is_array($bccs)){
                foreach ($bccs as $k => $bcc){
                    $this->AddBCC(trim($bcc),trim($bcc));
                }
            } else {
                $this->AddBCC(trim($data['bcc']));
            }
        }

        if (isset($data['cc'])){
            $ccs = explode( ",", $data['cc'] );
            if (is_array($ccs)){
                foreach ($ccs as $k => $cc){
                    $this->AddCC(trim($cc),trim($cc));
                }
            } else {
                $this->AddCC(trim($data['cc']));
            }
        }

        $this->Subject  = trim( $data['subject'] );  
        $this->MsgHTML(  trim( $data['body'] ));
        $this->IsHTML($data["send_as_html"]); 


        /* if ($data["send_as_html"]) {
            $this->AltBody = $this->htmlToPlainText($data['body']);//"To view the message, please use an HTML compatible email viewer!"; // optional, comment out and test
        } */

        if ( $data["filename"] && $data["binarydata"] ) {
            $uid=md5(uniqid(mt_rand(), true));
            $mailfile=TMPUPLOAD_DIR . $uid.".mdat.".$data["filename"];
            file_put_contents ( $mailfile , $data["binarydata"],LOCK_EX );
            $this->AddStringAttachment($mailfile, $data["filename"] );
        }


        if ( $data["filename"] && $data["filepath"] ) {
            $this->AddStringAttachment( $data["filepath"], $data["filename"] );
        }

        $result = parent::send();

        $this->ClearAddresses();
        $this->ClearAttachments();
        if (file_exists($mailfile)){
            @unlink($mailfile);
        }
        
        return $result;

    }
    
    public function htmlToPlainText($str){
        $str = str_replace('&nbsp;', ' ', $str);
        $str = html_entity_decode($str, ENT_QUOTES | ENT_COMPAT , 'UTF-8');
        $str = html_entity_decode($str, ENT_HTML5, 'UTF-8');
        $str = html_entity_decode($str);
        $str = htmlspecialchars_decode($str);
        $str = strip_tags($str);

        return $str;
    }
}
