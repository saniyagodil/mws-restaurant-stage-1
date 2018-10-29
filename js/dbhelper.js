//Common database helper functions.
class DBHelper {

  static get DATABASE_URL() {
    const port = 1337; // Change this to 8000 for local data and 1337 for data from server
    return `http://localhost:${port}/restaurants`;
  }

  static get REVIEWS_DB_URL(){
    const port = 1337;
    return `http://localhost:${port}/reviews`;
  }
//  `http://localhost:${port}/restaurants', 1337, OR http://localhost:${port}/data/restaurants.json, 8000'

////////////////////
  static restarauntDB(){
    return idb.open('db', 2, function(upgradeDb){
        switch (upgradeDb.oldVersion) {
            case 0:
                upgradeDb.createObjectStore("restaurants", {keyPath: 'id', autoIncrement: true});
            case 1:
                const reviewStore = upgradeDb.createObjectStore("reviews", {keyPath: 'id', autoIncrement: true});
                reviewStore.createIndex('restaurant', 'restaurant_id');
        }
    })
  }


  static readObjectStore(db, trans){
    var tx = db.transaction('restaurants', trans);
    return tx.objectStore('restaurants');
  }


static fetchRestaurants(callback, id) {
   let requestUrl;
   if(!id){
     requestUrl = DBHelper.DATABASE_URL;
   } else {
     requestUrl = DBHelper.DATABASE_URL + "/" + id;
   }
   fetch(requestUrl, {method: "GET"}).then(response => response.json())
   .then(restaurants => {
     console.log("Retrieved restaurants", restaurants);

     if(!Array.isArray(restaurants) || restaurants.length){
       DBHelper.writeStore("restaurants", restaurants)
       callback(null, restaurants);
       /*
       const neighborhoods = restaurants.map((v, i) => restaurants[i][“neighborhood”]);
       console.log(“neighborhoods: “, neighborhoods);
       fetchedNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
       console.log(“neighborhoods filtered: “, fetchedNeighborhoods);
       const cuisines = restaurants.map((v, i) => restaurants[i][“cuisine_type”]);
       console.log(“cuisines: “, cuisines);
       // Remove duplicates from cuisines
       fetchedCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i);
       console.log(“cuisines filtered: “, fetchedCuisines);
       */
     }
   }).catch(error => callback("Request failed. Error: " + error));
 }

  static readReviewStore() {
    return DBHelper.restarauntDB()
    .then(db => {
      const tx = db.transaction('reviews')
      return tx.objectStore('reviews').getAll()
    }).catch(error => console.log("Read reviews failed: Error" + error))
  }

  static writeStore(store, data) {
    return DBHelper.restarauntDB()
    .then(db => {
      const tx = db.transaction(store, 'readwrite')
      const objectStore = tx.objectStore(store)
      if (Array.isArray(data)) {
        data.forEach(function(element) {
          objectStore.put(element)
        })
      } else {
        objectStore.put(data)
      }

      return tx.complete.then(() => Promise.resolve(data));
    }).catch(error => console.log("Write reviews failed. Error" + error));
  }

  // Fetches a restaurant's reviews by its ID.
  static fetchReviewById(restaurant_id, callback) {
    DBHelper.readReviewStore('reviews')
    .then(res => {
        let results = res.filter(r => r.restaurant_id == restaurant_id)
        if (results && results.length != 0) {
            callback(null, results)
        } else {
            DBHelper.getAndCacheReviews(restaurant_id, callback)
        }
    }).catch(error => callback(error, "Fetch failed: Error" + error))
  }

  static getAndCacheReviews(restaurant_id, callback) {
    const reviewURL = DBHelper.REVIEWS_DB_URL + "?restaurant_id=" + restaurant_id;
    fetch(reviewURL, {method: "GET"})
    .then(response => response.json())
    .then(reviews => {
      console.log('reviews:', reviews);
      callback(null, DBHelper.writeStore('reviews', reviews))
    }).catch(error => callback(error, "Request for Reviews failed. Error" + error));
  }


