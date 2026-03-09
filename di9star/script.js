
const WEATHER_API_KEY = 'bd5e378503939ddaee76f12ad7a97608'; 

const PROJECTS = [
    { 
        id: 1, 
        name: 'experience.log', 
        desc: '5+ years in web dev',
        details: '• Senior Frontend Dev @ TechCorp (2022-now)\n• Full Stack @ StartupX (2020-2022)\n• Freelance (2018-2020)',
        icon: '💼'
    },
    { 
        id: 2, 
        name: 'projects.list', 
        desc: 'featured work',
        details: '• E-commerce platform (React/Node)\n• Mobile banking app (React Native)\n• di9starOS (you\'re here!)',
        icon: '🚀'
    },
    { 
        id: 3, 
        name: 'skills.config', 
        desc: 'tech stack',
        details: '• Frontend: React, Vue, Svelte\n• Backend: Node, Python, Go\n• DevOps: Docker, AWS, CI/CD',
        icon: '⚡'
    },
    { 
        id: 4, 
        name: 'education.txt', 
        desc: 'academic background',
        details: '• MS Computer Science @ Stanford\n• BS Software Engineering @ MIT\n• Certifications: AWS, GCP',
        icon: '🎓'
    },
    { 
        id: 5, 
        name: 'certs.pem', 
        desc: 'certificates',
        details: '• AWS Solutions Architect\n• Google Cloud Professional\n• Meta Frontend Developer',
        icon: '📜'
    },
    { 
        id: 6, 
        name: 'blog.posts', 
        desc: 'latest writings',
        details: '• "Building di9starOS"\n• "Cat-driven Development"\n• "Terminal Aesthetics in 2024"',
        icon: '✍️'
    },
    { 
        id: 7, 
        name: 'pc_specs.conf', 
        desc: "di9star's rig",
        details: '• CPU: AMD Ryzen 9 7950X\n• GPU: NVIDIA RTX 4090 24GB\n• RAM: 64GB DDR5 6000MHz\n• STORAGE: 2TB NVMe + 4TB HDD\n• OS: Arch Linux + Windows 11',
        icon: '🖥️'
    }
];

const COMMANDS = {
    hi: () => {
        return [
            '🐱 Meow! di9star\'s cat says hello!',
            '💬 The kitty whispers: "hi di9star!"',
            '😺 *purrs happily for di9star*'
        ][Math.floor(Math.random() * 3)];
    },
    help: () => {
        return `Available commands:
  hi        - Say hi to di9star's kitty
  date      - Show current date
  time      - Show current time
  weather   - Show real weather in your location
  location  - Show your location
  projects  - List all projects
  specs     - Show di9star's PC specs
  clear     - Clear terminal
  cat       - Show kitty art
  ls        - List all modules
  pwd       - Show current directory
  whoami    - Show user info`;
    },
    date: () => {
        return `📅 ${new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        })}`;
    },
    time: () => {
        return `⏰ ${new Date().toLocaleTimeString('en-US')}`;
    },
    weather: (weatherData) => {
        if (weatherData) {
            return `🌤️ ${weatherData.city}: ${weatherData.temp}°C, ${weatherData.condition} (${weatherData.humidity}% humidity, wind ${weatherData.wind} m/s)`;
        }
        return "🌤️ Weather data loading...";
    },
    location: (loc) => {
        if (loc) {
            return `📍 ${loc.city}, ${loc.region}, ${loc.country}`;
        }
        return "📍 Detecting location...";
    },
    projects: () => {
        return PROJECTS.map(p => `  ${p.icon} ${p.name} - ${p.desc}`).join('\n');
    },
    specs: () => {
        return `🖥️ di9star's PC Specifications:
  • CPU: AMD Ryzen 9 7950X (16 cores, 32 threads)
  • GPU: NVIDIA RTX 4090 24GB GDDR6X
  • RAM: 64GB DDR5 6000MHz (4x16GB)
  • STORAGE: 2TB Samsung 990 Pro NVMe + 4TB HDD
  • OS: Arch Linux (main) + Windows 11 (dual boot)
  • COOLING: Custom water cooling loop
  • CASE: Lian Li O11 Dynamic EVO`;
    },
    cat: () => {
        return `    /\_/\\
   ( o.o )
    > ^ <
`;
    },
    ls: () => {
        return `experience.log  projects.list  skills.config  education.txt  certs.pem  blog.posts  pc_specs.conf`;
    },
    pwd: () => {
        return `/home/di9star/projects`;
    },
    whoami: () => {
        return `di9star (creative developer & cat lover)`;
    },
    clear: () => {
        return 'CLEAR';
    }
};

