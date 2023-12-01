// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

function LogIn() {
  //user info
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  //errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
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
        alert('Successfully Logged In!');
        navigate('/loggedin');
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    console.log('email: ' + email);
    console.log('pass: ' + password);
  }, [email,password]);
  
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
            <button onClick={()=>{logIn()}}>Submit</button>
            </div>
    </div>
  );
}

export default LogIn;
