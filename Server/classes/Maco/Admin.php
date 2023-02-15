<?php
namespace Maco;


use Delight\Auth;
use Blade\BladeOne;

class Admin {
    
    public static function mainFunc($db)
    {
        $auth = new \Delight\Auth\Auth($db);
        if ($auth->check())
        {
            // check user status and roles
            
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
                              'users' => Admin::getUsers($db),
                              'totalRecords' => Admin::getTotalUsers($db),
                              'auth' => $auth->getRoles(),
                              'location' => $location,
                              'db' => $db,
                             );

                if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    // echo 'The user is an admin -> 2. go to admin dashboard';
                    echo $template->run('Admin.listUsers', $data);
                } else {
                    echo "403. Forbidden";
                }
            }
            
            
        }
        else
        {
            // Show Login page
            return User::loginForm();
            
        }
    }
    
    public static function getUsers($db){
        $limit = 10;
        // Current pagination page number
        $page = (isset($_GET['page']) && is_numeric($_GET['page']) ) ? $_GET['page'] : 1;
        // Offset
        $paginationStart = ($page - 1) * $limit;
        
        
        
        $query = "select u.*, ud.* from users u, users_data ud where u.id = ud.user_id order by u.id desc limit $paginationStart, $limit";
        
        $q = $db->query($query);
        return $q->fetchAll();
    }
    
    public static function getTotalUsers ($db, $userId = 0){
        $sql = $db->query("SELECT count(id) as id from users")->fetchAll();
        $allRecrods = $sql[0]['id'];
        return $allRecrods;
    }
    
    public static function editUser($db, $clientId){
        
        $auth = new \Delight\Auth\Auth($db);
        if ($auth->check())
        {
            if($clientId < 1) {
                return "client Id error!!!";
            }
            
            
            $template = new \Eftec\Bladeone\BladeOne();
            $userData = Admin::getClientData($db, $clientId);
            $location = new \Location($db);
            
            $loginData = Admin::getClientLogin($db, $clientId);
            
            
            $data = array(
                          'isLoggedIn' => $auth->isLoggedIn(),
                          'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                          'email' => $loginData['email'],
                          'user' => $userData,
                          'auth' => $auth->getRoles(),
                          'location' => $location,
                         );

            if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                // echo 'The user is an admin -> 2. go to admin dashboard';
                //$data['isAdmin'] = true;
                echo $template->run('forms.userProfile', $data);
            } else {
                echo "403. Forbidden";
            }

        }
    }
    
    
    
    public static function getClientData($db, $clientId){
        $q = $db->query("select * from users_data where user_id='".$clientId."'");
        return $q->fetch();
    }
    
    public static function getClientTasks($db, $clientId){
        $q = $db->query("select * from scheduled_tasks where user_id='".$clientId."'");
        return $q->fetchAll();
    }
    
    public static function getClientActiveTasks($db, $clientId){
        $q = $db->query("select * from scheduled_tasks where user_id='".$clientId."' and schedule_active = '1'");
        return $q->fetchAll();
    }
    
    public static function getClientLogin($db, $clientId){
        $q = $db->query("select * from users where id='".$clientId."'");
        return $q->fetch();
    }
    
    
    
}