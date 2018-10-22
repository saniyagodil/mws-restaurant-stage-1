let restaurant;
let heartState;
var map;

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}


/******************/
/*Favorite Element*/


/******************/
/* Create restaurant HTML and add it to the webpage*/

fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = 'Picture from ' + restaurant.name + ' Restaurant';

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  DBHelper.fetchReviewById(restaurant.id, fillReviewsHTML);
  const isString = (typeof restaurant.is_favorite === 'string' || restaurant.is_favorite instanceof String);
  const shouldBeFavorite = (isString && restaurant.is_favorite == "true") || (!isString && restaurant.is_favorite)
  setFavorite(shouldBeFavorite)

  // DBHelper.fetchReviewById(restaurant.id).then(reviews => { console.log(reviews) });
  // DBHelper.fetchReviewById(restaurant.id).then(reviews => fillReviewsHTML(reviews));
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (error, review_data = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);
  // TODO: pull this out to a function to remove duplicate code
  if (Array.isArray(review_data)) {
    if (!review_data) {
      const noReviews = document.createElement('p');
      noReviews.innerHTML = 'No reviews yet!';
      container.appendChild(noReviews);
      return;
    }
    const ul = document.getElementById('reviews-list');
    review_data.forEach(review =>{
      ul.appendChild(createReviewHTML(review))
    })
    container.appendChild(ul);
  } else {
      review_data.then(reviews => {
        if (!reviews) {
          const noReviews = document.createElement('p');
          noReviews.innerHTML = 'No reviews yet!';
          container.appendChild(noReviews);
          return;
        }
        const ul = document.getElementById('reviews-list');
        reviews.forEach(review =>{
          ul.appendChild(createReviewHTML(review))
        })
        container.appendChild(ul);
      }).catch(error => console.log("fillReviewsHTML Error" + error));
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

addReview = () => {
  const review = {
    name: document.getElementById('review_name').value,
    rating: parseInt(document.getElementById('review_rating').value),
    restaurant_id: parseInt(getParameterByName('id')),
    comments: document.getElementById('review_comment').value,
    //date: Date.now(),
  }
  DBHelper.addReview(review)
  //post to server code, check if online, if yes => post method, if no => cache
}

toggleFavorite = () => {
    restaurant_id = parseInt(getParameterByName('id'))
    DBHelper.toggleFavorite(restaurant_id, setFavorite)
}

setFavorite = (is_favorite) => {
    let button = document.getElementById('favorite_button')
    let image = ""
    if (is_favorite) {
        image = "<img id=\"button_img\" src=\"/img/red-heart.svg\"/>"
    } else {
        image = "<img id=\"button_img\" src=\"/img/black-heart.svg\"/>"
    }
    button.innerHTML = image;
    button.style.height = '50px'
    button.style.width= '50px'
    let img = document.getElementById('button_img')
    img.style.height = '50px'
    img.style.width= '50px'
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


//testing testing
