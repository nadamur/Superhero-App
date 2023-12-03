// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './authContext';
import './App.css'; // Import your CSS file
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';


function LoggedInUser() {
  //authentication
  const [logInStatus, setLogInStatus] = useState("");
  const [loggedInNickname, setLoggedInNickname] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const navigate = useNavigate();
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
  //temporary array to hold selected results
  const selectedListItems = [];
  //sorting lists
  const [sortedSearchResults, setSortedSearchResults] = useState([]);
  //selection
  const [selectedResults, setSelectedResults] = useState([]);
  const selectedItemsRef = useRef([]);
  //fav lists
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [listNameToDelete, setListNameToDelete] = useState(favoriteLists.length > 0 ? favoriteLists[0] : '');
  const [listNameToAdd, setListNameToAdd] = useState(favoriteLists.length > 0 ? favoriteLists[0] : '');
  //drop down
  const [dropdownStates, setDropdownStates] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  //public lists
  const [publicLists, setPublicLists] = useState([]);
  const [publicListsDropDown, setPublicListsDropDown] = useState([]);

  //useEffect to make sure the user is authenticated and check logged in user, only runs at mount
  useEffect(()=>{
    checkAuthentication();
    checkUser();
  },[])



  //runs when user is successfully logged in in order to find appropriate list names
  useEffect(() => {
    //displats public lists
    displayPublicLists();
    //sets favorite lists from back end
    getFavLists();
    //displays search results
    displaySearch();
    //sets up initial values
    setListNameToAdd(favoriteLists.length > 0 ? favoriteLists[0] : '');
    setListNameToDelete(favoriteLists.length > 0 ? favoriteLists[0] : '');
  }, [searchResults, favoriteLists, logInStatus]);

  useEffect(() => {
    const fetchLists = async () => {
        const listsArray = await displayPublicLists();
        setPublicLists(listsArray);
      };
      fetchLists();
  }, [publicListsDropDown]);


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

  //function to add selected items to a fav list
  const addSelectedHeroesToList= async (event) =>{
    event.preventDefault();
    const url = `/api/lists/add/${listNameToAdd}?ids=${selectedResults}`;
    try{
      const response = await fetch(url, {
        method: 'PUT',
      });
      if (response.status === 200) {
        console.log('List created successfully');
        // clear selectedItemsRef
        selectedItemsRef.current.forEach((selectedItem) => {
          selectedItem.classList.remove('selected');
        });
        selectedItemsRef.current = [];
        setSelectedResults([]);
      } else if (response.status === 404) {
        console.log('List name already exists');
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //function to delete a list
  const deleteList= async (event) =>{
    event.preventDefault();
    const url = `/api/lists/delete/${listNameToDelete}`;
    try{
      const response = await fetch(url, {
        method: 'PUT',
      });
      if (response.status === 200) {
        console.log('List deleted successfully');
        //temporary list
        const tempFavList = favoriteLists.slice();
        const indexOfName = favoriteLists.indexOf(listNameToDelete);
        tempFavList.splice(indexOfName,1);
        setFavoriteLists(tempFavList);
      } else if (response.status === 404) {
        console.log('List name does not exist');
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //function to create new list --> defaults to private, includes username
  const createList= async () =>{
    const listName = prompt('Enter the name for the new list: ');
    if(listName){
      //name needs to be between 3 and 50 characters
      if (listName.length < 3 || listName.length > 50) {
        alert('List name should be between 3 and 50 characters.');
      }
      //name can only have letters, numbers and spaces
      else if (!/^[a-zA-Z0-9\s-]+$/.test(listName)) {
        alert('List name can only contain letters numbers and spaces.');
      }else{
        const url = `/api/lists/${listName}`;
        try{
          const response = await fetch(url, {
            method: 'POST',
          });
          if (response.status === 201) {
            console.log('List created successfully');
          } else if (response.status === 404) {
            alert('List name already exists, try again');
          } else {
            console.error('Error in creating list', response.status);
          }
        } catch (error) {
          console.error('Error in creating list:', error);
          }
          const prevFavLists = favoriteLists;
          setFavoriteLists([...prevFavLists, listName]);
      }
    }
  }

  //function to add a result to 'selectedResults' list once it has been selected
  const selectResults = (event) => {
    event.preventDefault();
    const listItem = event?.target?.closest('li');
    if (listItem) {
      const id = listItem.id;
      setSelectedResults((prevSelectedResults) => {
        if (prevSelectedResults.includes(id)) {
          listItem.classList.remove('selected');
          // Remove the element from selectedItemsRef
          selectedItemsRef.current = selectedItemsRef.current.filter(
            (selectedItem) => selectedItem !== listItem
          );
          return prevSelectedResults.filter((itemId) => itemId !== id);
        } else {
          listItem.classList.add('selected');
          // Add the element to selectedItemsRef
          selectedItemsRef.current = [...selectedItemsRef.current, listItem];
          return [...prevSelectedResults, id];
        }
      });
    }
  }
//function to remove all items from selected list
  const resetSelectedResults= () =>{
    selectedListItems.forEach((result)=>{
      result.classList.remove("selected");
    })
    setSelectedResults([]);
  }

  //changes listNameToAdd variable to the currently selected list
  const listAddNameChange= (event) =>{
    const selectedList = event.target.value;
    setListNameToAdd(selectedList);
  }

  //changes listNameToDelete variable to the currently selected list
  const listDeleteNameChange= (event) =>{
    const selectedList = event.target.value;
    setListNameToDelete(selectedList);
  }

  const displayFavHeroes= () =>{

  }



  //function to return fav list names
  const getFavLists = async () => {
    // fetch the list names
    try {
      const res = await fetch(`/api/lists/fav/names`, {
        headers:{
          "x-access-token":localStorage.getItem("token")
        }
      });
      if (!res.ok){
        throw new Error('Request failed');
      }
      const data = await res.json();
      // compare the new list with the current list
      if (!arraysAreEqual(data.listNames, favoriteLists)) {
        // set list names as 'favoriteLists' array only if there are changes
        setFavoriteLists(data.listNames);
      }
    } catch (error) {
      console.error('Error fetching favorite lists:', error);
    }
  };

  // helper function to compare two arrays -- to stop 'favoriteLists' from being updated in a loop
  const arraysAreEqual = (array1, array2) => {
    if (array1.length !== array2.length) {
      return false;
    }

    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  };

   //function to return publisher names
  const displayPublishers = async () => {
    //fetch publisher names
    try {
      const res = await fetch('api/publishers');
      if (!res.ok){
        throw new Error('Request failed');
      }
      const data = await res.json();
      const uniqueData = new Set(data);
      const uniqueDataArray = [...uniqueData];
      const joinedNames = uniqueDataArray.join(', ');
      //alerts the publisher names
      alert(joinedNames);
    } catch (error) {
      console.error('Error fetching favorite lists:', error);
    }
  };
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

  //display list info
  const displayList = (name)=>{
    const n = name;
    navigate(`/listDisplayAndReview/${n}`);
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
    const n = 10;
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

  //displays search results
  const displaySearch = () => {
    if (searchResults) {
      return (
        <ul>
          {searchResults.map((item, index) => (
            <div key={index} className="searchResult">
              <li key={index} id={index} name={item.props.name} race={item.props.Race} publisher={item.props.Publisher} className ={selectedResults.includes(index) ? 'selected' : ''}>
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
                  Weight: {item.props.weight},
                  Powers: {item.props.power === 'No Powers' ? 'None' : item.props.power.length > 1 ? item.props.power.join(', ') : item.props.power}
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

  //function to display public lists
  const displayPublicLists = async () =>{
    try {
      const response = await fetch(`/api/lists`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      
      const listsArray = await Promise.all(data.lists.map(async(list, index) => {
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
              <span style={{ fontSize: '14px' }}>Creator: {list.creatorNickname}, # of Heroes: {numberOfIds}</span>
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
  
  // Function to handle dropdown click
  const toggleDropdown = (event, index) => {
    event.stopPropagation();
    setDropdownStates((prevStates) => {
      const newStates = [...prevStates];
      newStates[index] = !newStates[index];
      return newStates;
    });
  };
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
        <li key={i} id={i} name={hero.name} race={hero.Race} publisher={hero.Publisher} className ={selectedResults.includes(i) ? 'selected' : ''}>
          <strong style={{ color: '#007acc' }}>{hero.name} </strong>
          <br />
          <span style={{ fontSize: '14px' }}>
            Powers: {Array.isArray(powers.powers) && powers.powers.length > 0
              ? powers.powers.join(', ')
              : 'None'}
          </span>
          {heroAttributes}
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

     // Function to handle dropdown click for public lists
     const toggleDropdownPublic = (event, index) => {
      event.stopPropagation();
      setPublicListsDropDown((prevStates) => {
        const newStates = [...prevStates];
        newStates[index] = !newStates[index];
        return newStates;
      });
    }
  
  //logs user out
  const logOut = async () => {
    try {
      const response = await fetch(`/logout`);
      if (!response.ok) {
        //if no heroes found, displays message
        console.log("Error logging out");
      }else{
        //remove token from local storage
        localStorage.removeItem("token");
        navigate('/');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  //edit clicked list button
  const editList = (name)=>{
    const n = name;
    navigate(`/listInfo/${n}`);
  }

  return (
    <div id="container">
    <nav>
        <ul className="nav-links">
        <li>
            <button className="nav-button" onClick={logOut}>Log Out</button>
        </li>
        <li id="welcomeMessage">Welcome, {loggedInNickname}</li>
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
        <div id="favoriteLists">
        <h2>Favourite Lists</h2>
        <button id="addListButton" onClick={createList}>Add List</button>
        <form id="deleteForm">
            <label htmlFor="listNamesToDelete">Delete List:</label>
            <select id="listNamesToDelete" onChange={listDeleteNameChange} className="select-styled">
            {favoriteLists.map((listName) => (
                <option key={listName}>{listName} </option>
            ))}
            </select>
            <button type="submit" id="deleteListButton" onClick={(e)=>{deleteList(e)}}>
            Delete
            </button>
        </form>
        <ul id="favouriteLists">
            {favoriteLists.map((listName) => (
            <button key={listName} onClick={()=>editList(listName)}>{listName}</button>
            ))}
        </ul>
        </div>
    </div>
    <div id="bottomSection">
    {/* Bottom Left: Sort List */}
        <div id="sortList">
        <h2>Sort List: <span id="listName"></span></h2>
        <form id="listsForm">
            <label htmlFor="listNames">Add Selected Heroes to:</label>
            <div className="select-container">
            <select id="listNames" onChange={listAddNameChange} className="select-styled">
                {favoriteLists.map((listName) => (
                <option key={listName}>{listName}</option>
                ))}
            </select>
            </div>
            <button type="submit" id="listAddButton" onClick={addSelectedHeroesToList}>
            Add
            </button>
        </form>
        {/* Your existing buttons for sorting */}
        <button id="sortByName" onClick={() => { sortResults('name') }}>Sort by Name</button>
        <button id="sortByRace" onClick={() => { sortResults('race') }}>Sort by Race</button>
        <button id="sortByPublisher" onClick={() => { sortResults('publisher') }}>Sort by Publisher</button>
        <button id="sortByPower" onClick={() => { sortResults('power') }}>Sort by Power</button>
        <div id="resultsContainer">
        {/* Display Search Results */}
        <div id="searchResults" onClick={selectResults}>
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
        </div>
        </div>
    </div>


    {/* Other sections go here */}
    <div id="footer">
        <label htmlFor="FAQ">FAQ: What Publishers are available</label>
        <button id="FAQ" onClick={() => { displayPublishers() }}>Available Publishers</button>
        {/* <button onClick={test}>Test</button> */}
    </div>
    <script src="script.js"></script>
    </div>
  );
}

export default LoggedInUser;