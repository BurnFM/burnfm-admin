<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

// To generate a JWT token:
$payload = [
    'iss' => 'your-app',
    'sub' => $userId,
    'iat' => time(),
    'exp' => time() + 3600 // Token expires in 1 hour
];
$jwt = JWT::encode($payload, $secretKey, 'HS256');

// To decode a JWT token:
try {
    $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
} catch (Exception $e) {
    // Token is invalid
}