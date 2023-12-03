// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function ListInfo() {
    //test var
    const {listName} = useParams();
    console.log('name: ' + listName);
    //authentication
    const [logInStatus, setLogInStatus] = useState("");
    //user info
    const [loggedInNickname, setLoggedInNickname] = useState("");
    const [loggedInEmail, setLoggedInEmail] = useState("");

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
        setLogInStatus(tempLogInStatus);
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
              setLoggedInNickname(data.nickname);
              setLoggedInEmail(data.email);
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }

  
  return (
    <div>
        <nav>
            <ul className="nav-links">
                <li>
                  <Link to = "/" className="nav-button">Home</Link>
                </li>
            </ul>
        </nav>
        <h2 id="title">List Info</h2>
    </div>
  );
}

export default ListInfo;
