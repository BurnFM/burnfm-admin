<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400'); // Cache preflight response for 1 day
    http_response_code(200);
    exit(0); // Exit early for OPTIONS requests
}

header('Content-Type: application/json');

try {
    // Check if Authorization header is present
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        send_json_error_response(['error' => 'Authorization token is required.'], 401);
        exit();
    }

    // Get the token from the Authorization header
    $authToken = $_SERVER['HTTP_AUTHORIZATION'];

    // Validate the authorization token (you can implement token validation logic as needed)
    if (!validate_auth_token($authToken)) {
        send_json_error_response(['error' => 'Invalid or expired authorization token.'], 403);
        exit();
    }

    // Get the raw POST data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data) {
        send_json_error_response(['error' => 'Invalid JSON format.'], 400);
        exit();
    }

    // Validate required fields in the posted data
    if (!isset($data['defaultShow']['enabled']) || !isset($data['offAirMode']['enabled'])) {
        send_json_error_response(['error' => 'Missing required fields.'], 400);
        exit();
    }

    // Extract values from the input JSON
    $default_show_enabled = $data['defaultShow']['enabled'] ? 1 : 0;
    $default_show = $data['defaultShow']['show'] ?? null; // Optional
    $off_air_mode_enabled = $data['offAirMode']['enabled'] ? 1 : 0;
    $off_air_show = $data['offAirMode']['show'] ?? null; // Optional

    // Prepare the update statement
    $updateQuery = "UPDATE Settings SET default_show_enabled = ?, default_show = ?, off_air_mode_enabled = ?, off_air_show = ?";
    $updateStmt = $mysqli->prepare($updateQuery);

    if (!$updateStmt) {
        send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
        exit();
    }

    // Bind the parameters to the update statement
    $updateStmt->bind_param('iiii', $default_show_enabled, $default_show, $off_air_mode_enabled, $off_air_show);

    // Execute the update statement
    if (!$updateStmt->execute()) {
        send_json_error_response(['error' => 'Update failed: (' . $updateStmt->errno . ') ' . htmlspecialchars($updateStmt->error)], 500);
        exit();
    }

    // Send success response
    $response = [
        'defaultShow' => [
            'enabled' => (bool)$default_show_enabled,
            'show' => $default_show,
        ],
        'offAirMode' => [
            'enabled' => (bool)$off_air_mode_enabled,
            'show' => $off_air_show,
        ],
    ];

    echo json_encode($response);

    // Clean up
    $updateStmt->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}