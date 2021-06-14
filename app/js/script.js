const eventsContainer = document.querySelector('.app__main-events');  // ul that contains all the workout events
const form = document.querySelector('.app__main-form');  // form to create the workout events
const formElevation = document.querySelector('.app__main-form-elevation');  // form section for elevation
const formCadence = document.querySelector('.app__main-form-cadence');  // form section for cadence
const typeOfWorkouts = document.getElementById('typeOfWorkouts');  // select tag for changing type of workout
const inputDistance = document.getElementById('distance');  // distance field
const inputDuration = document.getElementById('duration');  // duration field
const inputCadence = document.getElementById('cadence');   // cadence field
const inputElevation = document.getElementById('elevation');  // elevation field
const deleteAllBtn = document.querySelector('.deleteAll');  // delete all button

// Wherever you see 'common concept at the top', read the below documentation

/*
some common concept in this project-----

# when an object is created then the constructor function is immediately called
# we are initializing an object of class App in the global scope
# All the codes in the constructor function of App gets executed right when the page loads

$ keeping track of the value of 'this' in a class
$ 'this' refers to the object who is calling it
$ when calling 'addEventListener' on DOM element in class, 'this' refers to the respective DOM element
$ but 'this' inside the callBack function must refer to the current obj of the class[as per the need]
$ that is why, we are binding some callback function with 'this' which is the current obj[instance] of App

% when an event[workout] is created, a marker is also created 
% event is pushed in #workouts array and marker in #markers array both at the same index[simultaneously]
% when an event is deleted then the corresponding marker must be deleted right away
% So we are getting the index of event to be deleted and while deleting the event, we are also deleting the corresponding marker by retrieving it using that same index
*/ 


// to format the date 
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// parent class for common things between running and cycling
class Workout {
    constructor(distance, duration, coords) {  // taking common arguments
        this.distance = distance;  //KM
        this.duration = duration;  //MIN
        this.coords = coords;  // [lat, lng]
        this.id = Date.now();   // date in seconds from 1970 something
        this._getDate();  // common concept at the top 
    }

    _getDate() {
        const date = new Date();
        this.date = `${months[date.getMonth()]} ${date.getDate()}`;
    }
}

// blue print for running obj
class Running extends Workout{
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);  // constructor of parent class is called
        this.cadence = cadence;  // steps per min
        this.type = 'running';  // type of object
        this.calcPace();  // common concept at the top 
    }

    calcPace() {
        const calc = this.duration / this.distance;
        this.pace = +calc.toFixed(1);  // limit the decimal place to 1
    }
}

// blue print for cycling obj
class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);   // constructor of parent class is called
        this.elevationGain = elevationGain;  // meters
        this.type = 'cycling';  // type of objects
        this.calcSpeed();   // common concept at the top 
    } 

    calcSpeed() {
        const calc = this.distance / (this.duration / 60);
        this.speed = +calc.toFixed(1);
    }
}


// The application's main functionality 
class App {
    // private class fields 
    #coords;
    #mymap;
    #workouts;
    #markers = [];
    
    // this function will be called as the object of App is initialized 
    constructor() {
        this._getCurrentLocation(); 
        form.addEventListener('submit', this._newWorkout.bind(this)); // common concept at the top 
        typeOfWorkouts.addEventListener('change', this._toggleElevationField.bind(this));  // common concept at the top 

        // setTimeout(() => {
        //     this._renderFromLS();  // here the marker was loading right when the page laods, which is not possible because map is not rendered  
        // }, 500);                  //  that is why i was waiting 500ms so the map gets rendered and then marker can be rendered

        this._renderFromLS();  // calling this right away because the marker will render after the map is render and not when page loads[see the _loadMap method]
        eventsContainer.addEventListener('click', this._moveToMarker.bind(this));  // common concept at the top 
        deleteAllBtn.addEventListener('click', this._deleteAllWorkouts.bind(this));  // common concept at the top 
    }

