// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  //user info
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  //errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const signUp = async ()=>{
    try {
      const res = await fetch('/signup', { 
        method: 'POST', 
        body: JSON.stringify({ nickname, email, password }),
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
        localStorage.setItem("token", data.token);
        alert('Account created successfully! Please verify your email...');
        navigate('/verifyEmail');
      }
    }
    catch (err) {
      console.log(err);
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
        <h2 id="title">Sign Up Page</h2>
        <div className = "signUpContainer">
            <label htmlFor="nicknameInput">Enter nickname: </label>
            <input
              type="text"
              id="nicknameInput"
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
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
