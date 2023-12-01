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
  //search related
  const [pattern, setPattern] = useState('name');
  const [field, setField] = useState('');
  const [searchResultIds, setSearchResultIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Your Search Results will be displayed here...');
  //temporary array to hold search results
  const listItems = [];
  //drop down
  const [dropdownStates, setDropdownStates] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  useEffect(() => {
    //displays search results
    displaySearch();
  }, [searchResults]);

  
  //function to check authentication
//   const checkAuthentication = async () => {
//     try {
//       // Make a request to your backend to check authentication
//       const response = await fetch('/api/check-auth');
//       if (response.ok) {
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('Error checking authentication:', error);
//       setIsAuthenticated(false);
//     }
//   };

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
  const searchSuperheroes = async (criteria) => {
    try {
      setSearchResults([]);
      const response = await fetch(`/api/search/${pattern}/${field}/5`);
      if (!response.ok) {
        //if no heroes found, displays message
        setErrorMessage('No Heroes Found . . .');
        setSearchResultIds([]);
        //if heroes found
      }else{
        const data = await response.json();
        setSearchResultIds(data.ids);
        setErrorMessage('Loading...');
        await displayHeroes(data);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // //displays search results
  // const displaySearch = () =>{
  //   if(searchResults){
  //     return (
  //       <ul>
  //         {searchResults.map((item, index) => React.cloneElement(item, { key: index }))}
  //       </ul>
  //     );
  //   }
    
  // }

  //gives heroes attributes and pushes them to search results
  const displayHeroes = async (data) => {
    for (const i of data.ids) {
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
  const loggedIn = () =>{
    login();
  }

  //function to check authentication
  const checkAuthentication = async () => {
    try {
      const response = await fetch('/api/check-auth');
      if (response.ok) {
        //set 'isAuthenticated' to true
        login();
      } else {
        //set 'isAuthenticated' to false
        logout();
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      logout();
    }
  };

  // Function to handle dropdown click
  const toggleDropdown = (event, index) => {
    event.stopPropagation();
    setDropdownStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };

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
                {/* Add an arrow for each list item */}
                <span className="dropdownArrow" onClick={(event) => toggleDropdown(event, index)}>
                  ▼
                </span>
              </li>
              {/* Conditionally render the dropdown content based on the state */}
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
                  Weight: {item.props.weight}
                  </span>
                  {/* Your dropdown content goes here */}
                </div>
              )}
            </div>
          ))}
        </ul>
      );
    }
  };

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LogIn on authenticationComplete={loggedIn}/>} />
          <Route path="/signup" element={<SignUp on authenticationComplete={loggedIn}/>} />
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
                  </ul>
                </nav>
                <h1>SuperHeroes Hub</h1>
                <div id="topSection">
                  {/* Top Left: Search Superheroes */}
                  <div id="searchSuperheroes">
                  <h2>Search Superheroes</h2>
                  <form id="searchForm" onSubmit={handleSearch}>
                      <label htmlFor="searchInput">Search by:</label>
                      <select id="searchCategory">
                      <option value="name">Name</option>
                      <option value="race">Race</option>
                      <option value="publisher">Publisher</option>
                      <option value="power">Power</option>
                      </select>
                      <input
                      type="text"
                      id="searchInput"
                      value={field}
                      onChange={(e) => setField(e.target.value)}
                      placeholder="Search . . ."
                      />
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
                  <div id="favoriteHeroes">
                  <h2>Public Lists</h2>
                  <div id="addedListsResults">
                      <ul>Your Heroes will be displayed here...</ul>
                  </div>
                  </div>
              </div>
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