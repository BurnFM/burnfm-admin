<?php

function send_json_error_response(array $errors, int $response_code)
{
    http_response_code($response_code);
    echo json_encode(['errors' => $errors]);
    exit;
}

/**
 * Send a success response as JSON.
 *
 * @param array $data The data to include in the response.
 */
function send_success_response(array $data = [])
{
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'data' => $data]);
    exit();
}

/**
 * Send an error response as JSON.
 *
 * @param array $data The error details.
 * @param int $httpCode The HTTP status code to set in the response.
 */
function send_error_response(array $data = [], int $httpCode = 400)
{
    header('Content-Type: application/json', true, $httpCode);
    echo json_encode(['success' => false, 'error' => $data]);
    exit();
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
