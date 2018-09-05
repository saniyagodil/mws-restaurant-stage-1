class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static restarauntDB(){return idb.open("restaurant-db",1,function(t){t.createObjectStore("restaurants",{keyPath:"id",autoIncrement:!0})})}static readObjectStore(t,e){return t.transaction("restaurants",e).objectStore("restaurants")}static fetchRestaurants(t,e){let r;r=e?DBHelper.DATABASE_URL+"/"+e:DBHelper.DATABASE_URL,fetch(r,{method:"GET"}).then(t=>t.json()).then(e=>{console.log("Retrieved restaurants",e),e.length&&t(null,e)}).catch(e=>t("Request failed. Error: ",e))}static fetchRestaurantById(t,e){DBHelper.fetchRestaurants((r,a)=>{if(r)e(r,null);else{const r=a.find(e=>e.id==t);r?e(null,r):e("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(t,e){DBHelper.fetchRestaurants((r,a)=>{if(r)e(r,null);else{const r=a.filter(e=>e.cuisine_type==t);e(null,r)}})}static fetchRestaurantByNeighborhood(t,e){DBHelper.fetchRestaurants((r,a)=>{if(r)e(r,null);else{const r=a.filter(e=>e.neighborhood==t);e(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(t,e,r){DBHelper.fetchRestaurants((a,n)=>{if(console.log(n),a)r(a,null);else{let a=n;"all"!=t&&(a=a.filter(e=>e.cuisine_type==t)),"all"!=e&&(a=a.filter(t=>t.neighborhood==e)),r(null,a)}})}static fetchNeighborhoods(t){DBHelper.fetchRestaurants((e,r)=>{if(e)t(e,null);else{const e=r.map((t,e)=>r[e].neighborhood),a=e.filter((t,r)=>e.indexOf(t)==r);t(null,a)}})}static fetchCuisines(t){DBHelper.fetchRestaurants((e,r)=>{if(e)t(e,null);else{const e=r.map((t,e)=>r[e].cuisine_type),a=e.filter((t,r)=>e.indexOf(t)==r);t(null,a)}})}static urlForRestaurant(t){return`./restaurant.html?id=${t.id}`}static imageUrlForRestaurant(t){return`/img/${t.id}`+"-200px.jpg"}static mapMarkerForRestaurant(t,e){return new google.maps.Marker({position:t.latlng,title:t.name,url:DBHelper.urlForRestaurant(t),map:e,animation:google.maps.Animation.DROP})}}