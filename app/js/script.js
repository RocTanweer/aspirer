const form = document.querySelector('.app__main-form');
let coords;
let mymap;

// Using Geolocation API for the first time--------------
const loc = navigator.geolocation.getCurrentPosition((position) => {
    // getting the current position of the user in terms of latitute and longitude
    const {latitude:lat, longitude:lon} = position.coords;
    mymap = L.map('mapContainer').setView([lat, lon], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    mymap.on('click', (mapEvent) => {
        const {lat, lng} = mapEvent.latlng;
        coords = [lat, lng];
        form.classList.remove('hidden');
    })


}, (error) => {
    alert(`This is ${error}`)
});
// https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
// https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png


form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    L.marker(coords)
        .addTo(mymap)
        .bindPopup('workout', {
            autoClose: false,
            closeOnClick: false,
            className: 'popup-cycling',
        })
        .openPopup();
})