// Login.js
import React from 'react';
import { Link } from "react-router-dom";

function SignUp() {
  // Your login component logic goes here
  return (
    <div>
        <nav>
            <ul className="nav-links">
                <li>
                  <Link to = "/" className="nav-button">Home</Link>
                </li>
            </ul>
        </nav>
      <h2>Sign Up Page</h2>
      {/* Add your login form or content here */}
    </div>
  );
}

export default SignUp;