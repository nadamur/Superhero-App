// App.js
import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import './App.css'; // Import your CSS file
import LogIn from './LogIn.js';
import SignUp from './SignUp.js';
import LoggedInUser from './LoggedInUser.js';


function App() {
  //search related
  const [pattern, setPattern] = useState('name');
  const [field, setField] = useState('');
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
  //authentication, defaults to false
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    //check authentication
    checkAuthentication();
    console.log('authenticated: ' + isAuthenticated);
    //sets favorite lists from back end
    getFavLists();
    //displays search results
    displaySearch();
    //sets up initial values
    setListNameToAdd(favoriteLists.length > 0 ? favoriteLists[0] : '');
    setListNameToDelete(favoriteLists.length > 0 ? favoriteLists[0] : '');
  }, [searchResults, listNameToAdd, favoriteLists,selectedResults]);


  //function to check authentication
  const checkAuthentication = async () => {
    try {
      // Make a request to your backend to check authentication
      const response = await fetch('/api/check-auth');
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
    }
  };

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
  const deleteList= async () =>{
    const url = `/api/lists/delete/${listNameToDelete}`;
    try{
      const response = await fetch(url, {
        method: 'PUT',
      });
      if (response.status === 200) {
        console.log('List created successfully');
      } else if (response.status === 404) {
        console.log('List name does not exist');
      } else {
        console.error('Error:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  //function to display heroes in a fav list
  const displayFavHeroes= async () =>{
    
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

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/loggedin" element={isAuthenticated ? <LoggedInUser /> : <Navigate to="/login"/>} />
          
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
                    <li>
                      <Link to="/loggedin" className="nav-button">Logged In</Link>
                    </li>
                  </ul>
                </nav>
                <script src="script.js"></script>
              </div>
            }
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;