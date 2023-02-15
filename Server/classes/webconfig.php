<?php
//"charset=utf8mb4"
$db = new \PDO("mysql:host=localhost;dbname=tuacardb", "tuacarusr", "Ck#v00b3");


# defined constants::

define ('HOSTNAME','https://leads.tua-car.it/');
define ('BASE_PATH','/');

define ('DUPLICATES_PATH', '../webfiles/duplicates/');
define ('EXPORTS_PATH', '../webfiles/exports/');

//mail send configs
define ('MAIL_FROM', "leads@tua-car.it");

// Api Key for Spoki services
define('SPOKI_API_KEY', "292a818e77b4452297a176d0d757e63c");