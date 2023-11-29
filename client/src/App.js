// App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // Import your CSS file


function App() {
  const [pattern, setPattern] = useState('name');
  const [field, setField] = useState('');
  const [searchResultIds, setSearchResultIds] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('Your Search Results will be displayed here...');
  const [selectedResults, setSelectedResults] = useState([]);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [listNamesToDelete, setListNamesToDelete] = useState([]);
  // Add more state variables as needed

  useEffect(() => {
    getFavLists();
    // Fetch initial data or perform any necessary setup
    // Similar to componentDidMount in class components
    // displayFavoriteListsButtons();
    // Example: deleteLists();
  }, []); // runs once at start

  const handleSearch = (event) => {
    event.preventDefault();
    searchSuperheroes();
  };
  //function to return fav list names
  const getFavLists = async () => {
    // fetch the list names
    try {
      const res = await fetch('api/lists/fav/names');
      if (!res.ok){
        throw new Error('Request failed');
      }
      const data = await res.json();
      //set list names as 'favoriteLists' array
      setFavoriteLists(data.listNames);
    } catch (error) {
      console.error('Error fetching favorite lists:', error);
    }
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

  //function to retrieve ids of heroes that match search
  const searchSuperheroes = async () => {
    try {
      const response = await fetch(`/api/search/${pattern}/${field}/20`);
      if (!response.ok) {
        //if no heroes found, displays message
        setErrorMessage('No Heroes Found . . .');
        setSearchResultIds([]);
        //if heroes found
      }else{
        const data = await response.json();
        console.log(data.ids);
        setSearchResultIds(data.ids);
        setErrorMessage('');
        // if(criteria){
        //   displayHeroes(data, criteria);
        // }else{
        //   displayHeroes(data, sortCriteria = 0);
        // }
      }
      
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const displayHeroes= async (data, sortCriteria) =>{

  }

  const handleAddList = async () => {
    // Implement adding a new list
  };

  const handleDeleteList = () => {
    // Implement deleting a list
  };

  const handleSort = (criteria) => {
    // Implement sorting functionality
  };

  return (
    <div>
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
            <select id="listNames">
              {favoriteLists.map((listName) => (
                <option key={listName}>{listName}</option>
              ))}
            </select>
            <button type="submit" id="listAddButton">Add</button>
          </form>
        </div>

        {/* Add the "Favorite List Heroes" title section */}
        <div id="favoriteListHeroesTitle">
          <h2>Favorite List Heroes</h2>
        </div>
      </div>
      <button id="sortByName">Sort by Name</button>
      <button id="sortByRace">Sort by Race</button>
      <button id="sortByPublisher">Sort by Publisher</button>
      <button id="sortByPower">Sort by Power</button>

      {/* Display Search Results */}
      <div id="searchAndListsContainer">
        {/* Search Results */}
        <div id="searchResults">
          {errorMessage && <p>{errorMessage}</p>}
          <ul>
            {searchResultIds.map((hero) => (
              <li key={hero.id}>{hero.name}</li>
            ))}
          </ul>
          
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
  );
}

export default App;