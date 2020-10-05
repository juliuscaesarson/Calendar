<?php
    header("Content-Type: application/json"); // Since we are sending a JSON response here (not an HTML document), set the MIME Type to application/json
    require 'database.php';
    ini_set("session.cookie_httponly", 1);
    session_start();
    //Because you are posting the data via fetch(), php has to retrieve it elsewhere.
    $json_str = file_get_contents('php://input');
    //This will store the data into an associative array
    $json_obj = json_decode($json_str, true);

    //Variables can be accessed as such:
    $username = (string) $json_obj['username'];
    $password = (string) $json_obj['password'];


    // Use a prepared statement
    $stmt = $mysqli->prepare("SELECT COUNT(*), id, username, password FROM users WHERE username=?");
    if(!$stmt){
        //printf("Query Prep Failed: %s\n", $mysqli->error);
        echo json_encode(array("success" => false,"message" => "Query failed to prep"));
        exit;
    }

    // Bind the parameter
    $stmt->bind_param('s', $username);
    $stmt->execute();

    // Bind the results
    $stmt->bind_result($cnt, $user_id, $newusername, $pwd_hash);
    $stmt->fetch();
    $stmt->close();

     // Use a prepared statement for getting list of usernames
     $stmt = $mysqli->prepare("SELECT id, username FROM users");
     if(!$stmt){
     //printf("Query Prep Failed: %s\n", $mysqli->error);
         echo json_encode(array("success" => false,"message" => "Query failed to prep"));
         exit;
     }

     $stmt->execute();

     $stmt->bind_result($user_id2, $username);
     $array_users = array();

     // Push results into an array
     while ($stmt->fetch()) {
         $array_users += [$username => $user_id2];
     }

     $stmt->close();

    // Check to see if the username and password are valid.  (You learned how to do this in Module 3.)

    if($cnt == 1 && password_verify($password, $pwd_hash)) {
        // Set session variables
        $_SESSION['user_id'] = $user_id;
        $_SESSION['username'] = $newusername;
        $_SESSION['token'] = bin2hex(openssl_random_pseudo_bytes(32)); 

        // Send new variables over by json
        echo json_encode(array(
            "success" => true,
            "user_id" => $user_id,
            "token" => $_SESSION['token'],
            "username" => $newusername,
            "array" => $array_users
        ));
        exit;
    }else{
        echo json_encode(array(
            "success" => false,
            "message" => "Incorrect Username or Password"
        ));
        exit;
    }
?>
