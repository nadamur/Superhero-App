import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Footer() {
    const [tempLogInStatus, setTempLogInStatus] = useState("");
    //check type of user
    useEffect(() => {
        checkAuthentication();
      }, [tempLogInStatus]);

        //check authentication
    const checkAuthentication = async () => {
        try {
        const response = await fetch(`/login`);
        if (!response.ok) {
            //if no heroes found, displays message
            console.log("Error fetching log in status");
        }else{
            const data = await response.json();
            //when it receives data, sets logInStatus to true or false depending on response
            setTempLogInStatus(data.loggedIn);
            console.log(tempLogInStatus);
        }
        } catch (error) {
        console.error('Error:', error);
        }
    };
    if(tempLogInStatus){
        return (
            <div id="footer">
                <Link to="/displayPolicyUser/Security">
                    <button id="FAQ" >Security and Privacy Policy</button>
                </Link>
                <Link to="/displayPolicyUser/DMCA">
                    <button id="FAQ">DMCA Notice & Takedown Policy</button>
                </Link>
                <Link to="/displayPolicyUser/AUP">
                    <button id="FAQ">AUP</button>
                </Link>
            </div>
          )
    }else{
        return (
            <div id="footer">
                <Link to="/displayPolicy/Security">
                    <button id="FAQ" >Security and Privacy Policy</button>
                </Link>
                <Link to="/displayPolicy/DMCA">
                    <button id="FAQ">DMCA Notice & Takedown Policy</button>
                </Link>
                <Link to="/displayPolicy/AUP">
                    <button id="FAQ">AUP</button>
                </Link>
            </div>
          )
    }

}

export default Footer;