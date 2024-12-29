<?php

function send_json_error_response(array $errors, int $response_code)
{
    http_response_code($response_code);
    echo json_encode(['errors' => $errors]);
    exit;
}

function check_not_empty(...$vars)
{
    foreach ($vars as $var)
    {
        if (!isset($var) || empty($var))
        {
            return false;
        }
    }
    return true;
}

function empty_to_null($value)
{
    return $value === "" ? null : $value;
}

function validate_auth_token($token)
{
    // Example: Check if the token matches a predefined value or query a DB
    $validToken = "";

    return $token === $validToken;
}
