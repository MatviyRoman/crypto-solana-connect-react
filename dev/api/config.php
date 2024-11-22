<?php

if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    http_response_code(403);
    exit('Access denied');
}

$host = 'localhost';
$db = 'airdrop';
$user = 'airdrop';
$password = 'dfgyhjBVYU';