<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php'; // Ensure this establishes a proper database connection

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: DELETE, OPTIONS');
    header('Access-Control-Max-Age: 86400'); // Cache preflight response for 1 day
    http_response_code(200);
    exit(0); // Exit early for OPTIONS requests
}

header('Content-Type: application/json'); // Set the content type to JSON

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

    // Check if 'id' is provided in the query string
    if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
        send_json_error_response(['error' => 'ID parameter is required and must be a valid number.'], 400);
        exit();
    }

    // Retrieve the 'id' from the query string
    $id = (int)$_GET['id'];

    // Prepare the SQL query to delete the radio show
    $query = "DELETE FROM RadioShows WHERE id = ?";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
        exit();
    }

    // Bind the parameter and execute the query
    $stmt->bind_param('i', $id);
    if (!$stmt->execute()) {
        send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
        exit();
    }

    // Check if any rows were affected (meaning the show was deleted)
    if ($stmt->affected_rows === 0) {
        send_json_error_response(['error' => 'No radio show found with the provided ID.'], 404);
        exit();
    }

    // Return a success response
    echo json_encode(['success' => true, 'message' => 'Radio show deleted successfully.']);

    // Clean up
    $stmt->close();
    $mysqli->close();

} catch (Exception $e) {
    // Handle any unexpected errors
    send_json_error_response(['Unexpected error: ' . $e->getMessage()], 500);
}