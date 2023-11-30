const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;
const path = require('path');
const mongoose = require('mongoose');
const fs = require('fs');
const superheroesInfo = require('../superhero_info.json');
const superheroesPowers = require('../superhero_powers.json');
const mainDir = path.join(__dirname, '../');
const clientDir = path.join(__dirname, '../client');
const userRoutes = require('./authentication.js');
const cookieParser = require('cookie-parser');
app.use(express.static(mainDir));
app.use(express.static(clientDir));
app.use(express.json());
app.use(userRoutes);
app.use(cookieParser());

// database connection
const dbURI = 'mongodb+srv://nadamurad2003:AUeHvPkfedepWhBQ@cluster0.8dcttlz.mongodb.net/node-auth';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(8080))
  .catch((err) => console.log(err));

//required functions
//function takes a pattern, returns a set number of hero ids that match given pattern
function getHeroIds(n, pattern, field, res){
    const superheroes = superheroesInfo.filter((hero) => hero[pattern].toLowerCase().includes(field.toLowerCase()));
    const ids = superheroes.map(hero => hero.id);

    if (ids.length > 0) {
        const limitedIds = ids.slice(0, n);
        res.json({ ids: limitedIds });
        return;
    } else {
        res.status(404).json({ error: 'No heroes found' });
        return;
    }
}
//function takes hero id and returns all hero info
function getHeroInfo(id){
    const superhero = superheroesInfo.find((hero) => hero.id === id);
    return superhero;
}
//function takes hero id and returns all powers
function getHeroPower(id){
    const superhero = superheroesInfo.find((hero) => hero.id === id);
    if (!superhero) {
        return null;
    }
    const superheroPower = superheroesPowers.find((hero) => hero.hero_names.toLowerCase() === superhero.name.toLowerCase());
    if (!superheroPower) {
        return null;
    }
    const powers = Object.keys(superheroPower).filter(power => superheroPower[power] === 'True');
    return powers;
}

app.use(express.json());

//returns all fav list names
app.get('/api/lists/fav/names', (req, res) => {
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      try {
        const jsonData = JSON.parse(data);
        const listNames = Object.keys(jsonData);
  
        if (listNames.length > 0) {
          res.json({ listNames });
          return;
        } else {
          res.status(404).json({ error: 'No lists found' });
          return;
        }
      } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
        res.status(500).json({ error: 'Error parsing JSON data' });
        return;
      }
    });
  });

//this method will return all the hero info depending on id
app.get('/api/superheroes/:id', (req, res) => {
    const superheroId = parseInt(req.params.id);
    const superhero = getHeroInfo(superheroId);
  
    if (!superhero) {
      return res.status(404).json({ error: 'Superhero not found' });
    }
  
    res.json(superhero);
    return;
});

//this method will return the powers of hero based on id
app.get('/api/superheroes/:id/power', (req, res) => {
    const superheroId = parseInt(req.params.id);
    const superhero = getHeroInfo(superheroId);
    
    if (!superhero) {
      return res.status(404).json({ error: 'Superhero not found' });
    }
    const powers = getHeroPower(superheroId);
    if(powers === null){
        res.json({powers: "No Powers"});
        return;
    }
    if (powers.length > 0) {
      res.json({ powers });
      return;
    } else {
      res.status(404).json({ error: 'No powers found for this superhero' });
    }
});

//this method will return all publisher names
app.get('/api/publishers', (req, res) => {
    const publishers = superheroesInfo.map(hero => hero.Publisher);
    res.json(publishers);
});

//this method will return n number of search results (hero ids) for given search pattern
app.get('/api/search/:pattern/:field/:n', (req, res) => {
    const n = parseInt(req.params.n);
    const pattern = req.params.pattern;
    const field = req.params.field;
    //pattern can either be name, race, publisher or power
    switch (pattern){
        case 'name':
            getHeroIds(n,'name',field, res);
            break;
        case 'race':
            getHeroIds(n,'Race',field, res);
            break;
        case 'publisher':
            getHeroIds(n,'Publisher',field, res);
            break;
        case 'power':
            const heroes = superheroesPowers.filter(hero => {
                // Iterate through each property (power name) of the hero object
                for (const power in hero) {
                    if (hero[power] === "True" && power.toLowerCase().includes(field)) {
                        return true;
                    }
                }
                return null;
            });
            console.log("heroes: " + heroes);
            const names = heroes.map((hero) => hero.hero_names);
            ids = [];
            for (const n of names){
                const hero = superheroesInfo.find((hero) => hero.name.toLowerCase() === n.toLowerCase());
                if (hero){
                    ids.push(hero.id);
                }
            }
            if (ids.length > 0) {
                const limitedIds = ids.slice(0, n);
                res.json({ ids: limitedIds });
                return;
            } else {
            res.status(404).json({ error: 'No heroes found for this publisher' });
            return;
            }
            break;
    }
});

