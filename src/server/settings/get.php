<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    $query = "SELECT * FROM Settings LIMIT 1";
    $stmt = $mysqli->prepare($query);

    if (!$stmt) {
        send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
        exit();
    }

    // Execute the query
    if (!$stmt->execute()) {
        send_json_error_response(['error' => 'Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
        exit();
    }

    // Get the result
    $result = $stmt->get_result();
    $settings = $result->fetch_assoc(); // Fetch the only row

    if ($settings) {
        // Format response according to the required structure
        $response = [
            'defaultShow' => [
                'enabled' => (bool)$settings['default_show_enabled'],
                'show' => $settings['default_show'] ?? null, // Optional show ID
            ],
            'offAirMode' => [
                'enabled' => (bool)$settings['off_air_mode_enabled'],
                'show' => $settings['off_air_show'] ?? null, // Optional show ID
            ],
        ];

        // Send the response
        echo json_encode($response);
    } else {
        // If no settings are found, insert a new row with default values
        $defaultValues = [
            'default_show_enabled' => 0,  // default_show is disabled by default
            'default_show' => null,       // no default show set
            'off_air_mode_enabled' => 0,  // off-air mode is disabled by default
            'off_air_show' => null        // no off-air show set
        ];

        // Prepare the insert statement
        $insertQuery = "INSERT INTO Settings (default_show_enabled, default_show, off_air_mode_enabled, off_air_show) VALUES (?, ?, ?, ?)";
        $insertStmt = $mysqli->prepare($insertQuery);

        if (!$insertStmt) {
            send_json_error_response(['error' => 'Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        // Bind the parameters to the insert statement
        $insertStmt->bind_param('iiii', $defaultValues['default_show_enabled'], $defaultValues['default_show'], $defaultValues['off_air_mode_enabled'], $defaultValues['off_air_show']);

        // Execute the insert statement
        if (!$insertStmt->execute()) {
            send_json_error_response(['error' => 'Insert failed: (' . $insertStmt->errno . ') ' . htmlspecialchars($insertStmt->error)], 500);
            exit();
        }

        // Now get the newly inserted settings (since there's only one row)
        $newSettings = [
            'defaultShow' => [
                'enabled' => (bool) $defaultValues['default_show_enabled'],
                'show' => $defaultValues['default_show'],
            ],
            'offAirMode' => [
                'enabled' => (bool) $defaultValues['off_air_mode_enabled'],
                'show' => $defaultValues['off_air_show'],
            ],
        ];

        // Send the response with the newly inserted settings
        echo json_encode($newSettings);

        // Clean up
        $insertStmt->close();
    }

    // Clean up
    $stmt->close();
    $mysqli->close();
} catch (Exception $e) {
    // Handle unexpected errors
    send_json_error_response(['error' => 'Internal Server Error: ' . $e->getMessage()], 500);
}