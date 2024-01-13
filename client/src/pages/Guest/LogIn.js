// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

function LogIn() {
  //authentication
  //user info
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  //errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [logInStatus, setLogInStatus] = useState("");
  const navigate = useNavigate();
  //admin emails
  const [adminEmails, setAdminEmails] = useState([]);
  //deactivated emails
  const [deactivatedEmails, setDeactivatedEmails] = useState([]);
  //unverified emails
  const [unverifiedEmails, setUnverifiedEmails] = useState([]);
  useEffect(()=>{
    getAdminEmails();
    getDeactivatedEmails();
    getUnverifiedUsers();
  },[])
  const logIn = async ()=>{
    try {
      const res = await fetch('/login', { 
        method: 'POST', 
        body: JSON.stringify({ email, password }),
        headers: {'Content-Type': 'application/json'}
      });
      const data = await res.json();
      if (data.errors) {
        if (data.errors.email){
          setEmailError(data.errors.email);
        }else{
          setEmailError('')
        }
        if (data.errors.password){
          setPasswordError(data.errors.password);
        }else{
          setPasswordError('');
        }
      }else{
        localStorage.setItem("token", data.token);
        if(adminEmails.includes(email)){
          navigate('/loggedinAdmin');
        }else if (deactivatedEmails.includes(email)){
          setEmailError('Your account has been deactivated. Contact admin@gmail.com for more info.');
        }else if (unverifiedEmails.includes(email)){
          console.log('unverified');
          navigate('/verifyEmail');
        }else{
          navigate('/loggedin')
        }
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  //get admin emails
  const getAdminEmails = async () => {
    try {
      const response = await fetch(`/admins`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setAdminEmails(data.adminEmails);
    } catch (error) {
      console.error('Error:', error);
      return null; // Handle the error gracefully
    }
  }

  
  //get deactivated emails
  const getDeactivatedEmails = async () => {
    try {
      const response = await fetch(`/deactivated`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setDeactivatedEmails(data.disabledEmails);
    } catch (error) {
      console.error('Error:', error);
      return null; // Handle the error gracefully
    }
  }

  //get unverified emails
  const getUnverifiedUsers = async () => {
    try {
      const response = await fetch(`/unverified`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setUnverifiedEmails(data.unverifiedEmails);
    } catch (error) {
      console.error('Error:', error);
      return null; // Handle the error gracefully
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
        <h2 id="title">Log In Page</h2>
        <div className = "signUpContainer">
            <label htmlFor="emailInput">Enter email: </label>
            <input
              type="text"
              id="emailInput"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="..."
            />
            <p>{emailError}</p>
            <label htmlFor="passwordInput">Enter password: </label>
            <input
              type="password"
              id="passwordInput"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="..."
            />
            <p>{passwordError}</p>
            <button onClick={logIn}>Submit</button>
            </div>
    </div>
  );
}

export default LogIn;
