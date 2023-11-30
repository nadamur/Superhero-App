// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css'; // Import your CSS file
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';


function App() {
  //search related
  const [pattern, setPattern] = useState('name');
  const [field, setField] = useState('');
  const [searchResultIds, setSearchResultIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Your Search Results will be displayed here...');
  //temporary array to hold search results
  const listItems = [];
  //sorting lists
  const [sortedSearchResults, setSortedSearchResults] = useState([]);
  //selection
  const [selectedResults, setSelectedResults] = useState([]);
  //fav lists
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [listNameToDelete, setListNameToDelete] = useState([]);
  const [listNameToAdd, setListNameToAdd] = useState(favoriteLists.length > 0 ? favoriteLists[0] : '');

  useEffect(() => {
    setListNameToAdd(favoriteLists.length > 0 ? favoriteLists[0] : '');
    getFavLists();
    displaySearch();
  }, [searchResults, listNameToAdd, favoriteLists]);

  //function to add selected items to a fav list
  const addSelectedHeroesToList= async () =>{
    console.log('r:' + selectedResults);
    console.log('l:' + listNameToAdd)
    const url = `/api/lists/add/${listNameToAdd}?ids=${selectedResults}`;
    try{
      const response = await fetch(url, {
        method: 'PUT',
      });
      if (response.status === 200) {
        console.log('List created successfully');
      } else if (response.status === 404) {
        console.log('List name already exists');
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //function to add a result to 'selectedResults' list once it has been selected
  const selectResults= (event) =>{
    const listItem = event?.target?.closest("li");
    if(listItem){
      const id = listItem.id;
      setSelectedResults((prevSelectedResults) =>{
        if (prevSelectedResults.includes(id)){
          listItem.classList.remove("selected");
          return prevSelectedResults.filter((itemId) => itemId !== id);
        }
        else{
          listItem.classList.add("selected");
          return [...prevSelectedResults, id];
        }
      });
    }
  }
  const listAddNameChange= (event) =>{
    const selectedList = event.target.value;
    setListNameToAdd(selectedList);
  }


  //function to return fav list names
  const getFavLists = async () => {
    // fetch the list names
    try {
      const res = await fetch('api/lists/fav/names');
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

  //displays search results
  const displaySearch = () =>{
    if(searchResults){
      return (
        <ul>
          {searchResults.map((item, index) => React.cloneElement(item, { key: index }))}
        </ul>
      );
    }
    
  }

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
        <li key={i} id={i} name={hero.name} race={hero.Race} publisher={hero.Publisher}>
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
    console.log('sorted');
    sortedList.forEach((hero)=>{
      console.log(hero.props.race);
    })
    setSearchResults(sortedList);
  }

  //handles search/sort buttons
  const handleSearch = (event) => {
    event.preventDefault();
    searchSuperheroes();
  };

  return (
    <>
    <Router>
        <Routes>
          <Route path="/login" element ={<LogIn />}/>
          <Route path="/signup" element ={<SignUp />}/>
          <Route path="/" element ={
          <div>
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
            <div id="header">
              {/* Search */}
              <div id="searchContainer">
                <h2>Search Superheroes</h2>
                <form id="searchForm" onSubmit={handleSearch}>
                  <label htmlFor="searchInput">Search by:</label>
                  <select id="searchCategory">
                    <option value="name">Name</option>
                    <option value="race">Race</option>
                    <option value="publisher">Publisher</option>
                    <option value="power">Power</option>
                  </select>
                  <input type="text" id="searchInput" value={field} onChange={(e)=>setField(e.target.value)} placeholder="Search . . ." />
                  <button type="submit" id="searchButton">Search</button>
                </form>
              </div>

              {/* Favourite Lists */}
              <div id="favouriteListsContainer">
                <h2>Favourite Lists</h2>
                <button id="addListButton">Add List</button>
                <form id="deleteForm">
                  <label htmlFor="listNamesToDelete">Delete List:</label>
                  <select id="listNamesToDelete">
                    {favoriteLists.map((listName) => (
                      <option key={listName}>{listName}</option>
                    ))}
                  </select>
                  <button type="submit" id="deleteListButton">Delete</button>
                </form>
                {/* favourite lists will be displayed here as buttons*/}
                <ul id="favouriteLists">
                  {favoriteLists.map((listName) => (
                    <button key={listName}>
                      {listName}
                    </button>
                  ))}
                </ul>
              </div>
            </div>

            {/* Display Superheroes in a List */}
            <div id="listDetails">
              {/* Modify the "Sort List" title section */}
              <div id="sortListTitle">
                <h2>Sort List: <span id="listName"></span></h2>
                <form id="listsForm">
                  <label htmlFor="listNames">Add Selected Heroes to:</label>
                  <select id="listNames" onChange={listAddNameChange} value={listNameToAdd} >
                    {favoriteLists.map((listName) => (
                      <option key={listName}>{listName}</option>
                    ))}
                  </select>
                  <button type="submit" id="listAddButton" onClick={addSelectedHeroesToList}>Add</button>
                </form>
              </div>

              {/* Add the "Favorite List Heroes" title section */}
              <div id="favoriteListHeroesTitle">
                <h2>Favorite List Heroes</h2>
              </div>
            </div>
            <button id="sortByName" onClick={()=>{sortResults('name')}}>Sort by Name</button>
            <button id="sortByRace" onClick={()=>{sortResults('race')}}>Sort by Race</button>
            <button id="sortByPublisher" onClick={()=>{sortResults('publisher')}}>Sort by Publisher</button>
            <button id="sortByPower" onClick={()=>{sortResults('power')}}>Sort by Power</button>

            {/* Display Search Results */}
            <div id="searchAndListsContainer">
              {/* Search Results */}
              <div id="searchResults" onClick={selectResults}>
                <p>{errorMessage}</p>
                {displaySearch()}
                {/* Results will be displayed here */}
              </div>
              {/* Added Lists Results */}
              <div id="addedListsResults">
                <ul>Your Heroes will be displayed here...</ul>
                {/* Results for added lists will be displayed here */}
              </div>
            </div>
            <label htmlFor="FAQ">FAQ: What Publishers are available</label>
            <button id="FAQ" onClick={()=>{displayPublishers()}}>Available Publishers</button>
            <script src="script.js"></script>
          </div>
          } />
        </Routes>
    </Router>
    </>
  );
}

export default App;