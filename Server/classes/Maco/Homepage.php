<?php

namespace Maco;

use Delight\Auth;
use Blade\BladeOne;
use Maco\User;

class Homepage {
    
    public static function byUserStatus($db)
    {
        $auth = new \Delight\Auth\Auth($db);
        // check user status and roles
        if ($auth->check())
        {
            $template = new \Eftec\Bladeone\BladeOne();
            /*
            // DEBUG ONLY!!!
            print_r($auth);
            if ($auth->isNormal()) {
                echo 'User is in default state';
            }

            if ($auth->isArchived()) {
                echo 'User has been archived';
            }

            if ($auth->isBanned()) {
                echo 'User has been banned';
            }

            if ($auth->isLocked()) {
                echo 'User has been locked';
            }

            if ($auth->isPendingReview()) {
                echo 'User is pending review';
            }

            if ($auth->isSuspended()) {
                echo 'User has been suspended';
            }
            echo " roles:: ". print_r($auth->getRoles(), true); */
            
            
            // User is active
            if ($auth->isNormal()) {
                
                $userData = User::getUserData($db, $auth);
                $userTasks = User::getUserActiveTasks($db, $auth);
                $location = new \Location($db);
                
                $data = array(
                              'isLoggedIn' => $auth->isLoggedIn(),
                              'isAdmin' => $auth->hasRole(\Delight\Auth\Role::ADMIN),
                              'email' => $auth->getEmail(),
                              'user' => $userData,
                              'userTasks' => $userTasks,
                              'auth' => $auth->getRoles(),
                              'location' => $location,
                              'db' => $db,
                             );
                if($auth->hasAnyRole(
                                    \Delight\Auth\Role::USER,
                                    \Delight\Auth\Role::ADMIN,
                                    \Delight\Auth\Role::SUPER_ADMIN,
                                    )){
                    echo $template->run('Admin.dashboard', $data);
                }
/* 
                if ($auth->hasRole(\Delight\Auth\Role::ADMIN)) {
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
            
            // User is not activated
            if ($auth->isArchived()) {
                // Show not active user warning
                $data = array();
                echo $template->run('shared.userNotActive', $data);
            }
            
        }
        else
        {
            // Show Login page
            return User::loginForm();
            
        }
    }
}
