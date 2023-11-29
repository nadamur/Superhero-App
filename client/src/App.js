// App.js
import React, { useState, useEffect } from 'react';
import './App.css'; // Import your CSS file

function App() {
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);
  const [favoriteLists, setFavoriteLists] = useState([]);
  const [listNamesToDelete, setListNamesToDelete] = useState([]);
  // Add more state variables as needed

  useEffect(() => {
    // Fetch initial data or perform any necessary setup
    // Similar to componentDidMount in class components
    // displayFavoriteListsButtons();
    // Example: addLists();
    // Example: deleteLists();
  }, []); // Empty dependency array means it runs once on mount

  const handleSearch = async (criteria) => {
    try {
      const response = await fetch(`/api/search/${criteria}`);
      if (!response.ok) {
        throw new Error('Request failed');
      }
      const data = await response.json();
      setSearchResults(data); // Update the state with search results
      } catch (error) {
        console.error('Error:', error);
      }
  };
  //function to display fav list names as buttons
  const displayFavoriteListsButtons = async () => {
    const [favoriteLists, setFavoriteLists] = useState([]);

    useEffect(() => {
      // Fetch the list names when the component mounts
      const fetchFavoriteLists = async () => {
        try {
          const listNames = await getFavoriteListNames();
          setFavoriteLists(listNames.listNames);
        } catch (error) {
          console.error('Error fetching favorite lists:', error);
        }
      };
      fetchFavoriteLists();
    }, []); // Empty dependency array means this effect runs once after the initial render

    const handleListClick = async (listName) => {
      try {
        const data = await getFavoriteListIds(listName);
        displayFavoriteHeroNames(listName);
        // Other actions you want to perform when a list is clicked
      } catch (error) {
        console.error('Error handling list click:', error);
      }
  }

  const handleSelect = (listItem) => {
    // Implement selecting/deselecting items
  };

  const handleAddToList = (list) => {
    // Implement adding selected items to a list
  };

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
    <div id="favouriteLists">
      {favoriteLists.map((listName) => (
        <button key={listName} onClick={() => handleListClick(listName)}>
          {listName}
        </button>
      ))}
    </div>
  );
}
}

// function App() {
//   const [backendData, setBackendData] = useState([{}])
//   useEffect(() =>{
//     fetch("/api").then(
//       res => res.json()
//     ).then(
//       data =>{
//         setBackendData(data);
//       }
//     )
//   },[])
//   return (
//     <div>
//       {(typeof backendData.users === 'undefined') ? (
//         <p>Loading...</p>
//       ) : (
//         <p>{backendData.users}</p>
//       )}
//     </div>
//   )
// }

export default App;