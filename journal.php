<?php
    header('Content-Type: text/plain');
    ini_set('display_errors', 'On');
    session_start();

    if(isset($_SESSION['loggedIn']) && $_SESSION['loggedIn'] == 'true') 
    {
        //echo "$_SESSION[name] logged in.";
    }
    
    //Open DB
    $mysqli = new mysqli("oniddb.cws.oregonstate.edu", "stryffem-db", "czOBEHllXrDenpeR", "stryffem-db");
    if(!$mysqli || $mysqli->connect_errno)
    {
        echo "Connection error " . $mysqli->connect_errno . " " . $mysqli->connnect_error;
    }

    //Handle login, signup, post requests
    if(isset($_POST['action']))
    {
        //Handle login
        if($_POST['action'] == 'login')
        {
            //Missing username or password
            if(!isset($_POST['name']) || !isset($_POST['pass']) || 
                $_POST['name'] == null || $_POST['pass'] == null)
            {
                echo "Username and password required.";
            }
            //Username and password entered - check if user exists in db
            else
            {
                $loginResult = NULL;
                $passwordResult = NULL;
                //Prepare
                if(!($loginStmt = $mysqli->prepare("SELECT username, password FROM finaldb WHERE username = ?")))
                {
                    //echo "Prepare failed: " . $mysqli->errno . " " . $mysqli->error;
                }
                //Bind
                if(!($loginStmt->bind_param("s", $_POST['name'])))
                {
                    //echo "Binding failed: "  . $stmt->errno . " " . $stmt->error;
                }
                //Execute
                if(!($loginStmt->execute()))
                {
                    echo "Error occurred in login. Try again.";
                }
                //Bind results
                if(!($loginStmt->bind_result($loginResult, $passwordResult)))
                {
                    echo "Error occurred in login. Try again.";
                }
                //Fetch results
                if($loginStmt->fetch() && $passwordResult == $_POST['pass'])
                {
                    echo $loginResult;
                    $_SESSION['name'] = $_POST['name'];
                    $_SESSION['loggedIn'] = true;
                }
                else
                {
                    echo "Invalid username or password. Try again or create an account.";
                }
                $loginStmt->free_result();
            }
        }
        //Trying to sign up
        else if($_POST['action'] == 'signup')
        {
            //Missing username or password
            if(!isset($_POST['name']) || !isset($_POST['pass']) || 
                $_POST['name'] == null || $_POST['pass'] == null)
            {
                echo "Username and password required.";
            }
            //Username and password entered - check against db and create user
            else
            {
                $uniqueHandle = true;
                //Prepare
                if(!($checkStmt = $mysqli->prepare("SELECT username FROM finaldb")))
                {
                    //echo "Prepare failed: " . $mysqli->errno . " " . $mysqli->error;
                }
                //Execute
                if(!($checkStmt->execute()))
                {
                    echo "Error occurred in sign up. Try again.";
                }
                //Bind results
                if(!($checkStmt->bind_result($checkResult)))
                {
                    echo "Error occurred in sign up. Try again.";
                }
                //Fetch results
                while($checkStmt->fetch())
                {
                    if($checkResult == $_POST['name'])
                    {
                        $uniqueHandle = false;
                    }
                }
                
                if($uniqueHandle)
                {
                    //Prepare
                    if(!($signupStmt = $mysqli->prepare("INSERT INTO finaldb (username, password) VALUES (?, ?)")))
                    {
                        //echo "Prepare failed: " . $mysqli->errno . " " . $mysqli->error;
                    }
                    //Bind
                    if(!($signupStmt->bind_param("ss", $_POST['name'], $_POST['pass'])))
                    {
                        //echo "Binding failed: "  . $stmt->errno . " " . $stmt->error;
                    }
                    //Execute
                    if(!($signupStmt->execute()))
                    {
                        //echo "That username is taken. Please try again.";
                    }
                    else
                    {
                        $_SESSION['name'] = $_POST['name'];
                        $_SESSION['loggedIn'] = true;
                        echo "Profile created!";
                    }
                    $signupStmt->free_result();
                }
                else
                {
                    echo "That username is taken. Please try again.";
                }

            }
        }
        //Handle post requests
        else if($_POST['action'] == 'entry')
        {
            //echo "Attempting to post.";
            if(!(isset($_SESSION['name'])))
            {
                echo "You must log in to post a journal entry.";
            }
            else
            {
                //Set up value variables
                $myPublic = 1;
                if($_POST['private'] == "private")
                {
                    $myPublic = 0;
                }
                
                //Prepare
                if(!($postStmt = $mysqli->prepare
                     ("INSERT INTO finaldb (username, date, time, entry, public) VALUES (?, ?, ?, ?, ?)")))
                {
                    //echo "Prepare failed: " . $mysqli->errno . " " . $mysqli->error;
                }
                //Bind
                if(!($postStmt->bind_param
                     ("ssssi", $_SESSION['name'], $_POST['date'], $_POST['time'], $_POST['entry'], $myPublic)))
                {
                    //echo "Binding failed: " . $stmt->errno . " " . $stmt->error;
                }
                //Execute
                if(!($postStmt->execute()))
                {
                    echo "Unable to post entry. Please try again.";
                }
                else
                {
                    echo "Post submitted!";
                }
                $postStmt->free_result();
            }
        }
    }

    if(isset($_POST['display']))
    {
        $curUser = NULL;
        $curEntry = NULL;
        $curDate = NULL;
        $curTime = NULL;
        $curId = NULL;
        $curPublic = NULL;
        $entryResults = array(array());
        //Prepare
        if(!($entryStmt = $mysqli->prepare("SELECT id, username, entry, date, time, public FROM finaldb")))
        {
            //echo "Prepare failed: " . $mysqli->errno . " " . $mysqli->error;
        }
        //Execute
        if(!($entryStmt->execute()))
        {
            //echo "Execution failed: "  . $stmt->errno . " " . $stmt->error;
        }
        //Bind results
        if(!($entryStmt->bind_result($curId, $curUser, $curEntry, $curDate, $curTime, $curPublic)))
        {
            //echo "Binding failed: "  . $stmt->errno . " " . $stmt->error;
        }
        //Fetch results
        while($entryStmt->fetch())
        {
            if(!(isset($_SESSION['name'])))
            {
                $newData = array(
                    'Author' => $curUser,
                    'Date' => $curDate,
                    'Time' => $curTime,
                    'Entry' => $curEntry,
                    'Public' => $curPublic,
                );
            }
            else
            {
                 $newData = array(
                    'Author' => $curUser,
                    'Date' => $curDate,
                    'Time' => $curTime,
                    'Entry' => $curEntry,
                    'Public' => $curPublic,
                    'Loggedin' => $_SESSION['name'],
                 );
            }
            $entryResults[$curId] = $newData;
        }
        
        echo json_encode($entryResults);
        $entryStmt->free_result();
    }

    if(isset($_POST['logout']))
    {
        if(isset($_SESSION['name']))
        {
            echo "logout";
            $_SESSION = array();
            session_destroy();
            die();
            
        }
    }

    $mysqli->close();
?>