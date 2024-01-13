// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function VerifyEmail() {
    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
      //checks user is authenticated
      checkAuthentication();
      //gets their info
      checkUser();
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

  
    //check current user
    const checkUser = async ()=>{
      try {
        const response = await fetch(`/getUser`, {
          headers:{
            "x-access-token":localStorage.getItem("token")
          }
        });
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("Error fetching log in status");
        }else{
          const data = await response.json();
          //when it receives data, sets logInStatus to true or false depending on response
          if(data){
            return;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

  return (
    <div>
        <h2 id="title">Verify Email</h2>
        <button onClick={() =>navigate("/verifiedEmail")}>Click here to verify</button>
    </div>
    
  );
}

export default VerifyEmail;
