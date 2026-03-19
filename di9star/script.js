
const WEATHER_API_KEY = 'your_api_key';


const COMMANDS = {
    hi: () => '🐱 Meow! di9star\'s cat says hello!',
    help: () => `Commands: hi, date, time, weather, location, projects, specs, cat, clear, ls, whoami`,
    date: () => `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    time: () => `⏰ ${new Date().toLocaleTimeString('en-US')}`,
    weather: (weather) => `🌤️ ${weather?.city || 'your area'}: ${weather?.temp || '--'}°C, ${weather?.condition || 'unknown'}`,
    location: (loc) => `📍 ${loc?.city || 'unknown'}, ${loc?.country || 'unknown'}`,
    projects: () => `Projects: E-commerce, Banking App, di9starOS`,
    specs: () => `🖥️ CPU: Ryzen 9 7950X | GPU: RTX 4090 | RAM: 64GB | OS: Arch + Win11`,
    cat: () => `    /\\_/\\\n   ( o.o )\n    > ^ <\n   #di9star`,
    ls: () => `experience.log  projects.list  skills.config  education.txt  certs.pem  blog.posts  pc_specs.conf`,
    whoami: () => `di9star (creative developer & cat lover)`,
    clear: () => 'CLEAR'
};


const System = {
    weather: null,
    location: null,
    
    addToMiniTerminal(text, isCommand = false) {
        const output = document.getElementById('mini-terminal-output');
        if (!output) return;
        
        const p = document.createElement('p');
        if (isCommand) {
            p.innerHTML = `> ${text}`;
            p.style.color = 'var(--text-green)';
        } else {
            p.textContent = text;
            p.style.color = 'var(--text-blue)';
        }
        output.appendChild(p);
        
     
        while (output.children.length > 5) {
            output.removeChild(output.firstChild);
        }
        
     
        output.scrollTop = output.scrollHeight;
    },
    
    clearMiniTerminal() {
        const output = document.getElementById('mini-terminal-output');
        if (output) {
            output.innerHTML = '<p>> di9starOS terminal ready</p><p>> Type \'help\' for commands</p>';
        }
    }
};


document.addEventListener('DOMContentLoaded', () => {
    console.log('🐱 di9starOS starting...');
    
    initDateTime();
    initLocationAndWeather();
    initMiniTerminal();
    initKittyInteractions();
});


function initDateTime() {
    function update() {
        const timeElement = document.getElementById('current-time');
        const dateElement = document.getElementById('current-date');
        const now = new Date();
        
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        }
    }
    
    update();
    setInterval(update, 1000);
}


async function initLocationAndWeather() {
    const locationElement = document.getElementById('user-location');
    const weatherElement = document.getElementById('weather');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                   
                    const locResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                    );
                    const locData = await locResponse.json();
                    
                    const city = locData.address?.city || locData.address?.town || 'Unknown';
                    const country = locData.address?.country || 'Unknown';
                    
                    System.location = { city, country };
                    locationElement.textContent = `${city}, ${country}`;
                    
                   
                    await getWeather(position.coords.latitude, position.coords.longitude, city);
                    
                } catch (error) {
                    locationElement.textContent = 'Location detected';
                    await getWeather(position.coords.latitude, position.coords.longitude);
                }
            },
            () => {
                locationElement.textContent = 'Unknown';
                weatherElement.textContent = 'Unavailable';
            }
        );
    }
}

async function getWeather(lat, lon, city = null) {
    const weatherElement = document.getElementById('weather');
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) throw new Error('Weather API error');
        
        const data = await response.json();
        
        System.weather = {
            city: city || data.name,
            temp: Math.round(data.main.temp),
            condition: data.weather[0].description
        };
        
        const emoji = getWeatherEmoji(data.weather[0].main);
        weatherElement.innerHTML = `${emoji} ${System.weather.temp}°C`;
        
    } catch (error) {
        weatherElement.textContent = 'Weather unavailable';
    }
}

function getWeatherEmoji(weatherMain) {
    const emojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Snow': '❄️'
    };
    return emojis[weatherMain] || '🌤️';
}


function initMiniTerminal() {
    const input = document.getElementById('mini-terminal-input');
    if (!input) return;
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            input.value = '';
            
           
            System.addToMiniTerminal(`$ ${command}`, true);
            
         
            if (command === '') return;
            
            if (command === 'clear') {
                System.clearMiniTerminal();
            } else if (command === 'hi') {
                System.addToMiniTerminal(COMMANDS.hi());
               
                const kitty = document.getElementById('kitty');
                if (kitty) {
                    kitty.style.transform = 'scale(1.2)';
                    setTimeout(() => kitty.style.transform = 'scale(1)', 200);
                }
            } else if (command === 'help') {
                System.addToMiniTerminal(COMMANDS.help());
            } else if (command === 'date') {
                System.addToMiniTerminal(COMMANDS.date());
            } else if (command === 'time') {
                System.addToMiniTerminal(COMMANDS.time());
            } else if (command === 'weather') {
                System.addToMiniTerminal(COMMANDS.weather(System.weather));
            } else if (command === 'location') {
                System.addToMiniTerminal(COMMANDS.location(System.location));
            } else if (command === 'projects' || command === 'ls') {
                System.addToMiniTerminal(COMMANDS.projects());
            } else if (command === 'specs') {
                System.addToMiniTerminal(COMMANDS.specs());
            } else if (command === 'cat') {
                System.addToMiniTerminal(COMMANDS.cat());
            } else if (command === 'whoami') {
                System.addToMiniTerminal(COMMANDS.whoami());
            } else {
                System.addToMiniTerminal(`Command not found: ${command}`);
            }
        }
    });
}


function initKittyInteractions() {
    const kitty = document.getElementById('kitty');
    if (!kitty) return;
    
    kitty.addEventListener('click', () => {
        const msgs = [
            'Meow! 🐱',
            'Purr...',
            '*kitty rubs against you*',
            'di9star\'s cat!',
            '😺'
        ];
        System.addToMiniTerminal(msgs[Math.floor(Math.random() * msgs.length)]);
        
        kitty.style.animation = 'none';
        kitty.offsetHeight;
        kitty.style.animation = 'kitty-bounce 0.3s ease';
        setTimeout(() => {
            kitty.style.animation = 'kitty-bounce 2s infinite ease-in-out';
        }, 300);
    });
}


window.di9starOS = System;
