<?php

// Define a global basepath
require_once("webconfig.php"); //main_vars


define('BASEPATH','/tuacar2');
define('TEMPLATESPATH','./tuacar2/views');

require_once("functions.php");

//        error_log(" - blade->locateTemplate($path) - ");



require_once("adodb5/adodb.inc.php"); // Database layer
require_once("Auth/vendor/autoload.php"); // Authentication class
require_once("Blade/BladeOne.php"); // Templating class
require_once("PHPMailer/autoload.php"); // PHPMail class
require_once("Maco/autoload.php"); // Custom classes

require_once("Shared/Spoki.php"); // Spoki API Class
require_once("Shared/Location.php"); // Geo Location Class
require_once("Shared/Search.php"); // Search Class
require_once("Shared/TuacarMailer.php"); // Mailer configured Class
require_once("Shared/Tasks.php"); // Scheduled tasks Class

// Include router class
//require_once("Route.php");
require_once("Delight/autoload.php"); // Routing class
require_once("routes.php"); // routing data


//require_once("template.inc.php"); //main_vars
