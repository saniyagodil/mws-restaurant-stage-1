let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/*Fetch neighborhoods and cuisines as soon as the page is loaded */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/*Fetch all neighborhoods and set their HTML*/
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.log(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/*Set neighborhoods HTML*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/*Fetch all cuisines and set their HTML*/
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.log(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/*Set cuisines HTML*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/*Initialize Google map, called from HTML*/
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
}

/*Update page and map for current restaurants*/
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;


  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    console.log(restaurants);
    if (error) { 
      console.log(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML(restaurants);
    }
  })
}



//Clear current restaurants, their HTML and remove their map markers.
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

//Create all restaurants HTML and add them to the webpage.
fillRestaurantsHTML = (restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));

  });
  addMarkersToMap();
}

//Create restaurant HTML. Assembles all restaurant's components
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  /******************/
  /*Image Element*/
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  // Attempt to lazy load resulted in error, COME BACK TO LATER
  // image.data-src = DBHelper.imageUrlForRestaurant(restaurant);
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = 'Picture from ' + restaurant.name + ' Restaurant';
  li.append(image);


  /******************/
  /*Restaurant Name Element*/
  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  li.append(name);


  /******************/
  /*Favorite Element*/
  
  // console.log("is_favorite: ", restaurant["is_favorite"]);
  // const isFavorite;
  // /*Checking that is_Favorite element exists and equals true*/
  // if(restaurant["is_favorite"] && restaurant["is_favorite"].toString() === "true"){
  //   isFavorite = true;
  // } else {
  //   isFavorite = false;
  // }
  
  // const favoriteDiv = document.createElement("div");
  // favoriteDiv.className = "favorite-icon";
  // const favorite = document.createElement("button");
  
  // /*Favorite button image selection*/
  // if(favorite.style.background = isFavorite){
  //   `url("/img/black-heart.svg") no-repeat`
  // } else {
  //   `url("/img/outline-heart.svg") no-repeat`;
  // }
   
  // /*Button Label for Accessibility/Screen Readers*/
  // favorite.innerHTML = isFavorite
  //   ? restaurant.name + " is a favorite"
  //   : restaurant.name + " is not a favorite";
  // favorite.id = "favorite-icon-" + restaurant.id;
  // favorite.onclick = event => handleFavoriteClick(restaurant.id, !isFavorite);
  // favoriteDiv.append(favorite);
  // div.append(favoriteDiv);


  /******************/
  /*Neighborhood Element*/
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  /******************/
  /*Address Element*/
  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  /******************/
  /*Link to Details, Element*/
  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}




/**
  * Register Service Worker and Log Message to check success
  */

if(!navigator.serviceWorker){
  console.log('Service Worker not supported by this browser');
};
navigator.serviceWorker.register('/sw.js').then(function(){
  console.log('Registration successful');
}).catch(function(){
  console.log('Registration failed');
})
