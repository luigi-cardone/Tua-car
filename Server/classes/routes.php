<?php

require_once("autoload.php");

use Maco\User;

$router = new \Delight\Router\Router();

//print_r($router);

$router->get('/', function() use ($db) {
    // echo "main";
    require_once("classes/Maco/Homepage.php");
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db);
    // return User::loginForm();
});


$router->get('/dashboard',  function() use ($db) {
    require_once("classes/Maco/Dashboard.php");

    $dash = new \Maco\Dashboard;
    $dash::mainFunc($db);
});

$router->get('/history',  function() use ($db) {
    require_once("classes/Maco/Searches.php");

    $dash = new \Maco\Searches;
    $dash::mainFunc($db);
});

$router->get('/user-history/:id',  function($userId) use ($db) {
    require_once("classes/Maco/Searches.php");

    $dash = new \Maco\Searches;
    $dash::getUserSearches($db, $userId);
});

$router->get('/user-config-area/:id',  function($userId) use ($db) {
    require_once("classes/Maco/Searches.php");

    $dash = new \Maco\User;
    $dash::userAreas($db, $userId);
});

$router->get('/download/:id',  function($searchId) use ($db) {
    require_once("classes/Maco/Searches.php");

    $dash = new \Maco\Searches;
    $dash::downloadSearch($db, $searchId);
});

$router->get('/asd',  function() use ($db) {
    require_once("classes/Maco/Homepage.php");
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db);
});

$router->get('/login',  function() use ($db) {
    require_once("classes/Maco/Homepage.php");
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db);
});

$router->post('/login',  function() use ($db) {
    /* require_once("classes/Maco/Homepage.php");
    require_once("Maco/autoload.php");
           // print_r($_POST);

    $d = User::loginVerify($db);
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db);
    
    echo $d;
    return $d; */
});

$router->get('/register',  function() use ($db) {
    return User::registerForm();
});
$router->post('/register',  function() use ($db) {
    return User::registerVerify();
});
$router->any([ 'POST', 'GET' ],'/confirmRegistration',  function() use ($db) {
    return User::confirmEmail();
});

$router->get('/logout',  function() use ($db) {
    User::logout($db);
    require_once("classes/Maco/Homepage.php");
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db);
});

$router->get('/user',  function() use ($db) {
    return User::userProfile($db);
    /* User::logout($db);
    require_once("classes/Maco/Homepage.php");
    $homepage = new \Maco\Homepage;
    $homepage::byUserStatus($db); */
});


$router->get('/franchise', function() use ($db){
    require_once("classes/Maco/Admin.php");
    $admin = new Maco\Admin;
    return $admin::mainFunc($db);
});

$router->get('/franchise/edit/:id', function($clientId) use ($db){

    require_once("classes/Maco/Admin.php");
    $admin = new Maco\Admin;
    return $admin::editUser($db, $clientId);
});

