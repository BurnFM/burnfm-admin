<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

$rootPath = $_SERVER['DOCUMENT_ROOT']; // This is the root directory of the web server

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

header('Content-Type: application/json'); // JSON response type

try {
    // Check if Authorization header is present
    if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
        send_error_response(['error' => 'Authorization token is required.'], 401);
        exit();
    }

    // Get the token from the Authorization header
    $authToken = $_SERVER['HTTP_AUTHORIZATION'];

    // Validate the authorization token
    if (!validate_auth_token($authToken)) {
        send_error_response(['error' => 'Invalid or expired authorization token.'], 403);
        exit();
    }

    // Check for POST method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        send_error_response(['error' => 'Invalid request method.'], 405);
        exit();
    }

    // Check if a file was uploaded
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        send_error_response(['error' => 'File upload failed.'], 400);
        exit();
    }

    // Validate and sanitize input fields (e.g., radio_show_id and recording_date)
    $radio_show_id = isset($_POST['radio_show_id']) ? (int) $_POST['radio_show_id'] : null;
    $recording_date = isset($_POST['recorded_at']) ? $mysqli->real_escape_string($_POST['recorded_at']) : null;

    if (!$radio_show_id || !$recording_date) {
        send_error_response(['error' => 'Missing required fields: radio_show_id or recorded_at.'], 400);
        exit();
    }

    // Begin a database transaction
    $mysqli->begin_transaction();

    try {
        // Step 1: Check if the given radio_show_id exists
        $checkQuery = "SELECT COUNT(*) AS count FROM RadioShows WHERE id = ?";
        $checkStmt = $mysqli->prepare($checkQuery);

        if (!$checkStmt) {
            throw new Exception('Prepare failed: ' . $mysqli->error);
        }

        $checkStmt->bind_param('i', $radio_show_id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();

        if ($row['count'] == 0) {
            throw new Exception('Invalid radio_show_id: No matching record found.');
        }

        $checkStmt->close();

        // Save the uploaded file to the server
        $relDir = 'uploads/recordings/';
        $uploadDir = $rootPath . $relDir; // Specify the subdirectory for uploads
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true); // Create the uploads directory if it doesn't exist
        }

        $fileName = uniqid() . '-' .basename($_FILES['file']['name']);
        $filePath = $uploadDir . $fileName; // Add a unique prefix to prevent collisions

        if (!move_uploaded_file($_FILES['file']['tmp_name'], $filePath)) {
            send_error_response(['error' => 'Failed to save uploaded file.'], 500);
            exit();
        }

        // Step 2: Insert the file metadata into the database
        $query = "INSERT INTO Recordings (radio_show_id, recording, recorded_at) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            throw new Exception('Prepare failed: ' . $mysqli->error);
        }

        $filePathDB = $relDir . $fileName;

        $stmt->bind_param('iss', $radio_show_id, $filePathDB, $recording_date);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }

        $recordingId = $stmt->insert_id;

        // Step 3: Commit the transaction
        $mysqli->commit();

        // Respond with the newly created recording ID
        echo json_encode(['id' => $recordingId, 'file_path' => $filePath]);

        // Cleanup
        $stmt->close();

    } catch (Exception $transactionException) {
        // Rollback the transaction on error
        $mysqli->rollback();
        send_error_response(['error' => $transactionException->getMessage()], 500);
    }

    // Close the database connection
    $mysqli->close();

} catch (Exception $e) {
    // Handle unexpected errors
    send_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}