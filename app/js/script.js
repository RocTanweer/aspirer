const form = document.querySelector('.app__main-form');
const formElevation = document.querySelector('.app__main-form-elevation');
const formCadence = document.querySelector('.app__main-form-cadence');
const typeOfWorkouts = document.getElementById('typeOfWorkouts');
const inputDistance = document.getElementById('distance');
const inputDuration = document.getElementById('duration');
const inputCadence = document.getElementById('cadence');
const inputElevation = document.getElementById('elevation');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class Workout {
    constructor(distance, duration, coords) {
        this.distance = distance;  //KM
        this.duration = duration;  //MIN
        this.coords = coords;  // []
        this.date = new Date();
        this.id = Date.now();
    }

    getDate() {
        return `${months[this.date.getMonth()]} ${this.date.getDay()}`
    }
}

class Running extends Workout{
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.cadence = cadence;
        this.type = 'running';
        this.calcPace();
    }

    calcPace() {
        this.pace = this.duration / this.distance;
    }
}

class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.elevationGain = elevationGain;
        this.type = 'cycling';
        this.calcSpeed();
    }

    calcSpeed() {
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
            this.#mymap = L.map('mapContainer').setView([lat, lon], 15);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(this.#mymap);

            this.#mymap.on('click', this._showForm.bind(this))
    }

    _showForm(mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        this.#coords = [lat, lng];
        form.classList.remove('hidden');
    }

    _toggleElevationField(e) {
        formElevation.classList.toggle('hidden');
        formCadence.classList.toggle('hidden');
    }

    _validNum(...nums) {
        return nums.every(num => Number.isFinite(num));
    }

    _arePositive(...nums) {
        return nums.every(num => num > 0)
    }

    _renderMarker(workout) {
        L.marker(this.#coords)
            .addTo(this.#mymap)
            .bindPopup(`<p style="font-size : 16px;">${workout.type === 'running' ? '🏃‍♀️' : '🚴'} ${workout.type} on ${workout.getDate()}</p>`,
                {
                    autoClose: false,
                    closeOnClick: false,
                    className: `popup-${workout.type}`,
                })
            .openPopup();
    }

    _newWorkout(e) {
        e.preventDefault();

        const type = typeOfWorkouts.value;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        let workout;

        if(type === 'running') {
            const cadence = inputCadence.value;
            
            if(!this._validNum(distance, duration, cadence) && !this._arePositive(distance, duration, cadence)) return

            workout = new Running(distance, duration, this.#coords, cadence);    
        }

        if (type === 'cycling') {
            const elevation = inputElevation.value;

            if (!this._validNum(distance, duration, elevation) && !this._arePositive(distance, duration)) return

            workout = new Cycling(distance, duration, this.#coords, elevation);
            console.log(workout)
        }

        this._renderMarker(workout)
    }


}

const app = new App();