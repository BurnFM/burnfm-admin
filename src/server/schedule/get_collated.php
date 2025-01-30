<?php

global $mysqli;
require '../db_connect.php';
require '../helper_functions.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');  // Set the content type to JSON

function get_settings($mysqli) {
    try {
        $query = "SELECT default_show, off_air_show FROM Settings LIMIT 1";
        $result = $mysqli->query($query);
        return $result->fetch_assoc() ?? [];
    } catch (Exception $e) {
        send_error_response(['message' => 'Error fetching settings', 'error' => $e->getMessage()], 500);
    }
}

function get_active_schedules($mysqli, $start, $end = null) {
    try {
        if (is_null($end)) {
            $end = $start;
        }

        $query = "SELECT id, start_date, end_date FROM Schedules WHERE (start_date IS NULL OR start_date <= ?) AND (end_date IS NULL OR end_date >= ?)";

        $stmt = $mysqli->prepare($query);
        $stmt->bind_param('ss', $end, $start);
        $stmt->execute();
        $result = $stmt->get_result();

        return $result->fetch_all(MYSQLI_ASSOC);
    } catch (Exception $e) {
        send_error_response(['message' => 'Error fetching active schedules', 'error' => $e->getMessage()], 500);
    }
}

function get_schedule_entries($mysqli, $schedule, $day = null) {
    try {
        if (!$schedule) return [];

        $schedule_id = $schedule['id'];

        if ($day) {
            $query = "SELECT * FROM ScheduleEntries WHERE schedule_id = ? && day = ?";
            $stmt = $mysqli->prepare($query);
            $stmt->bind_param('is', $schedule_id, $day);
            $stmt->execute();
            return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        }

        $start_date = $schedule['start_date'] ? new DateTime($schedule['start_date']) : null;
        $end_date = $schedule['end_date'] ? new DateTime($schedule['end_date']) : null;

        $query = "SELECT * FROM ScheduleEntries WHERE schedule_id = ?";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param('i', $schedule_id);
        $stmt->execute();
        $entries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return array_filter($entries, function ($entry) use ($start_date, $end_date) {
//            if ($filter_day !== null && $entry['day'] != $filter_day) {
//                return false;
//            }

            $current_day_of_week = (int) date('w'); // 0 (Sunday) to 6 (Saturday)
            $days_ahead = ($entry['day'] - $current_day_of_week + 7) % 7;

            $entry_date = new DateTime();
            $entry_date->modify("+{$days_ahead} days");

            if (($start_date && $entry_date < $start_date) || ($end_date && $entry_date > $end_date)) {
                return false;
            }

            return true;
        });
    } catch (Exception $e) {
        send_error_response(['message' => 'Error fetching schedule entries', 'error' => $e->getMessage()], 500);
    }
}

function fill_missing_slots(&$schedule, $default_show, $day): void
{
    if (!$default_show) return;

    try {
        // Filter entries for the specified day
        $day_schedule = array_filter($schedule, fn($entry) => $entry['day'] == $day);

        // Sort entries by start time
        usort($day_schedule, fn($a, $b) => strtotime($a['start_time']) - strtotime($b['start_time']));

        // Check for gaps between events
        $last_end_time = '00:00:00'; // Start of the day
        foreach ($day_schedule as $entry) {
            // If there is a gap between the last event's end time and the current event's start time
            if (strtotime($entry['start_time']) > strtotime($last_end_time)) {
                // Create a new event to fill the gap with the default show
                $schedule[] = [
                    'radio_show_id' => $default_show,
                    'day' => (string) $day,
                    'start_time' => $last_end_time,
                    'end_time' => date('H:i:s', strtotime($entry['start_time']))
                ];
            }
            // Update last_end_time to the end of the current event
            $last_end_time = $entry['end_time'];
        }

        // After the loop, check if there is a gap between the last event and the end of the day
        if (strtotime($last_end_time) < strtotime('23:59:59')) {
            $schedule[] = [
                'radio_show_id' => $default_show,
                'day' => (string) $day,
                'start_time' => $last_end_time,
                'end_time' => '23:59:59'
            ];
        }

        // Optional: Sort the schedule by time after adding new entries
        usort($schedule, fn($a, $b) => strtotime($a['start_time']) - strtotime($b['start_time']));

    } catch (Exception $e) {
        send_error_response(['message' => 'Error filling missing slots', 'error' => $e->getMessage()], 500);
    }
}

