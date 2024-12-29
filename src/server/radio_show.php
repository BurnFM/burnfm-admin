<?php
global $mysqli;
require 'helper_functions.php';
require 'db_connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET')
    {
        $query = "
            SELECT
                RadioShows.id AS show_id,
                RadioShows.title,
                RadioShows.description,
                RadioShows.hosts,
                RadioShows.photo,
                Recordings.recording,
                Recordings.recorded_at
            FROM 
                RadioShows
            LEFT JOIN 
                Recordings
            ON 
                RadioShows.id = Recordings.radio_show_id
            ORDER BY 
                RadioShows.id, Recordings.recorded_at ASC";

        $statement = $mysqli->prepare($query);

        if (!$statement) {
            send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        // Execute the query
        if (!$statement->execute()) {
            send_json_error_response(['Execute failed: (' . $statement->errno . ') ' . htmlspecialchars($statement->error)], 500);
            exit();
        }

        $result = $statement->get_result();

        // Process the results
        $shows = [];
        while ($row = $result->fetch_assoc()) {
            $show_id = $row['show_id'];

            // If this show isn't already added, create its structure
            if (!isset($shows[$show_id])) {
                $shows[$show_id] = [
                    'id'           => $show_id,
                    'title'        => $row['title'],
                    'description'  => empty_to_null($row['description']),
                    'hosts'        => empty_to_null($row['hosts']),
                    'photo'        => empty_to_null($row['photo']),
                    'recordings'   => []
                ];
            }

            // If a recording exists, add it to the recordings array
            if (!empty($row['recording'])) {
                $shows[$show_id]['recordings'][] = [
                    'recording'   => $row['recording'],
                    'recorded_at' => $row['recorded_at']
                ];
            }
        }

        // Reindex the array (to make it a list) and return as JSON
        echo json_encode(array_values($shows));

        // Clean up
        $statement->close();
        $mysqli->close();
    }

    elseif ($method === 'PUT')
    {
        // Ensure the content type is multipart/form-data
        if (!isset($_POST['title'])) {
            send_json_error_response(['Invalid input: Missing required fields'], 400);
            exit();
        }

        $title = $_POST['title'];
        $description = $_POST['description'] ?? null;
        $hosts = $_POST['hosts'] ?? null;

        // Prepare SQL query to insert a new radio show
        $query = "INSERT INTO RadioShows (title, description, hosts, photo) VALUES (?, ?, ?, ?)";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        // Placeholder for photo path
        $photo_path = null;

        if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
            $file_tmp_name = $_FILES['photo']['tmp_name'];
            $file_type = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);

            // Generate the show ID by first inserting a placeholder record
            $stmt->bind_param('ssss', $title, $description, $hosts, $photo_path);
            if (!$stmt->execute()) {
                send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
                exit();
            }
            $show_id = $stmt->insert_id;

            // Determine the upload directory and file path
            $upload_dir = __DIR__ . "/uploads/radio_shows/$show_id";
            $photo_path = "api.burnfm/uploads/radio_shows/$show_id/$show_id.$file_type";

            if (!is_dir($upload_dir) && !mkdir($upload_dir, 0777, true)) {
                send_json_error_response(['Failed to create upload directory'], 500);
                exit();
            }

            // Move uploaded file to the target directory
            $target_file = "$upload_dir/$show_id.$file_type";
            if (!move_uploaded_file($file_tmp_name, $target_file)) {
                send_json_error_response(['Failed to save uploaded file'], 500);
                exit();
            }

            // Update the photo path in the database
            $query_update = "UPDATE RadioShows SET photo = ? WHERE id = ?";
            $stmt_update = $mysqli->prepare($query_update);

            if (!$stmt_update) {
                send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
                exit();
            }

            $stmt_update->bind_param('si', $photo_path, $show_id);
            if (!$stmt_update->execute()) {
                send_json_error_response(['Execute failed: (' . $stmt_update->errno . ') ' . htmlspecialchars($stmt_update->error)], 500);
                exit();
            }

            $stmt_update->close();
        } else {
            // Directly insert if no photo is uploaded
            if (!$stmt->execute()) {
                send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
                exit();
            }
            $show_id = $stmt->insert_id;
        }

        // Return success response
        echo json_encode([
            'message' => 'Radio show added successfully',
            'id'      => $show_id
        ]);

        // Clean up
        $stmt->close();
        $mysqli->close();
    } else {
        // Method not allowed
        send_json_error_response(['Method not allowed'], 405);
    }
} catch (Exception $e) {
    // Handle any unexpected errors
    send_json_error_response(['Unexpected error: ' . $e->getMessage()], 500);
}