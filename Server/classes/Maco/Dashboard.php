<?php

namespace Maco;

use Delight\Auth;
use Blade\BladeOne;
use Maco\User;

class Dashboard {
    
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
                              'auth' => $auth->getRoles(),
                              'location' => $location,
                             );
                
                if($auth->hasAnyRole(
                                    \Delight\Auth\Role::USER,
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('Admin.dashboard', $data);
                }
                
                /* if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    // echo 'The user is an admin -> 2. go to admin dashboard';
                    $data['isAdmin'] = true;
                    echo $template->run('Admin.dashboard', $data);
                }
                if ($auth->hasRole(\Delight\Auth\Role::USER)) {
                    echo 'The user is an user -> go to user dashboard';
                } */
                if(empty($auth->getRoles())){
                    //$data = array();
                    echo $template->run('shared.userNotActive', $data);
                }
            }
            
            
/*             
            if ($auth->isNormal()) {
                //echo 'User is in default state ';
                if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
                    echo 'The user is an admin -> 1. go to admin dashboard';
                    $data = array(
                                  'isLoggedIn' => $auth->isLoggedIn(),
                                  'email' => $auth->getEmail(),
                                  'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                                  'user' => $userData,
                                 );
                    echo $template->run('Admin.dashboard', $data);
                }
                if ($auth->hasRole(\Delight\Auth\Role::USER)) {
                    echo 'The user is an user -> go to user dashboard';
                }
            } */
            
            // User is not activated
            if ($auth->isArchived()) {
                // Show 
                echo "utente non attivo";
            }
            
        }
        else
        {
            // Show Login page
            return User::loginForm();
            
        }
    }
}
