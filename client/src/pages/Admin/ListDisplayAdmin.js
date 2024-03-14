// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function ListDisplayAdmin() {
    //name of list being edited
    const {listName} = useParams();
    //list details
    const [ids, setIds] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [info, setInfo] = useState([]);
    //review
    const [rating, setRating] = useState('1');
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [status, setStatus] = useState([]);
    //current user
    const [nickname, setNickname] = useState('');

    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
      checkAuthentication();
      checkUser();
      getListInfo();
    }, []);

    useEffect(() => {
      const fetchReviews = async () => {
          const reviewsArray = await getReviews();
          if (!arraysAreEqual(reviewsArray, reviews)) {
            // set list names as 'favoriteLists' array only if there are changes
            setReviews(reviewsArray);
          }
        };
        fetchReviews();
        console.log(status);
        
    }, [reviews,ids]);

    useEffect(() => {
      console.log(status);
    }, [status]);


    useEffect(() => {
        const fetchHeroes = async () => {
            const heroesArray = await displayHeroes();
            setHeroes(heroesArray);
          };
          fetchHeroes();
          displayHeroes();
      }, [ids]);

      //adds review to list
    const addReview= async () =>{
      try{
      const res = await fetch(`/api/lists/details/reviews/${listName}`, { 
          method: 'PUT', 
          body: JSON.stringify( { rating, comment, nickname  }),
          headers: {'Content-Type': 'application/json'}
        });
        if (res.status === 200) {
          //if updated,  log
          console.log("Successfully updated");
          navigate('/loggedinAdmin');
        } else if (res.status === 404) {
          console.log(res.message);
        } else {
          console.error('Error:', res.status);
        }
      } catch (error) {
        console.error('Error:', error);
      }
      }

  // helper function to compare two arrays -- to stop 'favoriteLists' from being updated in a loop
  const arraysAreEqual = (array1, array2) => {
    if (array1.length !== array2.length) {
      return false;
    }
  
    return array1.every((element, index) => JSON.stringify(element) === JSON.stringify(array2[index]));
  };
  

    
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
            setNickname(data.nickname);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }

//function to toggle status
const toggleStatus= async (index) =>{
  console.log('index: ' + index);
  console.log('name: ' + listName);
  console.log('here');
  const url = `/api/lists/details/review/${listName}?index=${index}`;
  try{
    const response = await fetch(url, {
      method: 'PUT',
    });
    if (response.status === 200) {
      console.log('Status updated successfully');
      getListInfo();
    } else {
      console.error('Error:', response.status);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

    //gets reviews oif list
    const getReviews = async () =>{
        try {
            const response = await fetch(`/api/lists/details/reviews/${listName}`);
            if (!response.ok) {
              throw new Error('Request failed');
            }
            const data = await response.json();
            
            
            const {ratings, comments, status} = data;
            setStatus(data.status);
            //status can be 'Public' or 'Hidden'
            const reviewsArray = ratings.map((r, index) => (
              <li key={index}>
                <p>Rating: {r}</p>
                <p>Comment: {comments[index]}</p>
                <p>Status: {status[index]}</p>
                <button onClick={()=>toggleStatus(index)}>Toggle Hide</button>
              </li>
            ));
            return reviewsArray;
          } catch (error) {
            console.error('Error:', error);
            return null; // Handle the error gracefully
          }
    }


    //function to display heroes as buttons
    const displayHeroes = async () =>{
        const heroesArray = [];
        for (const i of ids) {
            const hero = await getHero(i);
            const powers = await getPowers(i);
            heroesArray.push(
                <div key ={i}>
                <button id={i} onClick={() => displayHeroInfo(hero, powers)}>{hero.name}</button>
                </div>
            );
        }
        return heroesArray;
    }

    //function to get hero info for clicked button
    const displayHeroInfo = async (hero, powers) =>{
        const infoArray = [];
        const heroAttributes = Object.entries(hero)
        .filter(([key]) => key !== 'id') // exclude the "id" property
        .map(([key, value]) => (
          <li key={key} style={{ fontSize: '14px' }}>{`${key}: ${value}, `}</li>
        ));
        const power = <li>Power: {powers.powers === 'No Powers' ? 'None' : powers.powers.length > 1 ? powers.powers.join(', ') : powers.powers}</li>

        infoArray.push(heroAttributes);
        infoArray.push(power)
        setInfo(infoArray);
    }


       //gets reviews of list and sets them as 'reviews'
       const getListInfo = async () =>{
        try {
            const response = await fetch(`/api/lists/${listName}`);
            if (!response.ok) {
              throw new Error('Request failed');
            }
            const data = await response.json();
            setIds(data.ids);

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


  
  return (
    <div>
        <h2 id="title">List Info: {listName}</h2>
        <button onClick={() =>navigate("/loggedinAdmin")}>Done</button>
        <div class="heroes-container">
    <h2>Heroes</h2>
        {heroes.length > 0 && <ul>{heroes}</ul>}
    </div>

    <div id="searchResults">
        <h2>Hero Info</h2>
        <ul>
        {info.length > 0 && <ul>{info}</ul>}
        </ul>
    </div>
    <div id="searchResults">
        <h2>Add a Review</h2>
        <label htmlFor="ratingInput">Rating: </label>
            <select
              
              onChange={(event) => setRating(event.target.value)}>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              </select>
              <label htmlFor="commentInput">Add a comment: </label>
            <input
              type="text"
              id="commentInput"
              onChange={(event) => setComment(event.target.value)}
              placeholder="..."
            />
            <button onClick={addReview}>Submit</button>
    </div>
    <div id="searchResults">
        <h2>List Reviews</h2>
        <ul>
        {reviews.length > 0 && <ul>{reviews}</ul>}
        </ul>
    </div>
    </div>
    
  );
}

export default ListDisplayAdmin;
