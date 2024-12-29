<?php

// Database credentials - LEAVE EMPTY
$host = '';
$db = '';
$user = '';
$pass = '';

// Create a connection
$mysqli = new mysqli($host, $user, $pass, $db);

if ($mysqli->connect_error)
{
    http_response_code(500); // Server Error
    die('Connect Error (' . $mysqli->connect_errno . ') '
        . htmlspecialchars($mysqli->connect_error));
}

// Database config
if (!$mysqli->set_charset('utf8mb4'))
{
    http_response_code(500); // Server Error
    die('Error loading character set utf8mb4: ' . htmlspecialchars($mysqli->error));
}

$mysqli->query("SET time_zone = '+00:00'");