// System state
const System = {
    weather: null,
    location: null,
    terminalOutput: [],
    
    addToTerminal(text, isCommand = false) {
        const output = document.getElementById('terminal-output');
        if (!output) return;
        
        const p = document.createElement('p');
        if (isCommand) {
            p.innerHTML = `<span class="prompt">$</span> ${text}`;
        } else {
            p.textContent = text;
            p.style.color = 'var(--text-green)';
        }
        output.appendChild(p);
        
        // Auto-scroll
        output.scrollTop = output.scrollHeight;
        
        // Keep only last 20 lines
        while (output.children.length > 20) {
            output.removeChild(output.firstChild);
        }
    },
    
    clearTerminal() {
        const output = document.getElementById('terminal-output');
        if (output) {
            output.innerHTML = '';
            this.addToTerminal('Terminal cleared. Type \'help\' for commands.');
        }
    }
};

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐱 nastuhOS starting...');
    
    // Start all systems
    initDateTime();
    initLocationAndWeather(); // Combined function now
    initClickHandlers();
    initTerminal();
    initKittyInteractions();
    
    // Welcome message
    setTimeout(() => {
        System.addToTerminal('System ready. di9star\'s kitty is waiting for you! 🐱');
    }, 500);
});

// Date and Time
function initDateTime() {
    function update() {
        const now = new Date();
        
        // Time
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
        // Date
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    }
    
    update();
    setInterval(update, 1000);
}

// Location and REAL Weather
async function initLocationAndWeather() {
    const locationElement = document.getElementById('user-location');
    const weatherElement = document.getElementById('weather');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // First get location name
                    const locationResponse = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                    );
                    const locationData = await locationResponse.json();
                    
                    const city = locationData.address.city || 
                                 locationData.address.town || 
                                 locationData.address.village || 
                                 locationData.address.suburb ||
                                 'Unknown';
                    const region = locationData.address.state || 
                                  locationData.address.county || 
                                  '';
                    const country = locationData.address.country || 'Unknown';
                    
                    System.location = { 
                        city, 
                        region, 
                        country,
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    
                    locationElement.textContent = `${city}, ${country}`;
                    
                    // Now get REAL weather
                    await getRealWeather(position.coords.latitude, position.coords.longitude, city);
                    
                } catch (error) {
                    console.error('Location error:', error);
                    locationElement.textContent = 'Location detected';
                    
                    // Try weather with just coordinates
                    await getRealWeather(position.coords.latitude, position.coords.longitude);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                locationElement.textContent = 'Unknown';
                weatherElement.textContent = 'Unavailable';
                
                // Fallback to IP-based location
                getLocationByIP();
            }
        );
    } else {
        locationElement.textContent = 'Not supported';
        weatherElement.textContent = 'Unavailable';
    }
}

// Get REAL weather from OpenWeatherMap
async function getRealWeather(lat, lon, cityName = null) {
    const weatherElement = document.getElementById('weather');
    
    try {
        // Using OpenWeatherMap API (free tier)
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
        );
        
        if (!response.ok) {
            throw new Error('Weather API error');
        }
        
        const data = await response.json();
        
        System.weather = {
            city: cityName || data.name,
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            condition: data.weather[0].description,
            humidity: data.main.humidity,
            wind: data.wind.speed,
            icon: data.weather[0].icon
        };
        
        // Update weather display
        weatherElement.innerHTML = `${System.weather.temp}°C, ${System.weather.condition}`;
        
        // Add weather emoji based on condition
        const weatherEmoji = getWeatherEmoji(data.weather[0].main);
        weatherElement.innerHTML = `${weatherEmoji} ${System.weather.temp}°C, ${System.weather.condition}`;
        
        console.log('Weather updated for', System.weather.city);
        
    } catch (error) {
        console.error('Weather fetch error:', error);
        weatherElement.textContent = 'Weather unavailable';
        
        // Fallback to simulated weather
        simulateWeather(cityName);
    }
}

// Fallback: Get location by IP
async function getLocationByIP() {
    const locationElement = document.getElementById('user-location');
    const weatherElement = document.getElementById('weather');
    
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.city) {
            System.location = {
                city: data.city,
                region: data.region,
                country: data.country_name,
                lat: data.latitude,
                lon: data.longitude
            };
            
            locationElement.textContent = `${data.city}, ${data.country_name}`;
            
            // Try weather with IP coordinates
            if (data.latitude && data.longitude) {
                await getRealWeather(data.latitude, data.longitude, data.city);
            } else {
                simulateWeather(data.city);
            }
        }
    } catch (error) {
        console.error('IP location error:', error);
        locationElement.textContent = 'Unknown';
        simulateWeather();
    }
}

