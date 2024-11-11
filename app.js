const API_KEY = 'a406d8a17fe0ea21405eddaa7271fa1c'; 
const defaultCities = ['tucson', 'nogales', 'phoenix']; // Ciudades predeterminadas
let userCities = []; // Almacenaremos las ciudades del usuario en memoria

document.addEventListener('DOMContentLoaded', () => {
    checkStoredCity();
    displayCities(); // Muestra las ciudades al cargar
    document.getElementById('city-input-form').addEventListener('submit', handleCitySubmit);
    document.getElementById('add-city-btn').addEventListener('click', addUserCity);
    document.getElementById('reset-btn').addEventListener('click', resetCity);
});

// Función para verificar si ya hay una ciudad almacenada
function checkStoredCity() {
    const storedCity = localStorage.getItem('city');
    if (storedCity) {
        getWeather(storedCity); // Muestra el clima de la ciudad almacenada
        document.getElementById('city-form').style.display = 'none'; // Oculta el formulario
    } else {
        document.getElementById('welcome-message').classList.add('hidden'); // Oculta el mensaje si no hay ciudad
        document.getElementById('city-form').style.display = 'block'; // Muestra el formulario
    }
}   

// Función para manejar la entrada del usuario
function handleCitySubmit(event) {
    // Previene el comportamiento por defecto del formulario (recargar la página)
    event.preventDefault();
    
    // Obtiene el valor del campo de entrada con el ID 'city-name'
    const city = document.getElementById('city-name').value;
    
    // Verifica si se ha ingresado una ciudad
    if (city) {
        // Almacena la ciudad en el localStorage del navegador
        localStorage.setItem('city', city);
        
        // Llama a la función que obtiene la temperatura de la ciudad ingresada
        getWeather(city);
        
        // Oculta el formulario de entrada de la ciudad
        document.getElementById('city-form').style.display = 'none';
        
        // Muestra el mensaje de bienvenida
        document.getElementById('welcome-message').classList.remove('hidden');
    }
}

// Función para obtener el clima de una ciudad
function getWeather(city) {

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    // Realiza una solicitud HTTP a la URL construida
    fetch(url)
        .then(response => {
            // Verifica si la respuesta fue exitosa
            if (!response.ok) {
                // Si no fue exitosa, lanza un error con el código de estado
                throw new Error(`Error: Ciudad no encontrada (${response.status})`);
            }
            // Si la respuesta fue exitosa, convierte la respuesta en formato JSON
            return response.json();
        })
        .then(data => {
            // Verifica que la respuesta contenga la información de temperatura y clima
            if (data.main && data.weather && data.weather.length > 0) {
                // Obtiene la temperatura actual de la respuesta
                const temperature = data.main.temp;
                // Obtiene el ícono del clima de la respuesta
                const weatherIcon = data.weather[0].icon; // Obtenemos el ícono del clima
                // Construye la URL para el ícono de clima
                const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

                // Actualiza el contenido del div de bienvenida con la temperatura y el ícono
                document.getElementById('welcome-message').innerHTML = `
                    Bienvenido, el clima en ${city} es: ${temperature}°C 
                    <img src="${iconUrl}" alt="Clima en ${city}" class="weather-icon">
                `;

               
                document.getElementById('welcome-message').style.display = 'block';

               
                return temperature; 
            } else {
                // Si los datos no son válidos, muestra un mensaje de error
                document.getElementById('welcome-message').textContent = 'No se pudo obtener la temperatura.';
            }
        })
        .catch(error => {
            // Maneja cualquier error ocurrido durante la solicitud o el procesamiento de datos
            console.error('Error al obtener el clima:', error);
            // Muestra un mensaje de error en caso de que no se pueda obtener el clima
            document.getElementById('welcome-message').textContent = 'No se pudo obtener el clima. Verifica el nombre de la ciudad.';
        });
}

// Función para eliminar una ciudad del usuario
function removeUserCity(city) {
    userCities = userCities.filter(c => c !== city); // Elimina la ciudad del arreglo
    displayCities(); // Muestra las ciudades actualizadas
}

