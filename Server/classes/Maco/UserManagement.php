<?php

namespace Maco;


use Delight\Auth;
use Blade\BladeOne;

class User {
    
/*     
    public static function loginRegisterForm(){
        $template = new \Eftec\Bladeone\BladeOne();
        echo $template->run('forms.login-register');
    }
     */
    public static function loginForm($data = array()){
        $template = new \Eftec\Bladeone\BladeOne();
        echo $template->run('forms.login', $data);
    }
    
    public static function registerForm($data = array()){
        $template = new \Eftec\Bladeone\BladeOne();
        echo $template->run('forms.register', $data);
    }
    
    public static function confirmEmail($data = array()){
        //require_once("/action/user_form.php");
        $template = new \Eftec\Bladeone\BladeOne();
        echo $template->run('forms.registerConfirm', $data);
    }
    
    public static function getUserData($db, $auth){
        $q = $db->query("select * from users_data where user_id='".$auth->id()."'");
        return $q->fetch();
    }
    
    public static function getUserDataById($db, $userId){
        $q = $db->query("select * from users_data where user_id='".(int)$userId."'");
        return $q->fetch();
    }
    public static function getUserAllDataById($db, $userId){
        $q = $db->query("select u.email, u.status, u.verified, u.roles_mask, ud.* from users u, users_data ud where user_id='".$userId."' and u.id = ud.user_id");
        return $q->fetch();
    }
    
    public static function getUserTasks($db, $auth){
        $q = $db->query("select * from scheduled_tasks where user_id='".$auth->id()."'");
        return $q->fetchAll();
    }
    
    public static function getUserActiveTasks($db, $auth){
        $q = $db->query("select * from scheduled_tasks where user_id='".$auth->id()."' and schedule_active = '1'");
        return $q->fetchAll();
    }
    
    public static function getUserSpoki($db, $userId){
        $q = $db->query("select * from users_data where user_id='".$userId."'");
        $r = $q->fetch();
        $spoki = array(
                       "IsSpokiEnabled" => $r['IsSpokiEnabled'],
                       "api_key" => "".$r['spoki_api'],
                       "secret" => "".$r['Secret'],
                       );
        
        return $spoki;
    }
    
    public static function setUserSpoki($db, $userId, $spokiData = array()){
        if(is_array($spokiData)){
            $spoki_api = json_encode($spokiData);
            $q = $db->prepare("update users_data set spoki_api = :spoki_api where user_id = :user_id");
            $q->execute([':spoki_api' => $spoki_api, ':user_id' => $userId]);
            $q = $db->query("update users_data set IsSpokiEnabled=true where user_id='".$userId."'");
			$q->execute([':user_id' => $userId]);
            return "update users_data set spoki_api='$spoki_api' where user_id='".$userId."'";
        }
        return $spoki_api;
    }
    
    public static function setUserConfig($db, $userId, $configData){
        
    }
    
    public static function getUserConfig($db, $userId){
        $q = $db->query("select * from users_searches_config where user_id='".$userId."'");
        return $q->fetchAll();
    }
    
    public static function logout($db){
        $auth = new \Delight\Auth\Auth($db);
        $auth->logOut();
    }
    
    
    public static function convertUserRoleToText($roleVal){
        if($roleVal === \Delight\Auth\Role::ADMIN){
            return "Admin";
        }
        if($roleVal === \Delight\Auth\Role::USER){
            return "Utente";
        }
        
        return "Non assegnato";
        
    }
    
    public static function convertUserStatusToText($statusVal){
        if($statusVal === \Delight\Auth\Status::NORMAL){
            return "Account attivo";
        }
        if($statusVal === \Delight\Auth\Status::ARCHIVED){
            return "Account archiviato";
        }
        if($statusVal === \Delight\Auth\Status::BANNED){
            return "Account bannato";
        }
        if($statusVal === \Delight\Auth\Status::LOCKED){
            return "Account bloccato";
        }
        if($statusVal === \Delight\Auth\Status::PENDING_REVIEW){
            return "Attesa revisione";
        }
        if($statusVal === \Delight\Auth\Status::SUSPENDED){
            return "Account Sospeso";
        }
        
        return "!!Fuori Range!!";// $statusVal ". \Delight\Auth\Status::NORMAL;
        // return $statusVal === \Delight\Auth\Status::PENDING_REVIEW;
    }
    
    public static function userProfile($db){
        $auth = new \Delight\Auth\Auth($db);
        if ($auth->check())
        {
            $template = new \Eftec\Bladeone\BladeOne();
            $userData = User::getUserData($db, $auth);
            
            // User is active
            if ($auth->isNormal()) {
                
                $userData = User::getUserData($db, $auth);
                $location = new \Location($db);
                
                $data = array(
                              'isLoggedIn' => $auth->isLoggedIn(),
                              'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                              'email' => $auth->getEmail(),
                              'user' => $userData,
                              'auth' => $auth->getRoles(),
                              'location' => $location,
                             );

                if($auth->hasAnyRole(
                                    \Delight\Auth\Role::USER,
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('forms.userProfile', $data);
                }

 /*                if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    // echo 'The user is an admin -> 2. go to admin dashboard';
                    //$data['isAdmin'] = true;
                    echo $template->run('forms.userProfile', $data);
                }
                if ($auth->hasRole(\Delight\Auth\Role::USER)) {
                    echo 'The user is an user -> go to user dashboard';
                } */
                if(empty($auth->getRoles())){
                    //$data = array();
                    echo $template->run('shared.userNotActive', $data);
                }
            }
            
            // User is not activated
            if ($auth->isArchived()) {
                // Show error page
            }
        } else {
            // Show Login page
            return User::loginForm();
        }
    }
    
    public static function userAreas($db, $userId){
        $auth = new \Delight\Auth\Auth($db);
        if ($auth->check())
        {
            $template = new \Eftec\Bladeone\BladeOne();
            
            // User is active
            if ($auth->isNormal()) {
                
                $userData = User::getUserData($db, $auth);
                $userDataL = User::getUserDataById($db, $userId);
                $location = new \Location($db);
                
                $data = array(
                              'isLoggedIn' => $auth->isLoggedIn(),
                              'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                              'email' => $auth->getEmail(),
                              'title' => "Configurazione ambito di ricerca per ".$userDataL['name'],
                              'user' => $userData,
                              'client' => $userDataL,
                              'auth' => $auth->getRoles(),
                              'location' => $location,
                             );

                if($auth->hasAnyRole(
                                   // \Delight\Auth\Role::USER, 
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('Admin.userConfigArea', $data);
                }

 /*                if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    // echo 'The user is an admin -> 2. go to admin dashboard';
                    //$data['isAdmin'] = true;
                    echo $template->run('forms.userProfile', $data);
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
    

}