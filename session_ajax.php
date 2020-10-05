<?php
    header("Content-Type: application/json");
    ini_set("session.cookie_httponly", 1);
    require 'database.php';
    session_start();
    //Because you are posting the data via fetch(), php has to retrieve it elsewhere.
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    if (isset($_SESSION['user_id']) && isset($_SESSION['username'])) {
        // Use a prepared statement
        $stmt = $mysqli->prepare("SELECT id, username FROM users");
        if(!$stmt){
        //printf("Query Prep Failed: %s\n", $mysqli->error);
            echo json_encode(array("success" => false,"message" => "Query failed to prep"));
            exit;
        }

        $stmt->execute();

        $stmt->bind_result($user_id, $username);
        $array_users = array();

        // Push results into an array
        while ($stmt->fetch()) {
            $array_users += [$username => $user_id];
        }

        $stmt->close();

        // Send new variables over by json
        echo json_encode(array(
            "success" => true, 
            "array" => $array_users, 
            "user_id" => $_SESSION['user_id'], 
            "token" => $_SESSION['token'], 
            "username" => $_SESSION['username']
        ));
        exit;
    }
    else {
        // Send new variables over by json
        echo json_encode(array(
            "success" => false,
            "message" => "No previous session found"
        ));
        exit;
    }
?>