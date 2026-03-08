
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
        details: '• E-commerce platform (React/Node)\n• Mobile banking app (React Native)\n• PortfolioOS (you\'re here!)',
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
        details: '• "Building PortfolioOS"\n• "Cat-driven Development"\n• "Terminal Aesthetics in 2024"',
        icon: '✍️'
    },
    { 
        id: 7, 
        name: 'contact.vcf', 
        desc: 'get in touch',
        details: '• GitHub: @portfolio-cat\n• LinkedIn: /in/portfolio-os\n• Email: cat@portfolio.os',
        icon: '📫'
    }
];


const COMMANDS = {
    hi: () => {
        return [
            '🐱 Meow! Hello human!',
            '💬 The kitty says: "hi back!"',
            '😺 *purrs happily*'
        ][Math.floor(Math.random() * 3)];
    },
    help: () => {
        return `Available commands:
  hi        - Say hi to the kitty
  date      - Show current date
  time      - Show current time
  weather   - Show weather info
  location  - Show your location
  projects  - List all projects
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
            return `🌤️ ${weatherData.temp}°C, ${weatherData.condition}`;
        }
        return "🌤️ Weather data loading...";
    },
    location: (loc) => {
        if (loc) {
            return `📍 ${loc.city}, ${loc.country}`;
        }
        return "📍 Detecting location...";
    },
    projects: () => {
        return PROJECTS.map(p => `  ${p.icon} ${p.name} - ${p.desc}`).join('\n');
    },
    cat: () => {
        return `    /\_/\\
   ( o.o )
    > ^ <
   Kitty is here! 🐱`;
    },
    ls: () => {
        return `experience.log  projects.list  skills.config  education.txt  certs.pem  blog.posts  contact.vcf`;
    },
    pwd: () => {
        return `/home/portfolio/projects`;
    },
    whoami: () => {
        return `portfolio (creative developer & cat lover)`;
    },
    clear: () => {
        return 'CLEAR';
    }
};


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
    console.log('🐱 PortfolioOS starting...');
    
    // Start all systems
    initDateTime();
    initLocation();
    initWeather();
    initClickHandlers();
    initTerminal();
    initKittyInteractions();
    
    // Welcome message
    setTimeout(() => {
        System.addToTerminal('System ready. Kitty is waiting for you! 🐱');
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

// Location detection
function initLocation() {
    const locationElement = document.getElementById('user-location');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    // Use reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
                    );
                    const data = await response.json();
                    
                    const city = data.address.city || data.address.town || data.address.village || 'Unknown';
                    const country = data.address.country || 'Unknown';
                    
                    System.location = { city, country };
                    locationElement.textContent = `${city}, ${country}`;
                } catch (error) {
                    locationElement.textContent = 'Location detected';
                }
            },
            () => {
                locationElement.textContent = 'Unknown';
            }
        );
    } else {
        locationElement.textContent = 'Not supported';
    }
}

// Weather (simulated for demo)
function initWeather() {
    const weatherElement = document.getElementById('weather');
    
    // Simulate weather data
    const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Clear', 'Windy'];
    const temps = [18, 20, 22, 24, 19, 21];
    
    System.weather = {
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        temp: temps[Math.floor(Math.random() * temps.length)]
    };
    
    weatherElement.textContent = `${System.weather.temp}°C, ${System.weather.condition}`;
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
                System.addToTerminal(COMMANDS.weather(System.weather));
            }
            else if (command === 'location') {
                System.addToTerminal(COMMANDS.location(System.location));
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
            'Meow! 🐱',
            'Purr...',
            '*kitty rubs against your hand*',
            'Feed me!',
            '😺'
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


window.portfolioOS = System;