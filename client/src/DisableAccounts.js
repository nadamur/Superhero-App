// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function DisableAccounts() {
    //users
    const [emails, setEmails] = useState([]);
    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
      checkAuthentication();
    }, []);



    
  //check authentication
  const checkAuthentication = async () => {
    let tempLogInStatus = "";
    try {
      const response = await fetch(`/login`);
      if (!response.ok) {
        //if no heroes found, displays message
        console.log("Error fetching log in status");
      }else{
        const data = await response.json();
        //when it receives data, sets logInStatus to true or false depending on response
        tempLogInStatus = data.loggedIn;
        if(!tempLogInStatus){     
          navigate("/login");
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  
  return (
    <div>
        <h2 id="title">Account Centre: </h2>
        <button onClick={() =>navigate("/loggedinAdmin")}>Done</button>
        <div class="heroes-container">
    </div>
    <div id="searchResults">
        <h2>Accounts</h2>
        <ul>
        {emails.length > 0 && <ul>{emails}</ul>}
        </ul>
    </div>
    </div>
    
  );
}

export default DisableAccounts;