function resolve_show_details($mysqli, $schedule) {
    try {
        if (empty($schedule)) return [];

        $show_ids = array_unique(array_column($schedule, 'radio_show_id'));

        if (empty($show_ids)) return [];

        $placeholders = implode(',', array_fill(0, count($show_ids), '?'));
        $types = str_repeat('i', count($show_ids));

        $query = "SELECT * FROM RadioShows WHERE id IN ($placeholders)";
        $stmt = $mysqli->prepare($query);
        $stmt->bind_param($types, ...$show_ids);
        $stmt->execute();
        $shows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        $show_map = array_column($shows, null, 'id');

        return array_map(function ($entry) use ($show_map) {
            $show = $show_map[$entry['radio_show_id']] ?? [];
            return array_merge($entry, [
                'title' => $show['title'] ?? 'Unknown',
                'description' => $show['description'] ?? null,
                'hosts' => $show['hosts'] ?? null,
                'photo' => $show['photo'] ?? null
            ]);
        }, $schedule);
    } catch (Exception $e) {
        send_error_response(['message' => 'Error resolving show details', 'error' => $e->getMessage()], 500);
    }
}

function get_schedule_response($mysqli, $include_default, $filter_day) {
    try {
        $settings = get_settings($mysqli);

        // Handle the case that you are only getting schedule for one day
        if (!is_null($filter_day)) {
            // Return the off air show for one day
//            if (!empty($settings['off_air_show'])) {
//                return [['radio_show_id' => $settings['off_air_show']]];
//            }

            $current_day_of_week = (int) date('w'); // 0 (Sunday) to 6 (Saturday)
            $days_ahead = ($filter_day - $current_day_of_week + 7) % 7;

            $target_day = date('Y-m-d', strtotime("+{$days_ahead} days"));

            // Get current schedule (if there is one) for the given day
            $schedule_data = get_active_schedules($mysqli, $target_day)[0] ?? null;

            $schedule = get_schedule_entries($mysqli, $schedule_data, $filter_day);

            if ($include_default) {
                $default_show = $settings['default_show'] ?? null;
                fill_missing_slots($schedule, $default_show, $filter_day);
            }

            return resolve_show_details($mysqli, $schedule);
        }

        $today = date('Y-m-d');
        $in7days = date('Y-m-d', strtotime('+7 days'));

        $schedule_data = get_active_schedules($mysqli, $today, $in7days);

        $final_schedule = [];
        foreach ($schedule_data as $each_schedule) {
            $final_schedule = array_merge($final_schedule, get_schedule_entries($mysqli, $each_schedule));
        }

        if ($include_default) {
            $default_show = $settings['default_show'] ?? null;
            for ($day = 0; $day <= 6; $day++) {
                fill_missing_slots($final_schedule, $default_show, $day);
            }
        }

        return resolve_show_details($mysqli, $final_schedule);
    } catch (Exception $e) {
        send_error_response(['message' => 'Error generating schedule response', 'error' => $e->getMessage()], 500);
    }
}

function format_schedule_response($schedule) {
    $formatted_schedules = [];

    foreach ($schedule as $schedule_entry) {
        $start_time = $schedule_entry['start_time'];
        $end_time = $schedule_entry['end_time'];
        $start = new DateTime($start_time);
        $end = new DateTime($end_time);
        $duration = $start->diff($end)->format('%H:%I:%S');

        $formatted_schedules[] = [
            'show_id' => (int) $schedule_entry['radio_show_id'],
            'day' => (int) $schedule_entry['day'],
            'start_time' => $start_time,
            'end_time' => $end_time,
            'duration' => $duration,
            'title' => $schedule_entry['title'] ?? 'Unknown',
            'description' => $schedule_entry['description'] ?? null,
            'photo' => $schedule_entry['photo'] ?? null,
            'hosts' => !empty($schedule_entry['hosts']) ? explode(',', $schedule_entry['hosts']) : []
        ];
    }

    return $formatted_schedules;
}

try {
    $include_default = isset($_GET['include_default']) ? filter_var($_GET['include_default'], FILTER_VALIDATE_BOOLEAN) : false;
    $filter_day = isset($_GET['day']) ? filter_var($_GET['day'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 0, 'max_range' => 6]]) : null;

    if (is_bool($filter_day) && !$filter_day) {
        $filter_day = null;
    }

    $schedule = get_schedule_response($mysqli, $include_default, $filter_day);
    $formatted_schedule = format_schedule_response($schedule);
    send_success_response($formatted_schedule);
} catch (Exception $e) {
    send_error_response(['message' => 'Unexpected server error', 'error' => $e->getMessage()], 500);
}
