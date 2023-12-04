// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function UpdatePass() {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');

    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
        checkAuthentication();
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
              setEmail(data.email);
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }

      const updatePass = async () =>{
        const newPassword = password;
        console.log(password);
        const url = `/updatePassword`;
        try{
          const response = await fetch(url, {
            method: 'PUT',
            body: JSON.stringify({ newPassword }),
            headers: {'Content-Type': 'application/json'}
          });
          if (response.status === 200) {
            console.log('Updated');
          }else {
            console.error('Error:', response.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }



  
  return (
    <div>
        <h2 id="title">Update Password</h2>
        <button onClick={() =>navigate("/home")}>Cancel</button>
        <div class="heroes-container">
        <div className = "signUpContainer">
            <label htmlFor="passwordInput">Enter new password: </label>
            <input
              type="password"
              id="passwordInput"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="..."
            />
            <button onClick={updatePass}>Submit</button>
            </div>
    </div>
    </div>
    
  );
}

export default UpdatePass;
