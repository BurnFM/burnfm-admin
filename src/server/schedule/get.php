<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');  // Set the content type to JSON

try {
    // Check if the 'id' parameter is present in the query string
    if (isset($_GET['id'])) {

        if (!is_numeric($_GET['id'])) {
            send_json_error_response(['Invalid id given as query parameter'] , 500);
            exit();
        }


        // Get the 'id' from the query string
        $scheduleId = (int) $_GET['id'];

        // Fetch a specific schedule by ID
        $query = "SELECT id, name, start_date, end_date FROM Schedules WHERE id = ?";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        // Bind the schedule ID to the query
        $stmt->bind_param('i', $scheduleId);

        if (!$stmt->execute()) {
            send_json_error_response(['error' => 'Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
            exit();
        }

        $result = $stmt->get_result();
        $schedule = $result->fetch_assoc();

        if (!$schedule) {
            send_json_error_response(['error' => 'Schedule not found'], 404);
            exit();
        }

        // Fetch schedule entries for the given schedule
        $entriesQuery = "
            SELECT 
                ScheduleEntries.id AS entry_id,
                ScheduleEntries.day,
                ScheduleEntries.start_time,
                ScheduleEntries.end_time,
                RadioShows.id AS radio_show_id,
                RadioShows.title,
                RadioShows.description,
                RadioShows.hosts,
                RadioShows.photo
            FROM ScheduleEntries
            LEFT JOIN RadioShows ON ScheduleEntries.radio_show_id = RadioShows.id
            WHERE ScheduleEntries.schedule_id = ?";
        $entriesStmt = $mysqli->prepare($entriesQuery);

        if (!$entriesStmt) {
            send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        $entriesStmt->bind_param('i', $scheduleId);

        if (!$entriesStmt->execute()) {
            send_json_error_response(['error' => 'Execute failed: (' . $entriesStmt->errno . ') ' . htmlspecialchars($entriesStmt->error)], 500);
            exit();
        }

        $entriesResult = $entriesStmt->get_result();
        $entries = [];
        while ($entry = $entriesResult->fetch_assoc()) {
            $entries[] = [
                'id' => $entry['entry_id'],
                'day' => $entry['day'],
                'start_time' => $entry['start_time'],
                'end_time' => $entry['end_time'],
                'show' => [
                    'id' => $entry['radio_show_id'],
                    'title' => $entry['title'],
                    'description' => $entry['description'],
                    'hosts' => $entry['hosts'],
                    'photo' => $entry['photo']
                ]
            ];
        }

        // Format response
        $response = [
            'id' => $schedule['id'],
            'name' => $schedule['name'],
            'start_date' => $schedule['start_date'],
            'end_date' => $schedule['end_date'],
            'entries' => $entries
        ];

        echo json_encode($response);

        // Clean up
        $stmt->close();
        $entriesStmt->close();
    } else {
        // Fetch all schedules
        $query = "SELECT id, name, start_date, end_date FROM Schedules";
        $result = $mysqli->query($query);

        if (!$result) {
            send_json_error_response(['error' => 'Query failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        $schedules = [];
        while ($row = $result->fetch_assoc()) {
            $schedules[] = [
                'id' => $row['id'],
                'name' => $row['name'],
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date']
            ];
        }

        // Send response
        echo json_encode($schedules);

        // Clean up
        $result->free();
    }

    // Close the database connection
    $mysqli->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}