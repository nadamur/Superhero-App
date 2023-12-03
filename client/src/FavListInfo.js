// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function ListInfo() {
     //drop down
    const [dropdownStates, setDropdownStates] = useState([]);
    //name of list being edited
    const {listName} = useParams();
    //list details
    const [visibility, setVisibility] = useState("Private");
    const [description, setDescription] = useState("");
    const [lastModified, setLastModified] = useState("");
    const [ids, setIds] = useState([]);
    //authentication
    const [logInStatus, setLogInStatus] = useState("");
    //user info
    const [loggedInNickname, setLoggedInNickname] = useState("");
    const [loggedInEmail, setLoggedInEmail] = useState("");
    const [heroes, setHeroes] = useState([]);

    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
        getListInfo();
        // checkAuthentication();
        // checkUser();

    }, []);

    useEffect(() => {
       console.log('desc: ' + description);
    }, [description]);

    // Function to handle dropdown click
    const toggleDropdown = (event, index) => {
        event.stopPropagation();
        setDropdownStates((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = !newStates[index];
        return newStates;
        });
    };

    const getListInfo = async () =>{
        try {
            const response = await fetch(`/api/lists/info/${listName}`);
            if (!response.ok) {
              throw new Error('Request failed');
            }
            const data = await response.json();
            console.log('data desc: ' + data.description);
            setDescription(data.description);
            setIds(data.ids);
            setLastModified(data.lastModified);
            setVisibility(data.visibility);
          } catch (error) {
            console.error('Error:', error);
            return null; // Handle the error gracefully
          }
    }

    //function to get all hero info
  const getHero = async (id) => {
    try {
      const response = await fetch(`/api/superheroes/${id}`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null; // Handle the error gracefully
    }
  }

  //function to get all hero powers
  const getPowers = async (id) => {
    try {
      const response = await fetch(`/api/superheroes/${id}/power`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null; // Handle the error gracefully
    }
  }


    const displayHeroes = async () =>{
        const heroesArray = [];
        for (const i of ids) {
        const hero = await getHero(i);
        const powers = await getPowers(i);
        const heroAttributes = Object.entries(hero)
        .filter(([key]) => key !== 'id') // exclude the "id" property
        .map(([key, value]) => (
          <span key={key} style={{ fontSize: '14px' }}>{`${key}: ${value}, `}</span>
        ));

        heroesArray.push(
            <div key ={i}>
            <li key={i} id={i} name={hero.name} race={hero.Race} publisher={hero.Publisher}>
            <button id="deleteButton" onClick={() => deleteHero(hero.id)}>Delete Hero</button>
            <strong style={{ color: '#007acc' }}>{hero.name} </strong>
            <br />
            <span style={{ fontSize: '14px' }}>Publisher: {hero.Publisher}</span>
            <span className="dropdownArrow" onClick={(event) => toggleDropdown(event, i)}>
                  ▼
            </span>
            </li> 
            {dropdownStates[i] && (
                <div className="dropdownContent">
                  {heroAttributes}
                  {/* Your dropdown content goes here */}
                </div>
              )}
            </div>
        );
        }
        return heroesArray;
        }

    useEffect(() => {
        const fetchHeroes = async () => {
            const heroesArray = await displayHeroes();
            setHeroes(heroesArray);
        };
        fetchHeroes();
        displayHeroes();
    }, [ids, dropdownStates]);

    //slider
    const handleSliderChange= () =>{
        setVisibility((prevOption)=>
            prevOption === "Private" ? "Public" : "Private"
        );
    }

    //delete hero from list
    const deleteHero= async (id) =>{
    console.log(listName);
    console.log(id);
    const url = `/api/lists/delete/hero/${listName}?id=${id}`;
    try{
      const response = await fetch(url, {
        method: 'PUT',
      });
      if (response.status === 200) {
        //if deleted in database, delete in temporary array here as well
        const tempIds = ids.slice();
        const indexToDelete = tempIds.indexOf(String(id));
        tempIds.splice(indexToDelete,1);
        setIds(tempIds);
      } else if (response.status === 404) {
        console.log(response.message);
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    }
    

    //update list visibility and description
    const updateInfo= async () =>{
        console.log("updating info");
        try{
        const res = await fetch(`/api/lists/info/${listName}`, { 
            method: 'PUT', 
            body: JSON.stringify( { visibility, description  }),
            headers: {'Content-Type': 'application/json'}
          });
          if (res.status === 200) {
            //if updated, update info to show new lastModified date
            getListInfo();
            console.log("Successfully updated");
          } else if (res.status === 404) {
            console.log(res.message);
          } else {
            console.error('Error:', res.status);
          }
        } catch (error) {
          console.error('Error:', error);
        }
        }


  //check authentication
  const checkAuthentication = async () => {
    let tempLogInStatus = "";
    try {
      const response = await fetch(`/login`);
      if (!response.ok) {
        //if no heroes found, displays message
        console.log("Error fetching log in status");
      }else{
        const data = await response.json();
        //when it receives data, sets logInStatus to true or false depending on response
        tempLogInStatus = data.loggedIn;
        setLogInStatus(tempLogInStatus);
        if(!tempLogInStatus){     
          navigate("/login");
        }
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

    //check current user
    const checkUser = async ()=>{
        try {
          const response = await fetch(`/getUser`, {
            headers:{
              "x-access-token":localStorage.getItem("token")
            }
          });
          if (!response.ok) {
            //if no heroes found, displays message
            console.log("Error fetching log in status");
          }else{
            const data = await response.json();
            //when it receives data, sets logInStatus to true or false depending on response
            if(data){
              setLoggedInNickname(data.nickname);
              setLoggedInEmail(data.email);
            }
          }
        } catch (error) {
          console.error('Error:', error);
        }
      }

  
  return (
    <div>
        <h2 id="title">List Info</h2>
        <div>
        <div className = "signUpContainer">
        <div className="slider-container">
            <label htmlFor="option" id ="visibilityText">Visibility: </label>
            <div className={`slider ${visibility === 'Private' ? 'slide-right' : ''}`}>
            <div className="option">{visibility}</div>
        </div>
            <button className="slider-button" onClick={handleSliderChange}>
                Switch
            </button>
            </div>
            <label htmlFor="descriptionInput">Description: </label>
            <input
              type="text"
              id="descriptionInput"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="..."
            />
            <ul>Last Modified: {lastModified}</ul>
            <div id="heroResults">
                <ul>Heroes: </ul>
            {heroes.length > 0 && <ul>{heroes}</ul>}
            </div>
            <button onClick={updateInfo}>Confirm</button>
            <button onClick={() =>navigate("/loggedin")}>Done</button>
            </div>
        </div>
    </div>
  );
}

export default ListInfo;
