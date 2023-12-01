// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  //user info
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  //errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const signUp = async ()=>{
    console.log("signing up...");
    try {
      const res = await fetch('/signup', { 
        method: 'POST', 
        body: JSON.stringify({ username, email, password }),
        headers: {'Content-Type': 'application/json'}
      });
      const data = await res.json();
      if (data.errors) {
        if (data.errors.email){
          setEmailError(data.errors.email);
        }
        if (data.errors.password){
          setPasswordError(data.errors.password);
        }
      }else{
        alert('Account created successfully!');
        navigate('/loggedin');
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    console.log('user: ' + username);
    console.log('email: ' + email);
    console.log('pass: ' + password);
  }, [username,email,password]);
  
  return (
    <div>
        <nav>
            <ul className="nav-links">
                <li>
                  <Link to = "/" className="nav-button">Home</Link>
                </li>
            </ul>
        </nav>
        <h2 id="title">Sign Up Page</h2>
        <div className = "signUpContainer">
            <label htmlFor="usernameInput">Enter username: </label>
            <input
              type="text"
              id="usernameInput"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="..."
            />
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
            <button onClick={()=>{signUp()}}>Submit</button>
            </div>
    </div>
  );
}

export default SignUp;
