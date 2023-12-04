// App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';
import LoggedInUser from './LoggedInUser.js';
import ListInfo from './FavListInfo.js';
import ListDisplay from './ListDisplay.js';
import { useAuth, AuthProvider } from './authContext';
import './App.css'; // Import your CSS file


function App() {
  const navigate = useNavigate();
  const [DDGURL,setDDGURL] = useState('');
  //authentication, defaults to false
  const [logInStatus, setLogInStatus] = useState("");
  //policies
  const [AUP, setAUP] = useState('');
  const [security, setSecurity] = useState('');
  const [DMCAPolicy, setDMCAPolicy] = useState('');
  //const {isAuthenticated, login, logout} = useAuth();
  //search related
  const [raceInput, setRaceInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [publisherInput, setPublisherInput] = useState('');
  const [powerInput, setPowerInput] = useState('');
  const [searchResultIds, setSearchResultIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Your Search Results will be displayed here...');
  //temporary array to hold search results
  const listItems = [];
  //drop down
  const [dropdownStates, setDropdownStates] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  //public lists
  const [publicLists, setPublicLists] = useState([]);
  const [publicListsDropDown, setPublicListsDropDown] = useState([]);

  useEffect(() => {

    checkAuthentication();
    //displays search results
    displaySearch();
    //displays public lists
    displayPublicLists();
  }, [searchResults]);

  useEffect(() => {
    const fetchLists = async () => {
        const listsArray = await displayPublicLists();
        setPublicLists(listsArray);
      };
      fetchLists();
  }, [publicListsDropDown]);
  
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
       setLogInStatus(data.loggedIn);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateAverage = (array) => {
    if (array.length === 0) {
      return 0; // or handle as needed for your specific case
    }
  
    const numericValues = array.map((value) => parseFloat(value));
    const sum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const average = sum / numericValues.length;
  
    return average;
  };
  
  

    //function to display public lists
    const displayPublicLists = async () =>{
      try {
        const response = await fetch(`/api/lists`);
        if (!response.ok) {
          throw new Error('Request failed');
        }
        const data = await response.json();

        
        const listsArray = await Promise.all(data.lists.map(async(list, index) => {
          const ratings = list.ratings;
          const avgRating = calculateAverage(ratings);
          const numberOfIds = list.ids.length;
          const ids = list.ids;
          const heroesInfo = await Promise.all(ids.map(async(i)=>{
            const hero = await getHero(i);
            const powers = await getPowers(i);
            return (
              <p key ={i}> 
              Name: {hero.name}, Powers: {powers.powers === 'No Powers' ? 'None' : powers.length > 1 ? powers.powers.join(', ') : powers.powers}, Publisher: {hero.Publisher}</p>
            );
          }));
          return (
            <div key={index}>
              <li key={index} name={list.name} nickname={list.creatorNickname}>
                <strong style={{ color: '#007acc' }}>{list.name} </strong>
                <br />
                <span style={{ fontSize: '14px' }}>Creator: {list.creatorNickname}, # of Heroes: {numberOfIds}, Average Rating: {avgRating}</span>
                <span className="dropdownArrow" onClick={(event) => toggleDropdownPublic(event, index)}>
                  ▼
                </span>
                {publicListsDropDown[index] && (
                  <div className="dropdownContent">
                    <span>
                      Description: {list.description}, Heroes:
                    </span>
                    <span>{heroesInfo}</span>
                    <button onClick={()=>displayList(list.name)}>Display Heroes Info</button>
                  </div>
                )}
              </li>
            </div>
          );
        }));
        return listsArray;
      } catch (error) {
        console.error('Error:', error);
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

  //function to retrieve ids of heroes that match search
  //get search results from each individual search box, then find matching results and only display those
  const searchSuperheroes = async () => {
    //number of results
    const n = 20;
    //temporary arrays to hold results for each search
    const nameIds = [];
    const raceIds = [];
    const publisherIds = [];
    const powerIds = [];
    const ids = [];
    //name search
    //if empty name, send without field
    if(nameInput === ''){
      try {
        setSearchResults([]);
        const response = await fetch(`/api/search/name/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No name results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            nameIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }else{
      try {
        setSearchResults([]);
        const response = await fetch(`/api/search/name/${nameInput}/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No name results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            nameIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    

    //race search
    //if race empty, send without field
    if(raceInput===''){
      try {
        const response = await fetch(`/api/search/race/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No race results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            raceIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
    else{
      try {
        const response = await fetch(`/api/search/race/${raceInput}/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No race results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            raceIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    //publisher search
    if(publisherInput===''){
      try {
        const response = await fetch(`/api/search/publisher/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No publishers results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            publisherIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }else{
      try {
        const response = await fetch(`/api/search/publisher/${publisherInput}/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No publishers results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            publisherIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    //power search
    if(powerInput===''){
      try {
        const response = await fetch(`/api/search/power/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No powers results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            powerIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }else{
      try {
        const response = await fetch(`/api/search/power/${powerInput}/${n}`);
        if (!response.ok) {
          //if no heroes found, displays message
          console.log("No powers results");
        }else{
          const data = await response.json();
          setErrorMessage('Loading...');
          for(const id of data.ids){
            powerIds.push(id);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

    //final ids
    for (const id of nameIds){
      if(raceIds.includes(id) && powerIds.includes(id) && publisherIds.includes(id)){
        ids.push(id);
      }
    }
    setSearchResultIds(ids);
    //display heroes
    await displayHeroes();
    setErrorMessage('');
  };


    //display list info
    const displayList = (name)=>{
      const n = name;
      navigate(`/listDisplay/${n}`);
    }


  //gives heroes attributes and pushes them to search results
  const displayHeroes = async () => {
    for (const i of searchResultIds) {
      const hero = await getHero(i);
      const powers = await getPowers(i);
      const heroAttributes = Object.entries(hero)
        .filter(([key]) => key !== 'id') // exclude the "id" property
        .map(([key, value]) => (
          <span key={key} style={{ fontSize: '14px' }}>{`${key}: ${value}, `}</span>
        ));
  
      let listItem = (
        <li key={i} id={i} name={hero.name} race={hero.Race} publisher={hero.Publisher} gender = {hero.Gender} eye = {hero['Eye color']} hair = {hero['Hair color']} height = {hero.Height} skin = {hero['Skin color']} alignment = {hero.Alignment} weight = {hero.Weight}>
          <strong style={{ color: '#007acc' }}>{hero.name} </strong>
          <br />
          <span style={{ fontSize: '14px' }}>
            Publisher: {hero.Publisher}
          </span>
        </li>
      );
      if (powers !== 'No Powers') {
        listItem = React.cloneElement(listItem, { power: powers.powers });
      }
      listItems.push(listItem);
    }
    setSearchResults(listItems);
  };
  
  //sorts results based on criteria
  const sortResults = (criteria) =>{
    const sortedList = [...searchResults];
    sortedList.sort((a, b) => {
      switch (criteria){
        case 'name':
          const nameA = a.props.name;
          const nameB = b.props.name;
          return nameA.localeCompare(nameB);
        case 'race':
          const raceA = a.props.race;
          const raceB = b.props.race;
          return raceA.localeCompare(raceB);
        case 'publisher':
          const publisherA = a.props.publisher;
          const publisherB = b.props.publisher;
          return publisherA.localeCompare(publisherB);
        case 'power':
          const powerA = String(a.props.power);
          const powerB = String(b.props.power);
          return powerA.localeCompare(powerB);
      }
    });
    setSearchResults(sortedList);
  }

  //handles search/sort buttons
  const handleSearch = (event) => {
    event.preventDefault();
    searchSuperheroes();
  };

  //if LogIn page notifies us that login was successful, change 'isAuthenticated' to true immediately to allow access to main page
  // const loggedIn = () =>{
  //   login();
  // }

  // Function to handle dropdown click for search results
  const toggleDropdown = (event, index, heroName, heroPublisher) => {
    event.stopPropagation();
    setDropdownStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
    setDDGURL(`https://duckduckgo.com/?q=${heroName},${heroPublisher}&va=d&t=hh&ia=web`);
  };

    // Function to handle dropdown click for public lists
    const toggleDropdownPublic = (event, index) => {
      event.stopPropagation();
      setPublicListsDropDown((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = !newStates[index];
        return newStates;
      });
    }

  //display search results on every change
  const displaySearch = () => {
    if (searchResults) {
      return (
        <ul>
          {searchResults.map((item, index) => (
            <div key={index} className="searchResult">
              <li>
              <strong style={{ color: '#007acc' }}>{item.props.name} </strong>
              <br />
              <span style={{ fontSize: '14px' }}>
                Publisher: {item.props.publisher}
              </span>
                {/* add an arrow for each list item */}
                <span className="dropdownArrow" onClick={(event) => toggleDropdown(event, index, item.props.name, item.props.publisher)}>
                  ▼
                </span>
              </li>
              {/* conditionally render the dropdown content based on the state */}
              {dropdownStates[index] && (
                <div className="dropdownContent">
                  <span>
                  Gender: {item.props.gender}, 
                  Eye colour: {item.props.eye}, 
                  Race: {item.props.race}, 
                  Hair colour: {item.props.hair}, 
                  Height: {item.props.height}, 
                  Skin colour: {item.props.skin}, 
                  Alignment: {item.props.alignment}, 
                  Weight: {item.props.weight},
                  Powers: {item.props.power === 'No Powers' ? 'None' : item.props.power.length > 1 ? item.props.power.join(', ') : item.props.power}
                  </span>
                  <a id = "DDGButton" href= {DDGURL} target="_blank" rel="noopener noreferrer" >Search on DDG</a>
                </div>
              )}
              
            </div>
          ))}
        </ul>
      );
    }
  };

  return (
    
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
        <div id="topSection">
          {/* Top Left: Search Superheroes */}
          <div id="searchSuperheroes">
          <h2>Search Superheroes</h2>
          <form id="searchForm" onSubmit={handleSearch}>
          <div className="searchInputContainer">
              <label htmlFor="nameInput">Name:</label>
              <input
              type="text"
              id="nameInput"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Search by name . . ."
              />
              </div>
              <div className="searchInputContainer">
              <label htmlFor="raceInput">Race:</label>
              <input
              type="text"
              id="raceInput"
              value={raceInput}
              onChange={(e) => setRaceInput(e.target.value)}
              placeholder="Search by race . . ."
              />
              </div>
              <div className="searchInputContainer">
              <label htmlFor="publisherInput">Publisher:</label>
              <input
              type="text"
              id="publisherInput"
              value={publisherInput}
              onChange={(e) => setPublisherInput(e.target.value)}
              placeholder="Search by publisher . . ."
              />
              </div>
              <div className="searchInputContainer">
              <label htmlFor="powerInput">Power:</label>
              <input
              type="text"
              id="powerInput"
              value={powerInput}
              onChange={(e) => setPowerInput(e.target.value)}
              placeholder="Search by power . . ."
              />
            </div>
            <button type="submit" id="searchButton">
            Search
            </button>
          </form>
        
          </div>

          {/* Top Right: Favorite Lists */}
          <div id="AboutUs">
          <h2>About Us</h2>
          <p>Welcome to the SuperHeroes Hub, your go-to platform for exploring and organizing information about your favourite superheroes! Discover a vast database, create personalized lists, and engage in a vibrant community. With features like advanced search, user-created lists, and reviews, our app caters to both casual fans and dedicated enthusiasts. Dive into the world of superheroes with confidence, knowing that our system ensures a secure and respectful environment. Explore, connect, and unleash your superhero knowledge with the Superheroes App!</p>
          </div>
      </div>
      <div id="bottomSection">
      {/* Bottom Left: Sort List */}
          <div id="sortList">
          <h2>Heroes <span id="listName"></span></h2>
          <div id="resultsContainer">
          <button id="sortByName" onClick={() => { sortResults('name') }}>Sort by Name</button>
          <button id="sortByRace" onClick={() => { sortResults('race') }}>Sort by Race</button>
          <button id="sortByPublisher" onClick={() => { sortResults('publisher') }}>Sort by Publisher</button>
          <button id="sortByPower" onClick={() => { sortResults('power') }}>Sort by Power</button>
          {/* Display Search Results */}
          <div id="searchResults">
          <p>{errorMessage}</p>
          {displaySearch()}
          </div>
          </div>
          </div>
          {/* Bottom Right: Favorite Heroes */}
          <div id="publicLists">
          <h2>Public Lists</h2>
          <div id="publicListsResults">
          {<ul>{publicLists}</ul>}
          {/* {favoriteLists.map((listName) => (
            <ul key={listName}>{listName} </ul>
          ))} */}
          </div>
          </div>
          
      </div>
      <div id="footer">
        <button id="FAQ" onClick={() => { navigate('/displayPolicy/Security') }}>Security and Privacy Policy</button>
        <button id="FAQ" onClick={() => { navigate('/displayPolicy/DMCA') }}>DMCA Notice & Takedown Policy</button>

        <button id="FAQ" onClick={() => { navigate('/displayPolicy/AUP') }}>AUP</button>
    </div>
        <script src="script.js"></script>
      </div>
            
  );
}

export default App;