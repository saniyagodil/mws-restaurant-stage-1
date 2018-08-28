self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open('restaurant-app')
    .then(function(cache){
      return cache.addAll([
        'index.html',
        'restaurant.html',
        'css/styles.css',
        'js/main.js',
        'js/dbhelper.js',
        'js/restaurant_info.js',
        'img/1-500px.jpg',
        'img/2-500px.jpg',
        'img/3-500px.jpg',
        'img/4-500px.jpg',
        'img/5-500px.jpg',
        'img/6-500px.jpg',
        'img/7-500px.jpg',
        'img/8-500px.jpg',
        'img/9-500px.jpg',
        'img/10-500px.jpg',
        'data/restaurants.json'
      ]);
    })
  );
});



self.addEventListener('fetch', function(event){
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin')
    return
      event.respondWith(
        caches.match(event.request).then(function(response){
          if(response) return response;
          return fetch(event.request);
        })
      );
});
