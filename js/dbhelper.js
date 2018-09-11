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
    const indexedDB = idb.open('restaurant-db', 1, function(upgradeDb ){
      var restInfo = upgradeDb.createObjectStore("restaurants", {keyPath: 'id', autoIncrement: true});
    });
    return indexedDB;
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
     
     if(restaurants.length){
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
   }).catch(error => callback("Request failed. Error: ", error));
 }

//Fetches a restaurant's reviews by its ID.
static fetchReviewById(id, callback){
  const reviewURL = DBHelper.REVIEWS_DB_URL + "/?restaurant_id=" + id;
  fetch(reviewURL, {method: "GET"}).then(response => response.json())
   .then(result => {
    callback(null, result)
    console.log("Retrieved reviews", restaurants);
   }).catch(error => callback("Request for Reviews failed. Error: ", error));
}


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