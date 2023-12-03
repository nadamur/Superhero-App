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
const stringSimilarity = require('string-similarity');
const heroLists = '../superhero_lists.json';
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
//function returns current date in required format
function getCurrentFormattedDateTime() {
    const currentDate = new Date();
  
    // Get day, month, and year components
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = String(currentDate.getFullYear()).slice(-2);
  
    // Get hour, minute, and second components
    const hour = String(currentDate.getHours()).padStart(2, '0');
    const minute = String(currentDate.getMinutes()).padStart(2, '0');
    const second = String(currentDate.getSeconds()).padStart(2, '0');
  
    // Format the date and time
    const formattedDateTime = `${day}-${month}-${year} ${hour}:${minute}:${second}`;
  
    return formattedDateTime;
  }
//function takes a pattern, returns a set number of hero ids that match given pattern
function getHeroIds(n, pattern, field, res){
    const similarityThreshold = 0.7;
    //check if empty field
    if (field === '' || field === undefined){
        //return all ids
        const ids = superheroesInfo.map(hero => hero.id);
        if (ids.length > 0) {
            res.json({ ids: ids });
            return;
        }else{
            res.status(404).json({ error: 'No heroes found' });
            return;
        }
    }
    const searchStrings = field.toLowerCase().split(/\s+/);
    const matchedHeroes = superheroesInfo.filter((hero) => {
        const fieldValue = hero[pattern].toLowerCase();
        return searchStrings.every((searchString) =>{
            //check if field starts with the search string
            const startsWithMatch = fieldValue.startsWith(searchString);
            //check string similarity
            const similarityScore = stringSimilarity.compareTwoStrings(fieldValue, searchString);
            return startsWithMatch || similarityScore >=similarityThreshold;
        })
    });
    const ids = matchedHeroes.map(hero => hero.id);

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

//returns all fav list names for the current user
app.get('/api/lists/fav/names', (req, res) => {
    const email = req.session.user.email;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      if(data){
        try {
            const jsonData = JSON.parse(data);
            const userLists = jsonData.filter(list => list.creator === email);
            //list with all list names
            let listNames = [];
            for (const list of userLists){
                listNames.push(list.name);
            }
            res.json({listNames});
          } catch (parseError) {
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
            return;
          }
      }else{
        res.status(404).json({error: 'List not found'});
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
app.get('/api/search/:pattern/:field?/:n', (req, res) => {
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
            if (field === '' || field === undefined){
                const names = superheroesPowers.map((hero) => hero.hero_names);
                ids = [];
                for (const n of names){
                    const hero = superheroesInfo.find((hero) => hero.name.toLowerCase() === n.toLowerCase());
                    if (hero){
                        ids.push(hero.id);
                    }
                }
                if (ids.length > 0) {
                    res.json({ ids: ids });
                    return;
                } else {
                res.status(404).json({ error: 'No heroes found for this power' });
                return;
                }
            }else{
                const heroes = superheroesPowers.filter(hero => {
                    // Iterate through each property (power name) of the hero object
                    for (const power in hero) {
                        if (hero[power] === "True" && power.toLowerCase().includes(field)) {
                            return true;
                        }
                    }
                    return null;
                });
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
                res.status(404).json({ error: 'No heroes found for this power' });
                return;
                }
            }
            
    }
});

//lists created are private by default
//this method will create a list with a list name and returns an error if the name already exists
app.post('/api/lists/:listName', (req, res) => {
    const email = req.session.user.email;
    const listName = req.params.listName;
      //now add the list to the file with default values
      fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
        }
        if (data){
            try {
                const jsonData = JSON.parse(data);
                const newEntry ={
                    name: listName,
                    creator: email,
                    ids: [],
                    ratings: [],
                    comments: [],
                    nicknames: [],
                    status: [],
                    reviewDate: [],
                    visibility: "private",
                    lastModified: getCurrentFormattedDateTime(),
                    descripton:""
                };
                jsonData.push(newEntry);
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                res.sendStatus(201);
                } catch (parseError) {
                console.error('Error parsing JSON data:', parseError);
                res.status(500).json({ error: 'Error parsing JSON data' });
                return;
                }
        }else{
            //if there is no data in the json file, must start with initial data (can not parse)
            const initialData = [{
                name: listName,
                creator: email,
                ids:[],
                ratings: [],
                comments: [],
                nicknames: [],
                status: [],
                reviewDate: [],
                visibility: "private",
                lastModified: getCurrentFormattedDateTime(),
                descripton:""
            }];
            fs.writeFile(heroLists, JSON.stringify(initialData, null, 2), 'utf-8', (writeErr) => {
                if (writeErr) {
                    console.error('Error writing JSON file:', writeErr);
                    res.status(500).json({ error: 'Internal server error' });
                    return;
                } else {
                    console.log('JSON data has been updated and written to', heroLists);
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
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        try{
            const jsonData = JSON.parse(data);
            // find specific list
            const list = jsonData.find(l=>l.name ===listName);
            //if found
            if(list){
                for(id of idArray){
                    list.ids.push(id);
                }
                
                //write into file
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                res.status(200).json({ message: 'List ids updated' });
            }
             else {
                // if it doesn't exist, send an error
                res.status(404).json({ error: 'List name does not exist' });
                return;
        }
    }
    catch(error){
        console.error('Error parsing JSON data:', error);
        res.status(500).json({ error: 'Error parsing JSON data' });
    }
    });
});

//get list of superhero IDs for given list name
app.get('/api/lists/:listName', (req, res) => {
    const listName = req.params.listName;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        try{
            const jsonData = JSON.parse(data);
            //if the name does exist, update the IDs
            const list = jsonData.find(list => list.name === listName);
            if(list){
                const {ids} = list;
                res.json({ids});
                return;
            }else{
                //if it doesnt exist, send an error
                res.status(404).json({ error: 'List name does not exist' });
            } 

        }catch(error){
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
            return;
        }
      }); 
});

//get all info for a list
app.get('/api/lists/info/:listName', (req, res) => {
    const listName = req.params.listName;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        try{
            const jsonData = JSON.parse(data);
            //if the name does exist, return all info
            const list = jsonData.find(list => list.name === listName);
            if(list){
                const {ids, visibility, lastModified, descripton} = list;
                res.json({ids, visibility, lastModified, descripton});
                return;
            }else{
                //if it doesnt exist, send an error
                res.status(404).json({ error: 'List name does not exist' });
            } 

        }catch(error){
            console.error('Error parsing JSON data:', parseError);
            res.status(500).json({ error: 'Error parsing JSON data' });
            return;
        }
      }); 
});

