const PROJECTS = [
    { 
        id: 1, 
        name: 'web_design.exe', 
        desc: 'Modern web applications with React & Vue',
        type: 'executable',
        icon: '🌐',
        command: './web_design.exe --launch'
    },
    { 
        id: 2, 
        name: 'mobile_dev.bin', 
        desc: 'iOS & Android native development',
        type: 'binary',
        icon: '📱',
        command: 'sudo mobile_dev.bin'
    },
    { 
        id: 3, 
        name: 'branding.sh', 
        desc: 'Brand identity and strategy',
        type: 'shell script',
        icon: '🎨',
        command: 'bash branding.sh'
    },
    { 
        id: 4, 
        name: 'ui_ux.py', 
        desc: 'User experience & interface design',
        type: 'python module',
        icon: '✨',
        command: 'python3 ui_ux.py'
    },
    { 
        id: 5, 
        name: 'illustration.psd', 
        desc: 'Digital illustration & concept art',
        type: 'photoshop',
        icon: '🖌️',
        command: 'gimp illustration.psd'
    },
    { 
        id: 6, 
        name: 'animation.mp4', 
        desc: 'Motion graphics & video editing',
        type: 'media',
        icon: '🎬',
        command: 'ffplay animation.mp4'
    },
    { 
        id: 7, 
        name: '3d_render.obj', 
        desc: '3D modeling & voxel art',
        type: '3d object',
        icon: '🧊',
        command: 'blender 3d_render.obj'
    }
];

// System state
const System = {
    notificationQueue: [],
    isProcessing: false,
    currentTimeout: null,
    
    clear() {
        if (this.currentTimeout) {
            clearTimeout(this.currentTimeout);
            this.currentTimeout = null;
        }
        const oldNotification = document.querySelector('.notification');
        if (oldNotification) {
            oldNotification.remove();
        }
    },
    
    log(message, type = 'info') {
        console.log(`[portfolioOS] ${message}`);
    }
};


function executeProject(projectId) {
    System.clear();
    
    const project = PROJECTS.find(p => p.id === projectId);
    if (!project) return;
    
    // Create notification
    const notification = createTerminalNotification(project);
    document.body.appendChild(notification);
    
    // Pulse effect on clicked block
    const targetBlock = document.querySelector(`.div${projectId}`);
    if (targetBlock) {
        targetBlock.style.animation = 'pulse 0.5s ease';
        setTimeout(() => {
            targetBlock.style.animation = '';
        }, 500);
    }
    
    // Auto-remove notification
    System.currentTimeout = setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
    
    // Log to console
    System.log(`Executing: ${project.command}`, 'info');
}


function createTerminalNotification(project) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${project.icon}</span>
            <div style="flex: 1;">
                <div class="notification-title">┌──(portfolio㉿kali)-[~/projects]</div>
                <div style="color: #98c379; margin: 4px 0;">└─$ ${project.command}</div>
                <div style="color: #61afef; font-size: 11px; margin-top: 4px;">
                    ${project.desc} [${project.type}]
                </div>
            </div>
        </div>
    `;
    
    return notification;
}


function initTerminal() {
    const grid = document.querySelector('.parent');
    if (!grid) return;
    
    let frameId;
    let mouseX = 0, mouseY = 0;
    
    // Parallax effect for blocks (like matrix)
    grid.addEventListener('mousemove', (e) => {
        const rect = grid.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        
        if (frameId) cancelAnimationFrame(frameId);
        
        frameId = requestAnimationFrame(() => {
            const blocks = document.querySelectorAll('.parent > div');
            blocks.forEach((block, index) => {
                const speed = (index + 1) * 0.02;
                const x = mouseX * speed * 20;
                const y = mouseY * speed * 20;
                block.style.transform = `translate(${x}px, ${y}px)`;
            });
        });
    });
    
    grid.addEventListener('mouseleave', () => {
        if (frameId) cancelAnimationFrame(frameId);
        
        const blocks = document.querySelectorAll('.parent > div');
        blocks.forEach(block => {
            block.style.transform = '';
            block.style.transition = 'transform 0.3s ease';
        });
        
        setTimeout(() => {
            blocks.forEach(block => {
                block.style.transition = '';
            });
        }, 300);
    });
}


function matrixEffect() {
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    let matrix = '';
    for (let i = 0; i < 3; i++) {
        matrix += chars[Math.floor(Math.random() * chars.length)];
    }
    console.log(`%c${matrix}`, 'color: #98c379; font-size: 8px;');
}


function initClickHandlers() {
    document.querySelectorAll('.parent > div').forEach(block => {
        const projectId = block.dataset.project;
        if (projectId) {
            block.addEventListener('click', () => executeProject(parseInt(projectId)));
            
            // Add terminal effect on hover
            block.addEventListener('mouseenter', () => {
                const type = block.querySelector('.project-type');
                if (type) {
                    type.style.color = '#98c379';
                }
            });
            
            block.addEventListener('mouseleave', () => {
                const type = block.querySelector('.project-type');
                if (type) {
                    type.style.color = '#61afef';
                }
            });
        }
    });
}


function updatePrompt() {
    const prompt = document.querySelector('.command-input .prompt');
    if (prompt) {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        prompt.innerHTML = `portfolio@kali:${time}$`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('%c┌──(portfolio㉿kali)-[~]', 'color: #98c379');
    console.log('%c└─$ ./init_system.sh --verbose', 'color: #61afef');
    
    // Initialize components
    initClickHandlers();
    initTerminal();
    
    // Update prompt every second
    updatePrompt();
    setInterval(updatePrompt, 1000);
    
    // Easter egg: Matrix effect on console
    setInterval(matrixEffect, 5000);
    
    // Welcome message
    const welcome = document.createElement('div');
    welcome.style.position = 'fixed';
    welcome.style.bottom = '10px';
    welcome.style.left = '10px';
    welcome.style.color = '#4a4a4a';
    welcome.style.fontSize = '10px';
    welcome.style.fontFamily = 'monospace';
    welcome.innerHTML = 'portfolioOS v2024.1 [running] ●';
    document.body.appendChild(welcome);
    
    System.log('System initialized successfully', 'success');
});


document.addEventListener('keydown', (e) => {
    // Ctrl + P to show all projects
    if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        console.log('%c=== AVAILABLE PROJECTS ===', 'color: #e5c07b');
        PROJECTS.forEach(p => {
            console.log(`%c${p.id}. ${p.name} - ${p.desc}`, 'color: #98c379');
        });
    }
    
    // Ctrl + R for random project
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        const randomId = Math.floor(Math.random() * 7) + 1;
        executeProject(randomId);
    }
});

// Export for debugging (in browser console)
window.portfolioOS = {
    projects: PROJECTS,
    execute: executeProject,
    system: System
};