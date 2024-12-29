<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json'); // Set the content type to JSON

try {
    // Check if the 'id' parameter is present in the query string
    if (isset($_GET['id'])) {

        if (!is_numeric($_GET['id'])) {
            send_json_error_response(['Invalid id given as query parameter'] , 500);
            exit();
        }

        // Get the 'id' from the query string
        $id = (int) $_GET['id'];

        // Prepare the SQL query to fetch the specific radio show
        $query = "SELECT * FROM RadioShows WHERE id = ?";
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

        $result = $stmt->get_result();

        // Check if the specific radio show exists
        if ($result->num_rows === 0) {
            send_json_error_response(['No radio show found with the provided ID'], 404);
            exit();
        }

        $row = $result->fetch_assoc();

        // Return the specific radio show as JSON
        echo json_encode([
            'show' => [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => empty_to_null($row['description']),
                'photo' => empty_to_null($row['photo']),
                'hosts' => empty_to_null($row['hosts'])
            ]
        ]);

    } else {
        // If no 'id' is provided, fetch all radio shows
        $query = "SELECT * FROM RadioShows";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        // Execute the query to fetch all shows
        if (!$stmt->execute()) {
            send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
            exit();
        }

        $result = $stmt->get_result();

        // Fetch all rows
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => empty_to_null($row['description']),
                'photo' => empty_to_null($row['photo']),
                'hosts' => empty_to_null($row['hosts'])
            ];
        }

        // Return all radio shows as JSON
        echo json_encode(['shows' => $rows]);
    }

    // Clean up
    $stmt->close();
    $mysqli->close();

} catch (Exception $e) {
    // Handle any unexpected errors
    send_json_error_response(['Unexpected error: ' . $e->getMessage()], 500);
}