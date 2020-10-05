<?php
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    ini_set("session.cookie_httponly", 1);

    //Because you are posting the data via fetch(), php has to retrieve it elsewhere.
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //Variables can be accessed as such:
    $username = (string) $json_obj['username'];
    $password = (string) $json_obj['password'];
    //This is equivalent to what you previously did with $_POST['username'] and $_POST['password']

    require 'database.php';

    // Hash password before sending to database
    $hashed_pass = password_hash($password, PASSWORD_BCRYPT);

    // Insert user data into database with hashed password while ignoring duplicate usernames
    $stmt = $mysqli->prepare("insert ignore into users (username, password) values (?, ?)");
    if(!$stmt){
        //printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array("success" => false,"message" => "Query failed to prep"));
        exit;
    }
    
    if(!$stmt) {
        printf("Query Prep Failed: %s\n", $mysqli->error);
        exit;
    }

    $stmt->bind_param('ss', $username, $hashed_pass);

    $stmt->execute();

    $stmt->close();

    echo json_encode(array("success" => true));
    exit;
?>
