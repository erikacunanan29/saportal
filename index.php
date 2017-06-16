<?php
require('app/lib/base.php');

$f3 = Base::instance();

if(gethostname() == 'commit-Veriton-X2611G') //if in local server, load server configuration
	$f3->config('app/config-server.ini'); 	
else 											
	$f3->config('app/config.ini');

$f3->config('app/routes.ini');
$f3->run();

?>