<?php
// save.php
//
// Accepts a JSON payload via POST and persists it to todos.txt.
//
// Expected request body:
// - A JSON string representing an array of task objects:
//     [{ "Name": string, "itemDone": boolean }, ...]
//
// Usage from JS:
// fetch('save.php', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(payload)
// })

header('Content-Type: application/json');

// This endpoint only supports POST.
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Only POST requests are allowed']);
    exit;
}

// Read raw request body.
$input = file_get_contents('php://input');
if ($input === false || trim($input) === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Empty request body']);
    exit;
}

// Decode/validate JSON.
$data = json_decode($input, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

// Ensure the payload is an array of tasks.
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Payload must be a JSON array']);
    exit;
}

// Persist to todos.txt next to this PHP file.
$baseDir = __DIR__;
$pathTodos = $baseDir . DIRECTORY_SEPARATOR . 'todos.txt';

// Pretty-print output for easier debugging/inspection.
$jsonOut = json_encode($data, JSON_PRETTY_PRINT);

// Write to disk using an exclusive lock.
if (file_put_contents($pathTodos, $jsonOut, LOCK_EX) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Failed writing todos.txt']);
    exit;
}

// Success response.
http_response_code(200);
echo json_encode(['ok' => true]);
