 // Function to set the theme and update UI
 function setTheme(theme) {
    document.body.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    var switchThemeBtn = document.getElementById('switchTheme');
    if (switchThemeBtn) {
        switchThemeBtn.innerHTML = theme === 'dark' ?  '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';
    }
    //console.log(`Switched to ${theme} theme`);
}

var currentTheme = localStorage.getItem('theme') || 'dark';
setTheme(currentTheme);

// Event listener for the switch theme button
var switchThemeBtn = document.getElementById('switchTheme');
if (switchThemeBtn) {
    switchThemeBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(currentTheme);
    });
}

//AOS Initiliaze
AOS.init();

// Fixed Header & back to top button on Scroll
window.addEventListener('scroll', () => {
    // fixed header
    const header = document.getElementById('header');
    if (window.scrollY > 30 && !header.classList.contains('fixed-top')) {
        header.classList.add('fixed-top');
        document.getElementById('offcanvasNavbar').classList.add('fixedHeaderNavbar');
    } else if (window.scrollY <= 30 && header.classList.contains('fixed-top')) {
        header.classList.remove('fixed-top');
        document.getElementById('offcanvasNavbar').classList.remove('fixedHeaderNavbar');
    }

    //backtotop
    const backToTopButton = document.getElementById("backToTopButton");
    if (window.scrollY > 400 && backToTopButton.style.display === 'none') {
        backToTopButton.style.display = 'block';
    } else if (window.scrollY <= 400 && backToTopButton.style.display === 'block') {
        backToTopButton.style.display = 'none';
    }
});


//jumping to top function
function scrollToTop(){
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

//Testimonial Slider
$(document).ready(function(){
    $("#testimonial-slider").owlCarousel({
        items:3,
        nav:true,
        loop: true,
        autoplay: true,
        autoplayTimeout: 3000,
        responsive:{
            0:{
                items:1,
            },
            768:{
                items:2,
            },
            1170:{
                items:3,
            }
        }
    });
});

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the page with the chatbot
    const chatForm = document.getElementById('chat-form');
    if (!chatForm) return;
    
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const now = new Date();
        const timeString = now.getHours().toString().padStart(2, '0') + ':' + 
                          now.getMinutes().toString().padStart(2, '0');
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            <div class="message-time">${timeString}</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Function to hide typing indicator
    function hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    // Function to get response from Gemini API
    async function getGeminiResponse(userMessage) {
        // Show typing indicator
        showTypingIndicator();
        
        try {
            // Context about Hariiri for the AI
            const context = `You are an AI assistant for Hariiri (Abdalle Ahmed Hassan), a web developer. 
            Key information about Hariiri:
            - Final-year Computer Science student specializing in Data Science
            - Passionate about web development and data analysis
            - Skilled in HTML, CSS, JavaScript, NodeJS, ExpressJS, EJS, Bootstrap, C, Python, MongoDB
            - Uses tools like VSCode, Github, Canva, Figma, ChatGPT, Gemini
            - Projects: PfpFinder (https://pfpfinder.com), BikeKart template, SimplCalc
            - Contact: hi@vijay-singh.com
            - Social: LinkedIn, GitHub, Twitter, Instagram
            - Gaming blog: GamesRoid (https://gamesroid.com)
            
            Respond professionally and concisely. If asked about topics unrelated to Hariiri or web development, 
            politely redirect to relevant topics.`;
            
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyCwFcFnC2CXlf-i0_03Bg3qo5ZLNEZ9W0s', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: context + "\n\nUser: " + userMessage + "\nAssistant:" }
                        ]
                    }]
                })
            });
            
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            // Hide typing indicator
            hideTypingIndicator();
            
            // Extract the response text
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Invalid API response structure');
            }
        } catch (error) {
            // Hide typing indicator
            hideTypingIndicator();
            
            console.error('Error getting Gemini response:', error);
            
            // Fallback to simulated responses if API fails
            return getFallbackResponse(userMessage);
        }
    }
    
    // Fallback responses when API is not available
    function getFallbackResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
            return "Hello there! I'm Hariiri's AI assistant. How can I help you today?";
        } else if (lowerMessage.includes('project') || lowerMessage.includes('work')) {
            return "Hariiri has worked on several projects including PfpFinder, BikeKart template, and SimplCalc. He's skilled in HTML, CSS, JavaScript, NodeJS, ExpressJS, and more. Would you like to know more about any specific project?";
        } else if (lowerMessage.includes('skill') || lowerMessage.includes('know')) {
            return "Hariiri is proficient in HTML, CSS, JavaScript, NodeJS, ExpressJS, EJS, Bootstrap, C, Python, and MongoDB. He also uses tools like VSCode, Github, Canva, Figma, ChatGPT, and Gemini.";
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('email')) {
            return "You can contact Hariiri through the contact form on this website or connect with him on LinkedIn, GitHub, Twitter, or Instagram. His email is hi@vijay-singh.com.";
        } else if (lowerMessage.includes('about') || lowerMessage.includes('who')) {
            return "Hariiri (Abdalle Ahmed Hassan) is a final-year Computer Science student specializing in Data Science. He's passionate about web development and data analysis, with a strong focus on creating beautiful and responsive websites.";
        } else if (lowerMessage.includes('thank')) {
            return "You're welcome! Is there anything else I can help you with?";
        } else {
            // Default response
            const responses = [
                "That's interesting! Hariiri would love to hear more about that. Is there something specific you'd like to know about his work?",
                "I'm here to help you learn more about Hariiri's work. Would you like to know about his projects, skills, or background?",
                "Hariiri is always exploring new ideas in web development. Would you like to know more about his technical skills or projects?",
                "I can tell you more about Hariiri's work and projects. What would you like to know?"
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
    
    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        addMessage(message, true);
        
        // Clear input
        userInput.value = '';
        sendButton.disabled = true;
        
        // Get and add bot response
        const botResponse = await getGeminiResponse(message);
        addMessage(botResponse);
        
        // Re-enable send button
        sendButton.disabled = false;
        userInput.focus();
    });
    
    // Enable/disable send button based on input
    userInput.addEventListener('input', function() {
        sendButton.disabled = !this.value.trim();
    });
});