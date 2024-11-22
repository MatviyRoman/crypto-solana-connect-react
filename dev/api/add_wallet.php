<?php

require_once 'config.php';
require_once 'header.php';

$conn = new mysqli($host, $user, $password, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
if (!isset($data['address'])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit;
}

$wallet = $data['address'];

if (!preg_match('/^[1-9A-HJ-NP-Za-km-z]{32,44}$/', $wallet)) {
    echo json_encode(["success" => false, "message" => "Invalid wallet address"]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM users WHERE address = ?");
$stmt->bind_param("s", $wallet);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "Wallet already exists"]);
    exit;
}
$stmt->close();

$stmt = $conn->prepare("INSERT INTO users (address) VALUES (?)");
$stmt->bind_param("s", $wallet);
if ($stmt->execute()) {
    echo json_encode(["success" => true, "id" => $stmt->insert_id]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to insert wallet"]);
}

$stmt->close();
$conn->close();