// App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import './styles/App.css'; // Import your CSS file
import LogIn from './pages/Guest/LogIn.js';
import SignUp from './pages/Guest/SignUp.js';
import LoggedInUser from './pages/User/LoggedInUser.js';
import ListInfo from './pages/User/FavListInfo.js';
import ListDisplay from './pages/Guest/ListDisplay.js';
import Home from './pages/Guest/Home.js';
import ListDisplayLoggedIn from './pages/User/ListDisplayLoggedIn.js';
import UpdatePass from './pages/User/UpdatePass.js';
import ListDisplayAdmin from './pages/Admin/ListDisplayAdmin.js';
import LoggedInAdmin from './pages/Admin/LoggedInAdmin.js';
import DisableAccounts from './pages/Admin/DisableAccounts.js';
import VerifiedEmail from './pages/User/VerifiedEmail.js';
import VerifyEmail from './pages/User/VerifyEmail.js';
import DisplayPolicy from './pages/Guest/DisplayPolicy.js';
import DisplayPolicyUser from './pages/User/DisplayPolicyUser.js';
import Footer from './components/Footer.js';


function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/verifyEmail" element={<VerifyEmail/>} />
          <Route path="/verifiedEmail" element={<VerifiedEmail/>} />
          <Route path="/displayPolicy/:policyName" element={<DisplayPolicy/>} />
          <Route path="/displayPolicyUser/:policyName" element={<DisplayPolicyUser/>} />
          <Route path="/login" element={<LogIn/>} />
          <Route path="/signup" element={<SignUp/>} />
          <Route path="/listInfo/:listName" element={<ListInfo/>}/>
          <Route path ="/listDisplay/:listName" element={<ListDisplay/>}/>
          <Route path ="/listDisplayAndReview/:listName" element={<ListDisplayLoggedIn/>}/>
          <Route path = "/" element={<Home/>}/>
          <Route path = "/accountCentre" element={<DisableAccounts/>}/>
          <Route path ="/updatePassword" element={<UpdatePass/>}/>
          <Route path ="/listDisplayAdmin/:listName" element={<ListDisplayAdmin/>}/>
          <Route path="/loggedin" element={<LoggedInUser />} />
          <Route path="/loggedinAdmin" element={<LoggedInAdmin/>}/>
        </Routes>
        <Footer />
      </Router>
      
    </div>
  );
}

export default App;