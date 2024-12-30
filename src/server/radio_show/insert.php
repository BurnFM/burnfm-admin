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

header('Content-Type: multipart/form-data');

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

    // Check if form_data is provided in body
    if (empty($_POST)) {
        send_json_error_response(['No data supplied.'], 400);
    }

    // Validate input from FormData (use $_POST for text fields, $_FILES for files)
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;
    $hosts = $_POST['hosts'] ?? null;
    $photo = $_POST['photo'] ?? null; // If 'photo' is uploaded, it will be in $_FILES['photo']


    if (empty($title)) {
        send_json_error_response(['error' => 'Missing required field: title'], 400);
        exit();
    }

    // Prevent invalid data types (if needed)
    if (!empty($title) && !is_string($title) ||
        !empty($description) && !is_string($description) ||
        !empty($hosts) && !is_string($hosts) ||
        !empty($photo) && !is_string($photo)) {
        send_json_error_response(['error' => 'Invalid data passed'], 400);
        exit();
    }

    // Insert the radio show into the database
    $query = "INSERT INTO RadioShows (title, description, hosts, photo) VALUES (?, ?, ?, ?)";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
        exit();
    }

    $stmt->bind_param('ssss', $title, $description, $hosts, $photo);

    if (!$stmt->execute()) {
        send_json_error_response(['error' => 'Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
        exit();
    }

    // Respond with the newly created show ID
    $newId = $stmt->insert_id;
    echo json_encode(['id' => $newId]);

    // Clean up
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}