  static addReview(review) {
    DBHelper.writeStore('reviews', [review])
    event.preventDefault();
    if (navigator.onLine) {
      DBHelper.sendReview(review)
      // .then(() => window.location = "http://localhost:8000/restaurant.html?id=" + getParameterByName('id'))
    } else {
      DBHelper.sendReviewWhenOnline(review)
    }
  }

  static sendReview(review) {
    let post_options = {
      method: 'POST',
      body: JSON.stringify(review),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }
    fetch(`http://localhost:1337/reviews`, post_options)
    .then(response => {
      // console.log("Posting review...")
      // do some response validations
    }).catch(error => console.log("Failed to post review" + error))
  }

  static sendReviewWhenOnline(review) {
    // TODO: perhaps make this able to store multiple offline reviews???
    localStorage.setItem('review', JSON.stringify(review));
    window.addEventListener('online', (event) => {
      sendReview(JSON.parse(localStorage.getItem('data')))
    })
  }

  static formatFavorite(shouldBeFavorite, isString) {
    if (isString) {
        return shouldBeFavorite ? "true" : "false"
    }
    return shouldBeFavorite ? true : false
  }

  static toggleFavorite(restaurant_id, callback) {
    DBHelper.restarauntDB()
    .then(db => {
        const tx = db.transaction('restaurants', 'readwrite');
        const objectStore = tx.objectStore('restaurants');
        objectStore.get(restaurant_id)
        .then(restaurant => {
            const isString = (typeof restaurant.is_favorite === 'string' || restaurant.is_favorite instanceof String);
            const shouldBeFavorite = !((isString && restaurant.is_favorite == "true") || (!isString && restaurant.is_favorite))
            console.log(isString + " + " + shouldBeFavorite + " + " + restaurant.is_favorite)
            restaurant.is_favorite = DBHelper.formatFavorite(shouldBeFavorite, isString)
            const method = "PUT"
            objectStore.put(restaurant).then( () => {
                let url = `http://localhost:1337/restaurants/${restaurant_id}/?is_favorite=${shouldBeFavorite}`
                console.log("URL: " + url)
                fetch(url, {method})
                callback(shouldBeFavorite)
            })
        })
    })
  }
// fetchReviewById = (id = self.id) => {
//   const reviewURL = DBHelper.REVIEWS_DB_URL + "/?restaurant_id=" + id;
//   return fetch(reviewURL, {method: "GET"}).then(response => response.json())
//    .then(
//     return result;
//     // console.log("Retrieved reviews", reviews);
//    }).catch(error => return "Request for Reviews failed. Error");
// }

  // function getRestaurantData(restaurants){
  //   callback(null, restaurants)
  // }

  // function handleError(error){
  //   console.log(error)log;
  //   const errorMessage = ('Request failed. Error: $(error)');
  //   callback(error, null);
  // }
////////////////////////////


//Fetch a restaurant by its ID.
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  //Fetch restaurants by a cuisine type with proper error handling.
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  //Fetch restaurants by a neighborhood with proper error handling.
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  //Fetch restaurants by a cuisine and a neighborhood with proper error handling.
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      console.log(restaurants);
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

//Fetch all neighborhoods with proper error handling.
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

//Fetch all cuisines with proper error handling.
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  //Restaurant page URL.
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }


  //Restaurant image URL, gets image
  static imageUrlForRestaurant(restaurant) {
    // if(restaurant.photograph == undefined)
    //   restaurant.photograph = id;
    // console.log(`/img/${restaurant.photograph}` + '-500px' + '.jpg');
    // return (`/img/${restaurant.photograph}` + '-500px' + '.jpg');

    return (`/img/${restaurant.id}` + '-200px' + '.jpg');
  }


  //Map marker for a restaurant.
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
