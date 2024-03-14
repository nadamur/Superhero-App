
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function DisableAccounts() {
    //users
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
      checkAuthentication();
      getUsers();
    }, []);

    useEffect(() => {
        console.log(users);
      }, [users]);
    
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

  //function to disable user
const disableUser= async (email) =>{
    const newStatus = "disabled";
    const url = `/updateStatus`;
    try{
      const response = await fetch(url, {
        method: 'PUT', 
        body: JSON.stringify( { email, newStatus  }),
        headers: {'Content-Type': 'application/json'}
      });
      if (response.status === 200) {
        console.log('Status updated successfully');
        getUsers();
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
    //function to enable user
    const enableUser= async (email) =>{
        const newStatus = "enabled";
        const url = `/updateStatus`;
        try{
          const response = await fetch(url, {
            method: 'PUT', 
            body: JSON.stringify( { email, newStatus  }),
            headers: {'Content-Type': 'application/json'}
          });
          if (response.status === 200) {
            console.log('Status updated successfully');
            getUsers();
          } else {
            console.error('Error:', response.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
    //function to make user admin
    const makeAdmin= async (email) =>{
        const newStatus = "Admin";
        const url = `/updateStatus`;
        try{
          const response = await fetch(url, {
            method: 'PUT', 
            body: JSON.stringify( { email, newStatus  }),
            headers: {'Content-Type': 'application/json'}
          });
          if (response.status === 200) {
            console.log('Status updated successfully');
            getUsers();
          } else {
            console.error('Error:', response.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }
  
  //function to get users
  const getUsers = async () => {
    try {
      const res = await fetch(`/users`, {
        headers:{
          "x-access-token":localStorage.getItem("token")
        }
      });
      if (!res.ok){
        throw new Error('Request failed');
      }
      const data = await res.json();
      // compare the new list with the current list
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching emails:', error);
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
        {users.length > 0 &&
            users.map((user, index) => (
              <li key={index}>
                Email: {user.email} | Status: {user.status}
                <button onClick={() =>disableUser(user.email)}>Disable</button>
                <button onClick={() =>enableUser(user.email)}>Enable</button>
                <button onClick={() =>makeAdmin(user.email)}>Make Admin</button>
              </li>
            ))}
        </ul>
    </div>
    </div>
    
  );
}

export default DisableAccounts;
