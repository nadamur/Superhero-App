// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from "react-router-dom";

function ListDisplay() {
    //name of list being edited
    const {listName} = useParams();
    //list details
    const [ids, setIds] = useState([]);
    const [heroes, setHeroes] = useState([]);
    const [info, setInfo] = useState([]);

    const navigate = useNavigate();

    //make sure user is authenticated, get their info
    useEffect(() => {
      getListInfo();
    }, []);

    useEffect(() => {
        const fetchHeroes = async () => {
            const heroesArray = await displayHeroes();
            setHeroes(heroesArray);
          };
          fetchHeroes();
          displayHeroes();
          console.log('ids: ' + ids);
      }, [ids]);

    //gets ids of list and sets them as 'ids'
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
        const power = <li key ="11">Power: {powers.powers === 'No Powers' ? 'None' : powers.powers.length > 1 ? powers.powers.join(', ') : powers.powers}</li>

        infoArray.push(heroAttributes);
        infoArray.push(power)
        setInfo(infoArray);
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
        <h2 id="title">List Info</h2>
        <button onClick={() =>navigate("/home")}>Done</button>
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
    </div>
    
  );
}

export default ListDisplay;
