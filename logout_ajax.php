<?php
    // Logs out user and destroys session
    header("Content-Type: application/json");
    session_start();
    session_unset();
    session_destroy();

    echo json_encode(array("success" => true));
    exit;
?>
