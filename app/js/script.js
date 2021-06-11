const eventsContainer = document.querySelector('.app__main-events');
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
        this.id = Date.now();
        this._getDate();
    }

    _getDate() {
        const date = new Date();
        this.date = `${months[date.getMonth()]} ${date.getDay()}`;
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
        return this.pace
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
            .bindPopup(`<p style="font-size : 16px;">${workout.type === 'running' ? '🏃‍♀️' : '🚴'} ${workout.type[0].toUpperCase()}${workout.type.slice(1)} on ${workout.date}</p>`,
                {
                    autoClose: false,
                    closeOnClick: false,
                    className: `popup-${workout.type}`,
                })
            .openPopup();
    }

    _renderWorkout(workout) {
        let htmlContent = `
            <li class="app__main-events-event workout-${workout.type}">
                <div class="app__main-events-event-top">
                    <span class="app__main-events-event-top-date" id="date">${workout.type[0].toUpperCase()}${workout.type.slice(1)} on ${workout.date}</span>
                    <span class="app__main-events-event-top-iconContainer">
                        <button aria-label="edit-button" class="icon">
                            <span class="sr-only">edit icon</span>
                            <i class="far fa-edit"></i>
                        </button>
                        <button aria-label="delete-button" class="icon">
                            <span class="sr-only">delete icon</span>
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </span>
                </div>

                <div class="app__main-events-event-bottom">
                    <span class="app__main-events-event-bottom-activity">🛣️ 2 <small>KM</small></span>
                    <span class="app__main-events-event-bottom-activity">🕰️ 2 <small>MIN</small></span>
        `;

        if(workout.type === 'running') {
            htmlContent += `
                        <span class="app__main-events-event-bottom-activity">🏃‍♀️ ${workout.pace} <small>MIN/KM</small></span>
                        <span class="app__main-events-event-bottom-activity">🦶 ${workout.cadence} <small>SPM</small></span>
                    </div>
                </li>

            `;
        };

        if(workout.type === 'cycling') {
            htmlContent += `
                        <span class="app__main-events-event-bottom-activity">🚴 ${workout.speed} <small>KM/H</small></span>
                        <span class="app__main-events-event-bottom-activity">🗻 ${workout.elevationGain} <small>M</small></span>
                    </div>
                </li>
            `;
        };

        eventsContainer.insertAdjacentHTML('afterbegin', htmlContent);        
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
            console.log(workout.type)
        }

        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';

        form.classList.add('hidden');

        this._renderMarker(workout);

        this._renderWorkout(workout);
    }


}

const app = new App();