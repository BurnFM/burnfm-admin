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

header('Content-Type: application/json');  // Set the content type to JSON

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

    // Parse the input JSON body
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['name'])) {
        send_json_error_response(['error' => 'Invalid or missing input parameters.'], 400);
        exit();
    }

    // Extract the input parameters
    $name = $mysqli->real_escape_string($input['name']);
    $startDate = isset($input['start_date']) ? $mysqli->real_escape_string($input['start_date']) : null;
    $endDate = isset($input['end_date']) ? $mysqli->real_escape_string($input['end_date']) : null;
    $entries = $input['entries'] ?? [];

    // Check if both start_date and end_date are provided and validate that start_date < end_date
    if ($startDate && $endDate) {
        // Convert the dates to DateTime objects for comparison
        $startDateObj = DateTime::createFromFormat('Y-m-d', $startDate);
        $endDateObj = DateTime::createFromFormat('Y-m-d', $endDate);

        if ($startDateObj >= $endDateObj) {
            send_json_error_response(['error' => 'start_date must be earlier than end_date.'], 400);
            exit();
        }
    }

    // Start a transaction
    $mysqli->begin_transaction();

    try {
        // Insert the main schedule details
        $query = "INSERT INTO Schedules (name, start_date, end_date) VALUES (?, ?, ?)";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        $stmt->bind_param('sss', $name, $startDate, $endDate);

        if (!$stmt->execute()) {
            send_json_error_response(['error' => 'Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
            exit();
        }

        // Insert schedule entries
        $insertEntryQuery = "
            INSERT INTO ScheduleEntries (schedule_id, day, start_time, end_time, radio_show_id)
            VALUES (?, ?, ?, ?, ?)
        ";
        $insertStmt = $mysqli->prepare($insertEntryQuery);

        if (!$insertStmt) {
            throw new Exception('Prepare failed: ' . $mysqli->error);
        }

        foreach ($entries as $entry) {
            if (!isset($entry['day'], $entry['start_time'], $entry['end_time'], $entry['id'])) {
                throw new Exception('Invalid entry structure.');
            }

            $day = $mysqli->real_escape_string($entry['day']);
            $startTime = $mysqli->real_escape_string($entry['start_time']);
            $endTime = $mysqli->real_escape_string($entry['end_time']);
            $radioShowId = (int) $entry['id'];

            $insertStmt->bind_param('isssi', $scheduleId, $day, $startTime, $endTime, $radioShowId);

            if (!$insertStmt->execute()) {
                throw new Exception('Execute failed for entry: ' . $insertStmt->error);
            }
        }

        // Commit the transaction
        $mysqli->commit();

        // Respond with the newly created schedule ID
        $newId = $stmt->insert_id;
        echo json_encode(['id' => $newId]);

        $insertStmt->close();

    } catch (Exception $transactionException) {
        // Roll back the transaction on failure
        $mysqli->rollback();
        send_json_error_response(['error' => $transactionException->getMessage()], 500);
    }

    // Clean up
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}