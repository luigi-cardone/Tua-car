<?php

namespace Maco;

use Delight\Auth;
use Blade\BladeOne;
use Maco\User;

class Searches {
    
    public static function mainFunc($db){
        
        $auth = new \Delight\Auth\Auth($db);
        if ($auth->check())
        {
            if ($auth->isNormal()) {
                
                $userData = User::getUserData($db, $auth);
                $location = new \Location($db);
                
                $data = array(
                              'isLoggedIn' => $auth->isLoggedIn(),
                              'email' => $auth->getEmail(),
                              'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                              'title' => "Storico ricerche effetuate",
                              'user' => $userData,
                              'searches' => Searches::getSearches($db, $auth->getUserId()),
                              'totalRecords' => Searches::getTotalSearches($db, $auth->getUserId()),
                              'db' => $db,
                             );

                $template = new \Eftec\Bladeone\BladeOne();

                if($auth->hasAnyRole(
                                    \Delight\Auth\Role::USER,
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('Admin.history', $data);
                }

/*                 if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    // echo 'The user is an admin -> 2. go to admin dashboard';
                    $data['isAdmin'] = true;
                    echo $template->run('Admin.history', $data);
                }
                if ($auth->hasRole(\Delight\Auth\Role::USER)) {
                    echo 'The user is an user -> go to user dashboard';
                } */
                if(empty($auth->getRoles())){
                    //$data = array();
                    echo $template->run('shared.userNotActive', $data);
                }
            }


        }
        
    }
    
    public static function getUserSearches($db, $userId){
        $auth = new \Delight\Auth\Auth($db);
        $userData = User::getUserData($db, $auth);
        $userDataL = User::getUserDataById($db, $userId);
        // print_r($userDataL);
                $data = array(
                              'isLoggedIn' => $auth->isLoggedIn(),
                              'email' => $auth->getEmail(),
                              'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                              'title' => "Storico ricerche effetuate per ".$userDataL['name'],
                              'user' => $userData,
                              'searches' => Searches::getSearches($db, $userId),
                              'totalRecords' => Searches::getTotalSearches($db, $userId),
                              'db' => $db,
                             );

                $template = new \Eftec\Bladeone\BladeOne();

                if($auth->hasAnyRole(
                                    \Delight\Auth\Role::USER,
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('Admin.history', $data);
                }

    }
    
    
    public static function getSearches($db, $userId = 0){
        
        // $limit = isset($_SESSION['records-limit']) ? $_SESSION['records-limit'] : 20;
        $limit = 5;
        // Current pagination page number
        $page = (isset($_GET['page']) && is_numeric($_GET['page']) ) ? $_GET['page'] : 1;
        // Offset
        $paginationStart = ($page - 1) * $limit;
        
        
        
        $query = "select * from searches where user_id = '".$userId."' order by search_date desc limit $paginationStart, $limit";
        
        $q = $db->query($query);
        return $q->fetchAll();
    }
    
    public static function getTotalSearches ($db, $userId = 0){
        $sql = $db->query("SELECT count(search_id) as id from searches where user_id = '".$userId."'")->fetchAll();
        $allRecrods = $sql[0]['id'];
        return $allRecrods;
    }
    
    public static function searchesToHuman($db, $userId = 0, $options){
        
        $search_options = json_decode($search['search_options'], true);
        
        foreach ($search_options as $options){
            $platform = $search->getPlatform($options['platform']);
            $optionsText .= "<br /><b>Piattaforma: ".$platform['platformName']."</b><br />";
            $towns = array();
            foreach($options['towns'] as $cap){
                $town = $location->fromCap($cap);
                foreach ($town as $k => $v){
                    $towns[] = $v['comune'];
                }
            }
            $optionsText .= "Localit&agrave;: ". (implode(", ", $towns))."<br />";
            $p_anno = " - Anno da ".((!empty($options['yearFrom']))?$options['yearFrom']:"qualsiasi")." a ".((!empty($options['yearTo']))?$options['yearTo']:"qualsiasi");
            $p_km = " - Km da ".((!empty($options['mileageFrom']))?$options['mileageFrom']:"qualsiasi")." a ".((!empty($options['mileageTo']))?$options['mileageTo']:"qualsiasi");
            $optionsText .= "Parametri:<br />$p_anno<br />$p_km<br /><br />";
        }
        
        return $optionsText;
    }
    
    public static function downloadSearch($db, $searchId){
        $query = "select search_filename, search_path from searches where search_id='".(int)$searchId."'";
        $q = $db->query($query);
        $r = $q->fetch();
        
        if(!empty($r['search_path'])){
            $r["search_path"] = str_replace("../","",$r["search_path"]);
            // print_r($r);
            if(file_exists($r['search_path'])){
                //Define header information
                header('Content-Description: File Transfer');
                header('Content-Type: application/octet-stream');
                header("Cache-Control: no-cache, must-revalidate");
                header("Expires: 0");
                header('Content-Disposition: attachment; filename="'.basename($r['search_path']).'"');
                header('Content-Length: ' . filesize($r['search_path']));
                header('Pragma: public');

                //Clear system output buffer
                //flush();

                //Read the size of the file
                readfile($r['search_path']);

                //Terminate from the script
                // die();                
            } else {
                echo "File non trovato";
            }
        } else {
            echo "Nessun risultato.";
        }
        
    }

    
}