// Fallback: Simulated weather
function simulateWeather(city = 'your area') {
    const weatherElement = document.getElementById('weather');
    
    const conditions = ['Sunny ☀️', 'Partly Cloudy ⛅', 'Cloudy ☁️', 'Clear 🌙', 'Light Rain 🌧️'];
    const temps = [18, 20, 22, 24, 19, 21, 17];
    
    System.weather = {
        city: city,
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        temp: temps[Math.floor(Math.random() * temps.length)],
        simulated: true
    };
    
    weatherElement.textContent = `${System.weather.temp}°C, ${System.weather.condition} (simulated)`;
}

// Helper: Get weather emoji
function getWeatherEmoji(weatherMain) {
    const emojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️'
    };
    
    return emojis[weatherMain] || '🌤️';
}

// Click handlers for blocks
function initClickHandlers() {
    document.querySelectorAll('.parent > div').forEach(block => {
        block.addEventListener('click', function() {
            const details = this.querySelector('.project-details');
            if (details) {
                details.classList.toggle('hidden');
                
                // Add to terminal
                const projectId = this.dataset.project;
                const project = PROJECTS[projectId - 1];
                if (project) {
                    System.addToTerminal(`📂 Showing ${project.name} details`);
                    
                    // Special message for PC specs
                    if (projectId === '7') {
                        System.addToTerminal('🖥️ di9star\'s beast machine!');
                    }
                }
            }
        });
    });
}

// Terminal interactions
function initTerminal() {
    const input = document.getElementById('terminal-input');
    if (!input) return;
    
    input.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim().toLowerCase();
            input.value = '';
            
            // Show command
            System.addToTerminal(command, true);
            
            // Process command
            if (command === '') {
                // Nothing
            }
            else if (command === 'hi') {
                System.addToTerminal(COMMANDS.hi());
                
                // Make kitty bounce!
                const kitty = document.getElementById('kitty');
                if (kitty) {
                    kitty.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        kitty.style.transform = 'scale(1)';
                    }, 200);
                }
            }
            else if (command === 'clear') {
                System.clearTerminal();
            }
            else if (command === 'weather') {
                if (System.weather) {
                    System.addToTerminal(COMMANDS.weather(System.weather));
                } else {
                    System.addToTerminal('Weather data still loading... try again in a moment.');
                }
            }
            else if (command === 'location') {
                if (System.location) {
                    System.addToTerminal(COMMANDS.location(System.location));
                } else {
                    System.addToTerminal('Location data still loading... try again in a moment.');
                }
            }
            else if (command === 'date') {
                System.addToTerminal(COMMANDS.date());
            }
            else if (command === 'time') {
                System.addToTerminal(COMMANDS.time());
            }
            else if (command === 'projects' || command === 'ls') {
                System.addToTerminal(COMMANDS.projects());
            }
            else if (command === 'specs') {
                System.addToTerminal(COMMANDS.specs());
            }
            else if (command === 'cat') {
                System.addToTerminal(COMMANDS.cat());
            }
            else if (command === 'pwd') {
                System.addToTerminal(COMMANDS.pwd());
            }
            else if (command === 'whoami') {
                System.addToTerminal(COMMANDS.whoami());
            }
            else if (command === 'help') {
                System.addToTerminal(COMMANDS.help());
            }
            else {
                System.addToTerminal(`Command not found: ${command}. Type 'help' for available commands.`);
            }
        }
    });
}

// Kitty interactions
function initKittyInteractions() {
    const kitty = document.getElementById('kitty');
    if (!kitty) return;
    
    kitty.addEventListener('click', () => {
        const greetings = [
            'Meow! di9star\'s cat greets you! 🐱',
            'Purr... *rub rub*',
            '*kitty rubs against your hand*',
            'Feed me, human of di9star!',
            '😺 - di9star\'s loyal companion'
        ];
        System.addToTerminal(greetings[Math.floor(Math.random() * greetings.length)]);
        
        // Make kitty bounce
        kitty.style.animation = 'none';
        kitty.offsetHeight; // Trigger reflow
        kitty.style.animation = 'kitty-bounce 0.3s ease';
        
        setTimeout(() => {
            kitty.style.animation = 'kitty-bounce 2s infinite ease-in-out';
        }, 300);
    });
}

// Make System available globally for debugging
window.di9starOS = System;
