<?php
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    require 'database.php';
    ini_set("session.cookie_httponly", 1);
    session_start();
    $json_str = file_get_contents('php://input');
    $json_obj = json_decode($json_str, true);

    $previous_ua = @$_SESSION['useragent'];
    $current_ua = $_SERVER['HTTP_USER_AGENT'];

    if(isset($_SESSION['useragent']) && $previous_ua !== $current_ua){
        die("Session hijack detected");
    }else{
	$_SESSION['useragent'] = $current_ua;
    }
     // CSRF token validation
     if(!hash_equals($_SESSION['token'], $json_obj['token'])){
        die("Request forgery detected");
    }

    // Set variables 
    $event_id = (int) $json_obj['event_id'];
    $share_with = (int) $json_obj['user_id'];

    $stmt = $mysqli->prepare("SELECT title, date, time, tag FROM events where pk_id=?" );
    if(!$stmt){
        //printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array("success" => false,"message" => "Query failed to prep"));
        exit;
    }

    $stmt->bind_param('i', $event_id);
    $stmt->execute();

    $stmt->bind_result($title, $date, $time, $tag);
    $stmt->fetch();
    $stmt->close();

    $stmt = $mysqli->prepare("insert into events (user_id, title, date, time, tag) values (?,?,?,?,?)" );
    if(!$stmt){
        //printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array("success" => false,"message" => "Query failed to prep"));
        exit;
    }
    
    $stmt->bind_param('issss', $share_with, $title, $date, $time, $tag);
    $stmt->execute();

    $stmt->close();

    echo json_encode(array("success" => true));
    exit;
?>