//save edited list with changes
//editing manually will affect visibility, description, ids, lastModified
//lastModified changes automatically
app.put('/api/lists/info/:listName', (req, res) => {
    const { ids, visibility, descripton } = req.body;
    const listName = req.params.listName;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        try{
            const jsonData = JSON.parse(data);
            // find specific list
            const list = jsonData.find(l=>l.name ===listName);
            //if found
            if(list){
                list.ids = ids
                list.visibility = visibility;
                list.lastModified = getCurrentFormattedDateTime();
                list.descripton = descripton;
                //write into file
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                res.status(200).json({ message: 'List info updated' });
            }
             else {
                // if it doesn't exist, send an error
                res.status(404).json({ error: 'List name does not exist' });
                return;
        }
    }
    catch(error){
        console.error('Error parsing JSON data:', error);
        res.status(500).json({ error: 'Error parsing JSON data' });
    }
    });
});


//delete list with given name
app.put('/api/lists/delete/:listName', (req, res) => {
    const listName = req.params.listName;
      //delete the list from superhero_reviews as well
      fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        try{
            const jsonData = JSON.parse(data);
            const index = jsonData.findIndex(list => list.name === listName);
            //if index found, delete list
            if(index !== -1){
                jsonData.splice(index,1);
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                res.status(200).json({message:'List deleted'});
                console.log("Successfully deleted from reviews file");
            }else{
                //if not found
                res.status(404).json({error: 'List name does not exist'});
            }

        }catch(error){
            console.error('Error parsing JSON data:', error);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

//get list of names, info and powers of all superheroes in list
app.get('/api/lists/heroes/info/:listName', (req, res) => {
    const listName = req.params.listName;
    const heroLists = '../superhero_lists.json';
    fs.readFile(heroLists, 'utf-8', (err, data) => {
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

//this method will return list names in review file
app.get('/api/lists/details/names', (req, res) => {
    fs.readFile(heroLists, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      try {
        const jsonData = JSON.parse(data);
        const listNames = jsonData.map(list => list.name);
  
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

//this method will return all the reviews of a list
app.get('/api/lists/details/reviews/:listName', (req, res) => {
    const listName = req.params.listName;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
        console.error('Error reading JSON file:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
        }

        try {
        const jsonData = JSON.parse(data);
        const list = jsonData.find(list => list.name === listName);
        if (list) {
            const { ratings, comments, visibility, nicknames, reviewDate } = list;
            res.json({ ratings, comments, visibility, nicknames, reviewDate });
            return;
        } else {
            res.status(404).json({ error: 'No reviews found' });
            return;
        }
        } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
        res.status(500).json({ error: 'Error parsing JSON data' });
        return;
        }
    });
});

//this method will add a new review to a list
//status is public as default
//reviewDate is calculated using method
//assuming we are getting the JSON file with 'rating','comment','nickname'
app.put('/api/lists/details/reviews/:listName', (req, res) => {
    const listName = req.params.listName;
    const { rating, comment, nickname } = req.body;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        try{
            const jsonData = JSON.parse(data);
            //find specific list
            const list = jsonData.find(l => l.name === listName);
            //if found
            if (list){
                list.ratings.push(rating);
                list.comments.push(comment);
                list.nicknames.push(nickname);
                list.status.push("public");
                list.reviewDate.push(getCurrentFormattedDateTime());
                // write the modified data back to the file
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                res.status(200).json({ message: 'Ratings updated' });
            }else{
                res.status(404).json({ error: 'List not found' });
            }
        }
        catch(error){
            console.error('Error parsing JSON data:', error);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
      });
});

//update the visibility of a list
app.put('/api/lists/details/visibility/:listName', (req, res) => {
    const listName = req.params.listName;
    // assuming we are receiving the URL in the format: /api/lists/visibility/myList?visibility=public
    const visibility = req.query.visibility;
    fs.readFile(heroLists, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading JSON file:', err);
          res.status(500).json({ error: 'Internal server error' });
        }
        try{
            const jsonData = JSON.parse(data);
            //find specific list
            const list = jsonData.find(l => l.name === listName);
            //if found
            if (list){
                list.visibility = visibility;
                // write the modified data back to the file
                fs.writeFileSync(heroLists, JSON.stringify(jsonData, null, 2), 'utf8');
                console.log('Ratings updated');
                res.status(200).json({ message: 'Ratings updated' });
            }else{
                console.log("List not found");
                res.status(404).json({ error: 'List not found' });
            }
        }
        catch(error){
            console.error('Error parsing JSON data:', error);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
      });
});

app.get('/', (req, res) => {
    res.sendFile('index.js', { root: clientDir });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});