    // get called right when page loads
    _getCurrentLocation() {
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), (error) => {  // common concept at the top
                alert(`This is ${error}`)
            })
        }
    }

    // gets called when we get the user's position
    _loadMap(position) {
          // getting the current position of the user in terms of latitute and longitude
            const { latitude: lat, longitude: lon } = position.coords;
            this.#mymap = L.map('mapContainer').setView([lat, lon], 15);  // making the map at user's position

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {  // adding style of the map
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',  // attribution to leaflet
            }).addTo(this.#mymap);

            this.#mymap.on('click', this._showForm.bind(this));  // common concept at the top

            // after the map is render, the marker is rendered
            this.#workouts.forEach(workout => {
                this._renderMarker(workout);
            })
    }

    // gets called when user clicks on map
    _showForm(mapEvent) {
        // position where the user clicked on the map
        const { lat, lng } = mapEvent.latlng;
        this.#coords = [lat, lng];  // storing this value in the private field so that it can be used in other method because let and const are inaccessible out of that block
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    // gets called when value of select tag is changed
    _toggleElevationField(e) {
        formElevation.classList.toggle('hidden');
        formCadence.classList.toggle('hidden');
    }

    // utility method to check if input is a valid number and not +ve or -ve infinity
    _validNum(...nums) {
        return nums.every(num => Number.isFinite(num));
    }

    // utility method to check if input is positive
    _arePositive(...nums) {
        return nums.every(num => num > 0)
    }

    // gets called when the form is submit
    _renderMarker(workout) {
        // making the marker/layer at the position where the user clicked by getting it from private field [see _showform method]
        const marker = L.marker(workout.coords);  
        
        // adding the marker in the map with some custom HTMl and CSS to the popup
        marker.addTo(this.#mymap)
            .bindPopup(`<p class="popup">${workout.type === 'running' ? '🏃‍♀️' : '🚴'} ${workout.type[0].toUpperCase()}${workout.type.slice(1)} on ${workout.date}</p>`,
                {
                    autoClose: false,
                    closeOnClick: false,
                    className: `popup-${workout.type}`,
                })
            .openPopup();

        this.#markers.push(marker)  // keeping all the markers/layers that the user is created in #markers array sequence-wise for later use
    }

    // gets called when the form is submit
    _renderWorkout(workout) {
        // using workout obj that is either created dynamically or comming from LS 
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

        if(workout.type === 'running') {  // to make sure, different UI is created for different workout
            htmlContent += `
                        <span class="app__main-events-event-bottom-activity">🏃‍♀️ ${workout.pace} <small>MIN/KM</small></span>
                        <span class="app__main-events-event-bottom-activity">🦶 ${workout.cadence} <small>SPM</small></span>
                    </div>
                </li>

            `;
        };

        if(workout.type === 'cycling') {  // to make sure, different UI is created for different workout
            htmlContent += `
                        <span class="app__main-events-event-bottom-activity">🚴 ${workout.speed} <small>KM/H</small></span>
                        <span class="app__main-events-event-bottom-activity">🗻 ${workout.elevationGain} <small>M</small></span>
                    </div>
                </li>
            `;
        };

        eventsContainer.insertAdjacentHTML('afterbegin', htmlContent);        
    }

    // gets called when page loads[see constructor function]
    _renderFromLS() {
        const datas = JSON.parse(localStorage.getItem('workouts')) || [];  
        this.#workouts = datas;  // keeping the data coming from LS into #workouts array

        datas.forEach((data) => {
            this._renderWorkout(data);  // rendering the events when data is coming from LS
        })
    }

    // gets called when the form is submit
    _newWorkout(e) {
        e.preventDefault();  // to prevent default behaviour of form to submit data to a server
        // inputs from the user's using that form
        const type = typeOfWorkouts.value;
        const distance = inputDistance.value;
        const duration = inputDuration.value;
        let workout;  // making it at local scope so that other blocks can use it together

        if(type === 'running') {  // two child classes
            const cadence = inputCadence.value;
            // using those utility classes 
            if(!this._validNum(distance, duration, cadence) && !this._arePositive(distance, duration, cadence)) return
            // creating Running obj as type is running
            workout = new Running(distance, duration, this.#coords, cadence);    
        }

        if (type === 'cycling') {  // two child classes
            const elevation = inputElevation.value;
            // using those utility classes 
            if (!this._validNum(distance, duration, elevation) && !this._arePositive(distance, duration)) return
            // creating Cylick obj as type is cycling
            workout = new Cycling(distance, duration, this.#coords, elevation);
        }
        // input fields must be emptied after form submission
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';  
        // form -> display:none;
        form.classList.add('hidden');
        // updating the #workouts array after user created an obj
        this.#workouts.push(workout);
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));  // updating LS too
        this._renderMarker(workout);
        this._renderWorkout(workout);
    }

    // gets called when clicked on eventsContainer[see constructor function]
    _moveToMarker(e) {
        const workoutFromUI = e.target.closest('.app__main-events-event');  // getting the event on which user clicked
        if(!workoutFromUI) return 
        // getting the corresponding obj from #workers array 
        const clickedWorkout = this.#workouts.find(workout => workout.id === +workoutFromUI.id);
        // getting index of the corresponding obj from #workers array 
        const index = this.#workouts.findIndex(workout => workout.id === +workoutFromUI.id);
        // moving the map to the corresponding marker 
        this.#mymap.setView(clickedWorkout.coords, 15, {
            animate: true,
        })
        // common concept at the top
        const currentMarker = this.#markers[index];

        if(e.target.classList.contains('delete')) {
            eventsContainer.removeChild(workoutFromUI);  // deleting from UI
            this.#workouts.splice(index, 1);  // deleting from #workouts
            localStorage.setItem('workouts', JSON.stringify(this.#workouts));  // updating the LS
            currentMarker.remove();  // common concept at the top
        }

    }

    // gets called when that delete button is clicked
    _deleteAllWorkouts(e) {
        // deleting all the events from both UI and LS
        eventsContainer.textContent = ''; 
        this.#workouts = [];
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
        this.#markers.forEach(marker => marker.remove());  // common concept at the top
    }
}

const app = new App();  // constructor function will now be called right when page loads