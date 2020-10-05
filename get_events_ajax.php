<?php
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    ini_set("session.cookie_httponly", 1);
    session_start();
    require 'database.php';

    //Because you are posting the data via fetch(), php has to retrieve it elsewhere.
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
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

    // Get user id from session variable
    $user_id = (int) $_SESSION['user_id'];

    // Use a prepared statement
    $stmt = $mysqli->prepare("SELECT pk_id, title, date, time, tag FROM events WHERE user_id=? order by time");
    if(!$stmt){
    //printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array("success" => false,"message" => "Query failed to prep"));
        exit;
    }
    else{
        $stmt->bind_param('i', $user_id);
        $stmt->execute();

        $stmt->bind_result($event_id, $title, $date, $time, $tag);
        $array_events = array();

        // Push results into an array
        while ($stmt->fetch()) {
            array_push($array_events, $event_id, $title, $date, $time, $tag);
        }

        $stmt->close();

        // Send array over by json
        echo json_encode(array("success" => true, "array" => $array_events));
        exit;
    }
?>
