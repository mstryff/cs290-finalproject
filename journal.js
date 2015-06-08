function submitLogin(form){
    var username = form.username.value;
    var password = form.password.value;
    var params = "name=" + username + "&pass=" + password + "&action=login";
    
    var req = new XMLHttpRequest();
    if(!req){
        throw 'Unable to create HttpRequest.';
    }
    
    req.onreadystatechange = function(){
        if(this.readyState === 4){
            if(req.responseText == username)
            {
                location.reload();
            }
            else
            {
                alert(req.responseText);
            }
        }
    }
    req.open('POST', 'http://web.engr.oregonstate.edu/~stryffem/final/journal.php');
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(params);
}

function submitSignup(form){
    var username = form.username.value;
    var password = form.password.value;
    var params = "name=" + username + "&pass=" + password + "&action=signup";
    
    if(username.length <= 20 && password.length <= 20 && username.length > 5 && password.length > 5)
    {
        var req = new XMLHttpRequest();
        if(!req){
            throw 'Unable to create HttpRequest.';
        }

        req.onreadystatechange = function(){
            if(this.readyState === 4){
                alert(req.responseText);
                if(req.responseText == "Profile created!")
                {
                    location.reload();
                }
            }
        }

        req.open('POST', 'http://web.engr.oregonstate.edu/~stryffem/final/journal.php');
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(params);
    }
    else
    {
        alert("Username and password must be at least 6 characters long and no more than 20. Please try again.");
    }

}

function submitPost(form){
    var date = form.date.value;
    var time = form.time.value;
    var entry = form.entry.value;
    //Does not work in Firefox or IE
    //var private = form.private.value;
    
    var myForm = document.forms['postForm'];
    var radios = myForm.elements["private"];
    var private = null;
    for(var i = 0; i < radios.length; i++)
    {
        if(radios[i].checked == true)
            private = radios[i].value;
    }
    
    var params = "date=" + date + "&time=" + time + "&entry=" + entry + "&private=" + private + "&action=entry";
    
    //alert(params);
    var todayDate = new Date();
    var day = todayDate.getDate();
    var month = todayDate.getMonth() + 1;
    var year = todayDate.getFullYear();
    todayDate = new Date(year, month, day);
    
    var dateArray = date.toString().split("-");
    var myDate = new Date(dateArray[0], dateArray[1], dateArray[2]);
    
    var oldDate = new Date(1900, 1, 1);
    
    if(date.toString() == "" || isNaN(dateArray[0]) || isNaN(dateArray[1]) || isNaN(dateArray[2]))
    {
        alert("You must enter a valid date.");
    }
    else if(myDate > todayDate)
    {
        alert("Date must not be in the future.");
    }
    else if(myDate < oldDate)
    {
        alert("Date must be after 1900.");
    }
    else
    {
        var req = new XMLHttpRequest();
        if(!req){
            throw 'Unable to create HttpRequest.';
        }

        req.onreadystatechange = function(){
            if(this.readyState === 4){
                alert(req.responseText);
                if(req.responseText == "Post submitted!")
                {
                    location.reload();
                }
            }
        }

        req.open('POST', 'http://web.engr.oregonstate.edu/~stryffem/final/journal.php');
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.send(params);        
    }
}

function logout(){
    var params = "logout=true";
    
    var req = new XMLHttpRequest();
    if(!req){
        throw 'Unable to create HttpRequest.';
    }
    
    req.onreadystatechange = function(){
        if(this.readyState === 4){
            //alert(req.responseText);
            if(req.responseText == "logout")
            {
                location.reload();
            }
        }
    }
    
    req.open('POST', 'http://web.engr.oregonstate.edu/~stryffem/final/journal.php');
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(params);
}

window.onload = function(){
    var params = "display=public";
    
    var req = new XMLHttpRequest();
    if(!req){
        throw 'Unable to create HttpRequest.';
    }
    //alert('In onload!');
    req.onreadystatechange = function(){
        if(this.readyState === 4){
            var entryObject = JSON.parse(req.responseText);
            //alert(JSON.stringify(entryObject));
            var loggedInFlag = false;
            var toCheck;
            
            /******* GET PUBLIC ENTRIES ***********/

            var entries = document.getElementById("entries");
            for(var i = 1; i < 100; i++)
            {
                if(entryObject[i] != null && entryObject[i].Public != 0 && entryObject[i].Entry != "")
                {
                    //Author
                    var author = entryObject[i].Author;
                    var list = document.createElement("h3");
                    var node = document.createTextNode("Author: " + author);
                    list.appendChild(node);
                    
                    //Date
                    var dateText = document.createElement("p");
                    var dateNode = document.createTextNode("Date: " + entryObject[i].Date.toString());
                    dateText.appendChild(dateNode);

                    
                    //Time
                    var timeText = document.createElement("p");
                    var timeNode = document.createTextNode("Time: " + entryObject[i].Time.toString());
                    timeText.appendChild(timeNode);
                    
                    //Entry
                    var entryText = document.createElement("p");
                    var entryNode = document.createTextNode(entryObject[i].Entry);
                    entryText.appendChild(entryNode);
                    
                    //Add it all to entries
                    entries.appendChild(list);
                    entries.appendChild(dateText);
                    entries.appendChild(timeText);
                    entries.appendChild(entryText);
                }
            }
            
            /******** DISPLAY MY PRIVATE ENTRIES ***********/
            var pEntries = document.getElementById("privateEntries");
            for(i = 1; i < 100; i++)
            {
                if(entryObject[i] != null && entryObject[i].Public == 0 && entryObject[i].Entry != null 
                   && entryObject[i].Loggedin == entryObject[i].Author && entryObject[i].Entry != "")
                {
                    //alert(entryObject[i].Entry);
                    
                    //Date
                    var dateText = document.createElement("p");
                    var dateNode = document.createTextNode("Date: " + entryObject[i].Date.toString());
                    dateText.appendChild(dateNode);

                    
                    //Time
                    var timeText = document.createElement("p");
                    var timeNode = document.createTextNode("Time: " + entryObject[i].Time.toString());
                    timeText.appendChild(timeNode);
                    
                    //Entry
                    var entryText = document.createElement("p");
                    var entryNode = document.createTextNode(entryObject[i].Entry);
                    entryText.appendChild(entryNode);
                    
                    //Add it all to entries
                    pEntries.appendChild(dateText);
                    pEntries.appendChild(timeText);
                    pEntries.appendChild(entryText);
                }
                //See if user is logged in for userinfo
                if(entryObject[i] != null && entryObject[i].Loggedin != null)
                {
                        loggedInFlag = true;
                        toCheck = i;                    
                }
            }
            //Set userinfo
            if(loggedInFlag)
            {
                //alert(entryObject[toCheck].Loggedin);
                var info = document.getElementById("userinfo");
                var infoNode = document.createTextNode("Logged in as " + entryObject[toCheck].Loggedin);
                info.appendChild(infoNode);
            }
            else
            {
                var info = document.getElementById("userinfo");
                var infoNode = document.createTextNode("Log in to submit journal entries.");
                info.appendChild(infoNode);
            }
        }
    }
    
    req.open('POST', 'http://web.engr.oregonstate.edu/~stryffem/final/journal.php');
    req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    req.send(params);
}