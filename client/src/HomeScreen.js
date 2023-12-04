// App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css'; // Import your CSS file
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';
import LoggedInUser from './LoggedInUser.js';
import ListInfo from './FavListInfo.js';
import ListDisplay from './ListDisplay.js';
import App from './App.js';
import ListDisplayLoggedIn from './ListDisplayLoggedIn.js';
import UpdatePass from './UpdatePass.js';
import ListDisplayAdmin from './ListDisplayAdmin.js';
import LoggedInAdmin from './LoggedInAdmin.js';
import DisableAccounts from './DisableAccounts.js';
import VerifiedEmail from './VerifiedEmail.js';
import VerifyEmail from './VerifyEmail.js';
import { useAuth, AuthProvider } from './authContext';


function HomeScreen() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/verifyEmail" element={<VerifyEmail/>} />
          <Route path="/verifiedEmail" element={<VerifiedEmail/>} />
          <Route path="/login" element={<LogIn/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/listInfo/:listName" element={<ListInfo/>}/>
          <Route path ="/listDisplay/:listName" element={<ListDisplay/>}/>
          <Route path ="/listDisplayAndReview/:listName" element={<ListDisplayLoggedIn/>}/>
          <Route path = "/home" element={<App/>}/>
          <Route path = "/accountCentre" element={<DisableAccounts/>}/>
          <Route path ="/updatePassword" element={<UpdatePass/>}/>
          <Route path ="/listDisplayAdmin/:listName" element={<ListDisplayAdmin/>}/>
          <Route path="/loggedin" element={<LoggedInUser />} />
          <Route path="/loggedinAdmin" element={<LoggedInAdmin/>}/>
          
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
                  </ul>
                </nav>
                <h1>SuperHeroes Hub</h1>
                  {/* Top Right: Favorite Lists */}
                  <div>
                  <h2>About Us</h2>
                  <p>Welcome to the SuperHeroes Hub, your go-to platform for exploring and organizing information about your favourite superheroes! Discover a vast database, create personalized lists, and engage in a vibrant community. With features like advanced search, user-created lists, and reviews, our app caters to both casual fans and dedicated enthusiasts. Dive into the world of superheroes with confidence, knowing that our system ensures a secure and respectful environment. Explore, connect, and unleash your superhero knowledge with the Superheroes App!</p>
                  </div>
                  <li id="getStarted">
                      <Link to = "/home" className="nav-button">Get Started!</Link>
                    </li>
                <script src="script.js"></script>
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default HomeScreen;