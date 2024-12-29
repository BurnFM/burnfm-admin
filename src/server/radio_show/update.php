<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php'; // Ensure this establishes a proper database connection

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

    // Ensure the 'id' query parameter is present
    $id = $_GET['id'] ?? null;
    if (empty($id)) {
        send_json_error_response(['error' => 'Missing required query parameter: id'], 400);
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

    // Prevent invalid data types
    if (!empty($title) && !is_string($title) ||
        !empty($description) && !is_string($description) ||
        !empty($hosts) && !is_string($hosts) ||
        !empty($photo) && !is_string($photo)) {
        send_json_error_response(['error' => 'Invalid data passed'], 400);
        exit();
    }

    // Build the SQL query dynamically to include only updated fields
    $fieldsToUpdate = [];
    $values = [];

    if ($title !== null) {
        $fieldsToUpdate[] = "title = ?";
        $values[] = $title;
    }
    if ($description !== null) {
        $fieldsToUpdate[] = "description = ?";
        $values[] = $description;
    }
    if ($hosts !== null) {
        $fieldsToUpdate[] = "hosts = ?";
        $values[] = $hosts;
    }
    if ($photo !== null) {
        $fieldsToUpdate[] = "photo = ?";
        $values[] = $photo;
    }

    if (empty($fieldsToUpdate)) {
        send_json_error_response(['error' => 'No valid fields to update provided.'], 400);
        exit();
    }

    // Add the id for the WHERE clause
    $values[] = $id;

    // Prepare the SQL query
    $query = "UPDATE RadioShows SET " . implode(', ', $fieldsToUpdate) . " WHERE id = ?";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
        exit();
    }

    // Dynamically bind parameters
    $paramTypes = str_repeat('s', count($values) - 1) . 'i'; // 's' for strings, 'i' for id
    $stmt->bind_param($paramTypes, ...$values);

    if (!$stmt->execute()) {
        send_json_error_response(['error' => 'Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
        exit();
    }

    // Check if the row was updated
    if ($stmt->affected_rows === 0) {
        send_json_error_response(['error' => 'No rows updated. The id may not exist.'], 404);
        exit();
    }

    // Respond with success
    echo json_encode(['success' => true, 'updated_id' => $id]);

    // Clean up
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}