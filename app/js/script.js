const eventsContainer = document.querySelector('.app__main-events');
const form = document.querySelector('.app__main-form');
const formElevation = document.querySelector('.app__main-form-elevation');
const formCadence = document.querySelector('.app__main-form-cadence');
const typeOfWorkouts = document.getElementById('typeOfWorkouts');
const inputDistance = document.getElementById('distance');
const inputDuration = document.getElementById('duration');
const inputCadence = document.getElementById('cadence');
const inputElevation = document.getElementById('elevation');
const deleteAllBtn = document.querySelector('.deleteAll');

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
        this.date = `${months[date.getMonth()]} ${date.getDate()}`;
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
        const calc = this.duration / this.distance;
        this.pace = +calc.toFixed(1);
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
        const calc = this.distance / (this.duration / 60);
        this.speed = +calc.toFixed(1);
    }
}

class App {
    #coords;
    #mymap;
    #workouts;
    #markers = [];
    
    constructor() {
        this._getCurrentLocation();
        form.addEventListener('submit', this._newWorkout.bind(this));
        typeOfWorkouts.addEventListener('change', this._toggleElevationField.bind(this));
        // setTimeout(() => {
        //     this._renderFromLS();
        // }, 500);

        this._renderFromLS();
        eventsContainer.addEventListener('click', this._moveToMarker.bind(this));
        deleteAllBtn.addEventListener('click', this._deleteAllWorkouts.bind(this));
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

            this.#mymap.on('click', this._showForm.bind(this));

            this.#workouts.forEach(workout => {
                this._renderMarker(workout);
            })
    }

    _showForm(mapEvent) {
        const { lat, lng } = mapEvent.latlng;
        this.#coords = [lat, lng];
        form.classList.remove('hidden');
        inputDistance.focus();
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
        const marker = L.marker(workout.coords);
        
        marker.addTo(this.#mymap)
            .bindPopup(`<p class="popup">${workout.type === 'running' ? '🏃‍♀️' : '🚴'} ${workout.type[0].toUpperCase()}${workout.type.slice(1)} on ${workout.date}</p>`,
                {
                    autoClose: false,
                    closeOnClick: false,
                    className: `popup-${workout.type}`,
                })
            .openPopup();

        this.#markers.push(marker)
    }

    _renderWorkout(workout) {
        let htmlContent = `
            <li class="app__main-events-event workout-${workout.type}" id=${workout.id}>
                <div class="app__main-events-event-top">
                    <span class="app__main-events-event-top-date" id="date">${workout.type[0].toUpperCase()}${workout.type.slice(1)} on ${workout.date}</span>
                    <span class="app__main-events-event-top-iconContainer">
                        <button aria-label="edit-button" class="icon edit">
                            <span class="sr-only">edit icon</span>
                            <i class="far fa-edit"></i>
                        </button>
                        <button aria-label="delete-button" class="icon delete">
                            <span class="sr-only">delete icon</span>
                            <i class="far fa-trash-alt"></i>
                        </button>
                    </span>
                </div>

                <div class="app__main-events-event-bottom">
                    <span class="app__main-events-event-bottom-activity">🛣️ ${workout.distance} <small>KM</small></span>
                    <span class="app__main-events-event-bottom-activity">🕰️ ${workout.duration} <small>MIN</small></span>
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

    _renderFromLS() {
        const datas = JSON.parse(localStorage.getItem('workouts')) || [];
        this.#workouts = datas;

        datas.forEach((data) => {
            this._renderWorkout(data);
        })
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
        }
        
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
        // console.log(workout)

        form.classList.add('hidden');


        this.#workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));

        this._renderMarker(workout);

        this._renderWorkout(workout);
    }

    _moveToMarker(e) {
        const workoutFromUI = e.target.closest('.app__main-events-event');

        if(!workoutFromUI) return
        
        const clickedWorkout = this.#workouts.find(workout => workout.id === +workoutFromUI.id);
        const index = this.#workouts.findIndex(workout => workout.id === +workoutFromUI.id);

        this.#mymap.setView(clickedWorkout.coords, 15, {
            animate: true,
        })

        const currentMarker = this.#markers[index];

        if(e.target.classList.contains('delete')) {
            eventsContainer.removeChild(workoutFromUI);
            this.#workouts.splice(index, 1);
            localStorage.setItem('workouts', JSON.stringify(this.#workouts));
            currentMarker.remove();
        }

    }

    _deleteAllWorkouts(e) {
        eventsContainer.textContent = '';
        this.#workouts = [];
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
        this.#markers.forEach(marker => marker.remove());
    }
}

const app = new App();