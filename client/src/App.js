// App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css'; // Import your CSS file
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';
import LoggedInUser from './LoggedInUser.js';
import { useAuth, AuthProvider } from './authContext';


function App() {
  //authentication, defaults to false
  const {isAuthenticated, login, logout} = useAuth();
  useEffect(() => {
    //check authentication
    checkAuthentication();
  }, []);

  //if LogIn page notifies us that login was successful, change 'isAuthenticated' to true immediately to allow access to main page
  const loggedIn = () =>{
    login();
  }

  //function to check authentication
  const checkAuthentication = async () => {
    try {
      // Make a request to your backend to check authentication
      const response = await fetch('/api/check-auth');
      if (response.ok) {
        login();
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LogIn on authenticationComplete={loggedIn}/>} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/loggedin" element={isAuthenticated ? <LoggedInUser /> : <Navigate to="/signup"/>} />
          
          <Route
            path="/"
            element={
              
              <div id="container">
                <nav>
                  <ul className="nav-links">
                    <li>
                      <Link to = "/login" className="nav-button">Log In</Link>
                    </li>
                    <li>
                      <Link to="/signup" className="nav-button">Sign Up</Link>
                    </li>
                    <li>
                      <Link to="/loggedin" className="nav-button">Logged In</Link>
                    </li>
                  </ul>
                </nav>
                <script src="script.js"></script>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;