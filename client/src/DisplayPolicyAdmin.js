// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function DisplayPolicyAdmin() {
    //name of list being edited
    const {policyName} = useParams();
    //policies
    const [p, setP] = useState('');
    const navigate = useNavigate();

    useEffect(()=>{
        console.log('policy:' + policyName)
        if(policyName ==="AUP"){
            console.log('AUP');
            const fetchInitialText = async () => {
                try {
                  const response = await fetch(`/api/getAUP`);
                  if (!response.ok) {
                    throw new Error('Request failed');
                  }
                  const data = await response.json();
                  setP(data.text);
                } catch (error) {
                  console.error('Error:', error);
                  return null; // Handle the error gracefully
                }
              };
              fetchInitialText();
        }else if(policyName ==="Security"){
            const fetchSecurity = async () => {
                try {
                  const response = await fetch(`/api/getSecurity`);
                  if (!response.ok) {
                    throw new Error('Request failed');
                  }
                  const data = await response.json();
                  setP(data.text);
                } catch (error) {
                  console.error('Error:', error);
                  return null; // Handle the error gracefully
                }
              };
              fetchSecurity();
        }else if(policyName ==="DMCA"){
            const fetchDMCAPolicy = async () => {
                try {
                  const response = await fetch(`/api/getDMCAPolicy`);
                  if (!response.ok) {
                    throw new Error('Request failed');
                  }
                  const data = await response.json();
                  setP(data.text);
                } catch (error) {
                  console.error('Error:', error);
                  return null; // Handle the error gracefully
                }
              };
              fetchDMCAPolicy();
        }else if(policyName ==="DMCATakedown"){
            const fetchDMCAPolicy = async () => {
                try {
                  const response = await fetch(`/api/getDMCATakedown`);
                  if (!response.ok) {
                    throw new Error('Request failed');
                  }
                  const data = await response.json();
                  setP(data.text);
                } catch (error) {
                  console.error('Error:', error);
                  return null; // Handle the error gracefully
                }
              };
              fetchDMCAPolicy();
        }
      },[]);

  
  return (
    <div>
        <h2 id="title">{policyName}</h2>
        <button onClick={() =>navigate("/loggedinAdmin")}>Done</button>
        <p>{p}</p>
    </div>
    
  );
}

export default DisplayPolicyAdmin;
