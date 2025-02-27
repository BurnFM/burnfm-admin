<?php

global $mysqli;
require '../helper_functions.php';
require '../db_connect.php';

$rootPath = $_SERVER['DOCUMENT_ROOT']; // This is the root directory of the web server

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json'); // Set the content type to JSON

try {
    if (isset($_GET['id'])) {

        if (!is_numeric($_GET['id'])) {
            send_json_error_response(['Invalid id given as query parameter'], 500);
            exit();
        }

        $id = (int) $_GET['id'];
        $include_recordings = isset($_GET['include_recordings']) && $_GET['include_recordings'] === 'true';
        $include_timings = isset($_GET['include_timings']) && $_GET['include_timings'] === 'true';

        // Fetch the specific radio show
        $query = "SELECT * FROM RadioShows WHERE id = ?";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        $stmt->bind_param('i', $id);
        if (!$stmt->execute()) {
            send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
            exit();
        }

        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            send_json_error_response(['No radio show found with the provided ID'], 404);
            exit();
        }

        $show = $result->fetch_assoc();
        $response = [
            'show' => [
                'id' => $show['id'],
                'title' => $show['title'],
                'description' => empty_to_null($show['description']),
                'photo' => empty_to_null($show['photo']),
                'hosts' => !empty($show['hosts']) ? explode(',', $show['hosts']) : []
            ]
        ];

        // Fetch recordings if required
        $recordings = [];

        if ($include_recordings) {
            // Fetch recordings from database
            $recordings_query = "SELECT id, title, recording, recorded_at FROM Recordings WHERE radio_show_id = ?";
            $stmt = $mysqli->prepare($recordings_query);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $recordings_result = $stmt->get_result();

            while ($row = $recordings_result->fetch_assoc()) {
                $recordings[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'recording' => $row['recording'],
                    'recorded_at' => $row['recorded_at']
                ];
            }

            // Fetch the schedule timings for the show
            $schedule_query = "SELECT s.start_date, s.end_date, se.start_time, se.end_time, se.day 
                               FROM ScheduleEntries se 
                               JOIN Schedules s ON se.schedule_id = s.id 
                               WHERE se.radio_show_id = ?";
            $stmt = $mysqli->prepare($schedule_query);
            $stmt->bind_param('i', $id);
            $stmt->execute();
            $schedule_result = $stmt->get_result();
            $timings = [];

            while ($row = $schedule_result->fetch_assoc()) {
                $timings[] = [
                    'start_time' => $row['start_time'],
                    'end_time' => $row['end_time'],
                    'day' => (int) $row['day'],
                    'start_date' => $row['start_date'],
                    'end_date' => $row['end_date']
                ];
            }

            // Now, find recordings from the file directory within the range of the show's timings
            $recordings_dir = 'uploads/recordings'; // Set the path to your recordings folder
            foreach ($timings as $timing) {
                // Get the day of the week for the show (1 = Monday, 2 = Tuesday, etc.)
                $show_day_of_week = $timing['day'];

                // Scan the directory for files with the format "yyyymmdd-hhmmss.mp3"
                $files = scandir($rootPath . $recordings_dir);
                foreach ($files as $file) {
                    // Check if the file matches the recording pattern and if it's within the time range
                    if (preg_match('/(\d{8})-(\d{6})\.mp3/', $file, $matches)) {
                        $file_datetime = strtotime($matches[1] . ' ' . $matches[2]);

                        $file_date = date('Y-m-d', $file_datetime);

                        $file_time = date('H:i:s', $file_datetime);

                        // Check if the file is on the same day of the week as the show and within the time range
                        $file_day_of_week = date('N', $file_datetime); // 1 = Monday, 7 = Sunday
                        if ($file_day_of_week == $show_day_of_week) {

                            if ($file_time >= $timing['start_time'] && $file_time < $timing['end_time'] && $file_date >= $timing['start_date'] && $file_date < $timing['end_date']) {

                                $recordings[] = [
                                    'title' => $show['title'] . " - " . date("d M H:i", $file_datetime),   // Output: Title 27 Feb 15:30,
                                    'recording' => $recordings_dir . '/' . $file,
                                    'recorded_at' => date('Y-m-d H:i:s', $file_datetime)
                                ];
                            }

                        }
                    }
                }
            }

            $response['show']['recordings'] = $recordings;
        }

        // Fetch schedule timings if required
        if ($include_timings) {
            $response['show']['timings'] = $timings;
        }

        echo json_encode($response);

    } else {
        $query = "SELECT * FROM RadioShows";
        $stmt = $mysqli->prepare($query);

        if (!$stmt) {
            send_json_error_response(['Prepare failed: (' . $mysqli->errno . ') ' . htmlspecialchars($mysqli->error)], 500);
            exit();
        }

        if (!$stmt->execute()) {
            send_json_error_response(['Execute failed: (' . $stmt->errno . ') ' . htmlspecialchars($stmt->error)], 500);
            exit();
        }

        $result = $stmt->get_result();
        $rows = [];

        while ($row = $result->fetch_assoc()) {
            $rows[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'description' => empty_to_null($row['description']),
                'photo' => empty_to_null($row['photo']),
                'hosts' => !empty($row['hosts']) ? explode(',', $row['hosts']) : []
            ];
        }

        echo json_encode(['shows' => $rows]);
    }

    $stmt->close();
    $mysqli->close();

} catch (Exception $e) {
    send_json_error_response(['Unexpected error: ' . $e->getMessage()], 500);
}