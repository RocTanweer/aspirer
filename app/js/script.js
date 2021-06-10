const form = document.querySelector('.app__main-form');
const typeOfWorkouts = document.getElementById('typeOfWorkouts');
const formElevation = document.querySelector('.app__main-form-elevation');
const formCadence = document.querySelector('.app__main-form-cadence');



class Workout {
    constructor(distance, duration, coords) {
        this.distance = distance;  //KM
        this.duration = duration;  //MIN
        this.coords = coords;  // []
        this.date = new Date(); 
        this.id = Date.now();
    }
}

class Running extends Workout{
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence;
        this.type = 'running';
        this._calcPace();
    }

    _calcPace() {
        this.pace = this.duration / this.distance;
    }
}

class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain;
        this.type = 'cycling';
        this._calcSpeed();
    }

    _calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }
}


class App {
    #coords;
    #mymap;
    
    constructor() {
        this._getCurrentLocation();
        form.addEventListener('submit', this._newWorkout.bind(this));
        typeOfWorkouts.addEventListener('change', this._toggleElevationField.bind(this));
    }

    _getCurrentLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), (error) => {
                alert(`This is ${error}`)
            })
        }
    }

    _loadMap(position) {
          // getting the current position of the user in terms of latitute and longitude
            const { latitude: lat, longitude: lon } = position.coords;
            this.mymap = L.map('mapContainer').setView([lat, lon], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.mymap);

            this.mymap.on('click', this._showForm.bind(this))
    }

    _showForm(mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        this.coords = [lat, lng];
        form.classList.remove('hidden');
    }

    _toggleElevationField(e) {
        formElevation.classList.toggle('hidden');
        formCadence.classList.toggle('hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        L.marker(this.coords)
            .addTo(this.mymap)
            .bindPopup('workout', {
                autoClose: false,
                closeOnClick: false,
                className: 'popup-cycling',
            })
            .openPopup();
    }


}

const app = new App();