// Función para mostrar ciudades (predeterminadas y agregadas por el usuario)
function displayCities() {
    // Obtiene el elemento con el ID 'city-list' del DOM
    const cityList = document.getElementById('city-list');
    // Limpia la lista existente antes de agregar nuevas ciudades
    cityList.innerHTML = '';

    // Combinar ciudades predeterminadas y agregadas por el usuario
    const allCities = [...defaultCities, ...userCities];
    // Usamos un Set para evitar duplicados y obtener una lista única de ciudades
    const uniqueCities = [...new Set(allCities)];

    // Itera sobre cada ciudad única
    uniqueCities.forEach(city => {
        // Crea un nuevo elemento 'div' para la tarjeta del clima
        const card = document.createElement('div');
        // Agrega la clase 'weather-card' al div
        card.classList.add('weather-card'); 

        // Llamar api para obtener el clima de la ciudad
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                // Verifica si la respuesta contiene datos de clima
                if (data.main && data.weather) {
                    // Obtiene la temperatura y el icono del clima de los datos
                    const temperature = data.main.temp;
                    const weatherIcon = data.weather[0].icon;
                    const iconUrl = `https://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

                    // Crear el contenido para mostrar la ciudad y la temperatura
                    card.innerHTML = `
                        <div class="card-body">
                            <h5>${city}</h5>
                            <p>${temperature}°C</p>
                            <img src="${iconUrl}" alt="Clima en ${city}" class="weather-icon">
                        </div>
                    `;

                    // Solo agregar el botón de eliminar si la ciudad es del usuario
                    if (userCities.includes(city)) {
                        // Crea un botón para eliminar la ciudad
                        const removeBtn = document.createElement('button');
                        // Texto para el botón
                        removeBtn.textContent = 'X';
                       
                        removeBtn.classList.add('btn', 'btn-danger', 'btn-sm', 'float-end');
                       
                        removeBtn.addEventListener('click', () => {
                            removeUserCity(city); // Función para eliminar la ciudad
                        });
                        
                        card.querySelector('.card-body').appendChild(removeBtn);
                    }

                    // Agregar la tarjeta a la lista de ciudades
                    cityList.appendChild(card);
                }
            })
            .catch(error => {
                // Maneja errores en la llamada a la API
                console.error(`Error al obtener el clima de ${city}:`, error);
                // Muestra un mensaje de error en la tarjeta
                card.innerHTML = `<p>${city} - No se pudo obtener el clima.</p>`;
                // Agregar la tarjeta a la lista aunque haya error
                cityList.appendChild(card);
            });
    });

    // Actualiza la ciudad más caliente
    findHottestCity();
}


// Función para agregar una ciudad del usuario
function addUserCity() {
    const newCity = document.getElementById('new-default-city').value.trim(); // Obtiene el valor de la nueva ciudad y lo convierte a minúsculas
    // Verifica que la ciudad no esté vacía y no sea un duplicado
    if (newCity && !userCities.includes(newCity) && !defaultCities.includes(newCity)) {
        userCities.push(newCity); // Agrega la nueva ciudad al arreglo
        document.getElementById('new-default-city').value = ''; // Limpiar el campo de entrada
        displayCities(); // Muestra las ciudades actualizadas
        findHottestCity(); // Actualiza la ciudad más caliente después de agregar la nueva ciudad
    } else {
        alert('La ciudad ya está en la lista o el campo está vacío.'); 
    }
}



// Función para encontrar la ciudad más caliente
function findHottestCity() {
    // Inicializa la variable hottestCity como null para almacenar la ciudad más caliente
    let hottestCity = null;
    // Inicializa highestTemp con -Infinity para asegurar que cualquier temperatura real será mayor
    let highestTemp = -Infinity;
    // Variable para almacenar el ícono de la ciudad más caliente
    let hottestCityIcon = '';

    // Combina las ciudades predeterminadas y del usuario en un solo array
    const allCities = [...defaultCities, userCities];
    
    // Itera sobre cada ciudad en el array combinado
    allCities.forEach(city => {
        // Llama a la API de OpenWeather para obtener el clima de cada ciudad
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`)
            .then(response => response.json()) // Convierte la respuesta a JSON
            .then(data => {
                // Verifica si la respuesta contiene datos de clima
                if (data.main && data.weather) {
                    // Obtiene la temperatura de los datos
                    const temperature = data.main.temp;
                    // Si la temperatura es mayor que highestTemp, actualiza las variables
                    if (temperature > highestTemp) {
                        highestTemp = temperature;
                        hottestCity = city;
                        hottestCityIcon = data.weather[0].icon; // Almacena el ícono de la ciudad más caliente
                    }
                }
                // Actualiza la información de la ciudad más caliente en el DOM
                document.getElementById('hottest-city-info').innerHTML = `
                    La ciudad más caliente es ${hottestCity} con ${highestTemp}°C 
                    <img src="https://openweathermap.org/img/wn/${hottestCityIcon}@2x.png" alt="Clima en ${hottestCity}" class="weather-icon"> 
                `;
            })
            // Maneja errores en la llamada a la API
            .catch(error => console.error('Error al obtener el clima:', error));
    });
}

// Función para resetear la ciudad almacenada
function resetCity() {
    localStorage.removeItem('city');
    document.getElementById('welcome-message').textContent = '';
    document.getElementById('city-form').style.display = 'block';
}



