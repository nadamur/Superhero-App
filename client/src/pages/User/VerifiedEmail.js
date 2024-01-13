// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function VerifiedEmail() {
    const navigate = useNavigate();
    //make sure user is authenticated, get their info
    useEffect(() => {
        verifyEmail();
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
          if(data){
            return;
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    
    //verify user
    const verifyEmail= async () =>{
        const url = `/verifyEmail`;
        try{
          const response = await fetch(url, {
            method: 'PUT', 
            headers: {'Content-Type': 'application/json'}
          });
          if (response.status === 200) {
            console.log('Verified');
          } else {
            console.error('Error:', response.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
  

  return (
    <div>
        <h2 id="title">Your Email has been Verified! Click below to proceed.</h2>
        <button onClick={() =>navigate("/loggedin")}>Go to Home</button>
    </div>
    
  );
}

export default VerifiedEmail;
