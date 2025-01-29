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
    exit(0);
}

header('Content-Type: application/json');

// Check for authentication
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    send_error_response(['error' => 'Authorization token is required.'], 401);
    exit();
}

$authToken = $_SERVER['HTTP_AUTHORIZATION'];

// Validate auth token
if (!validate_auth_token($authToken)) {
    send_error_response(['error' => 'Invalid or expired authorization token.'], 403);
    exit();
}

// Check if a file was uploaded
if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
    send_error_response(['error' => 'No file uploaded or file upload error.'], 400);
    exit();
}

// Get uploaded file details
$fileTmpPath = $_FILES['csv_file']['tmp_name'];
$fileType = mime_content_type($fileTmpPath);

// Validate file type (should be CSV)
if ($fileType !== 'text/plain' && $fileType !== 'text/csv' && $fileType !== 'application/vnd.ms-excel') {
    send_error_response(['error' => 'Invalid file type. Only CSV files are allowed.'], 400);
    exit();
}

// Open and read the CSV file
if (($handle = fopen($fileTmpPath, 'r')) === false) {
    send_error_response(['error' => 'Failed to open uploaded CSV file.'], 500);
    exit();
}

// Read the first row as headers
$headers = fgetcsv($handle, 1000, ",");

// Validate headers
$expectedHeaders = ['title', 'description', 'hosts'];
if (!$headers || array_map('strtolower', $headers) !== $expectedHeaders) {
    send_error_response(['error' => 'CSV file must have the correct column headers: title, description, hosts.'], 400);
    exit();
}

// Prepare to store parsed data
$shows = [];
$rowNumber = 1; // Start counting from row 1 (since headers were read)

while (($data = fgetcsv($handle, 1000, ",")) !== false) {
    $rowNumber++;

    // Skip empty rows
    if (empty($data) || count($data) < 3) {
        continue;
    }

    $showName = trim($data[0]);
    $showDetails = trim($data[1]);
    $showHosts = trim($data[2]);

    // Validate required fields
    if (empty($showName)) {
        send_error_response(["error" => "Invalid data in row $rowNumber. Missing required fields."], 400);
        exit();
    }

    $shows[] = [$showName, $showDetails, $showHosts];
}

fclose($handle);

// If no valid records found
if (empty($shows)) {
    send_error_response(['error' => 'CSV file contains no valid data.'], 400);
    exit();
}

// Start a transaction
$mysqli->begin_transaction();

try {
    $query = "INSERT INTO RadioShows (title, description, hosts) VALUES (?, ?, ?)";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        throw new Exception('Prepare failed: ' . $mysqli->error);
    }

    foreach ($shows as $show) {
        [$name, $details, $hosts] = $show;
        $stmt->bind_param('sss', $name, $details, $hosts);

        if (!$stmt->execute()) {
            throw new Exception('Execute failed: ' . $stmt->error);
        }
    }

    // Commit the transaction
    $mysqli->commit();
    $stmt->close();
    $mysqli->close();

    // Success response
    echo json_encode(['success' => true, 'message' => 'CSV data inserted successfully.']);
} catch (Exception $e) {
    // Rollback if there's an error
    $mysqli->rollback();
    send_error_response(['error' => 'Database error: ' . $e->getMessage()], 500);
}