//this method will create a list with a list name and returns an error if the name already exists
app.post('/api/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        //if there is data in the json file
        if (data){
            const jsonData = JSON.parse(data);
            console.log('Parsed JSON Data:', jsonData);
            console.log('listName:', listName);
            console.log('Keys in jsonData:', Object.keys(jsonData));
            jsonKeys = Object.keys(jsonData);
            for (key of jsonKeys){
                if (key === listName){
                    res.status(404).json({ error: 'List name already exists' });
                    return;
                }
            }
            console.log("writing");
            const newListName = listName;
            const newSuperheroIds = [];
            jsonData[newListName] = newSuperheroIds;
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFile(filePath, jsonString, 'utf-8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing JSON file:', writeErr);
                res.status(500).json({ error: 'Internal server error' });
                return;
            } else {
                console.log('JSON data has been updated and written to', filePath);
                res.sendStatus(201);
                return;
            }
            });
        }else{
            //if there is no data in the json file, must start with initial data (can not parse)
            const initialData = { [normalizedListName]: [] };
            
            fs.writeFile(filePath, JSON.stringify(initialData, null, 2), 'utf-8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing JSON file:', writeErr);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                } else {
                    console.log('JSON data has been updated and written to', filePath);
                    res.sendStatus(201);
                    return;
                }
                });
        }
      });
});
//save list of superhero IDs to a given list name
app.put('/api/lists/add/:listNameAndIds', (req, res) => {
    const listName = req.params.listNameAndIds;
    // assuming we are receiving the URL in the format: /api/lists/myList?ids=1,2,3
    const ids = req.query.ids;
    const idArray = ids.split(',');
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        const jsonData = JSON.parse(data);
        // check if the listName exists
        if (jsonData.hasOwnProperty(listName)) {
            const existingIds = new Set(jsonData[listName]);
            // add unique IDs to the existing list using a set so no repeated ids
            for (const id of idArray) {
                existingIds.add(id);
            }
            // convert the Set back to an array
            jsonData[listName] = [...existingIds];
            const jsonString = JSON.stringify(jsonData, null, 2);
            //write new array to file
            fs.writeFile(filePath, jsonString, 'utf-8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing JSON file:', writeErr);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                } else {
                    res.sendStatus(200);
                    return;
                }
            });
        } else {
            // if it doesn't exist, send an error
            res.status(404).json({ error: 'List name does not exist' });
            return;
        }
    });
});

//get list of superhero IDs for given list name
app.get('/api/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        const jsonData = JSON.parse(data);
        //if the name does exist, update the IDs
        ids = jsonData[listName];
        if(ids){
            res.json({ids});
            return;
        }else{
            //if it doesnt exist, send an error
            res.status(404).json({ error: 'List name does not exist' });
        }     
      }); 
});

//delete list with given name
app.put('/api/lists/delete/:listName', (req, res) => {
    const listName = req.params.listName;
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        const jsonData = JSON.parse(data);
        //if the name does exist, delete it
        if (jsonData.hasOwnProperty(listName)){
            delete jsonData[listName];
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFile(filePath, jsonString, 'utf-8', (writeErr) => {
            if (writeErr) {
                console.error('Error writing JSON file:', writeErr);
                res.status(500).json({ error: 'Internal server error' });
            } else {
                res.sendStatus(200);
            }
            });
        }else{
            //if it doesnt exist, send an error
            res.status(404).json({ error: 'List name does not exist' });
        }        
      });
});

//get list of names, info and powers of all superheroes in list
app.get('/api/lists/info/:listName', (req, res) => {
    const listName = req.params.listName;
    const filePath = '../superhero_lists.json';
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        const jsonData = JSON.parse(data);
        //if the name does exist, update the IDs
        idArray = jsonData[listName];
        if(idArray){
            heroList = [];
            for (const i of idArray){
                const info = getHeroInfo(parseInt(i));
                const powers = getHeroPower(parseInt(i));
                const heroWithPowers = {
                    ...info,
                    powers: powers,
                };
                heroList.push(heroWithPowers);
            }
            res.json({heroList});
        }else{
            //if it doesnt exist, send an error
            res.status(404).json({ error: 'List name does not exist' });
            return;
        }     
      }); 
});

app.get('/', (req, res) => {
    res.sendFile('index.js', { root: clientDir });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});