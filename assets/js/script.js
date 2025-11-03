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
    const modalChatForm = document.getElementById('modal-chat-form');
    
    // Function to add a message to the chat
    function addMessage(content, isUser = false, chatContainer = 'chat-messages') {
        const chatMessages = document.getElementById(chatContainer);
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
    function showTypingIndicator(chatContainer = 'chat-messages') {
        const chatMessages = document.getElementById(chatContainer);
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
            // Context about Hariiri for the AI (kept on client)
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
            
            // --- SECURE CHANGE: CALLING VERCEL SERVERLESS FUNCTION ---
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userMessage: userMessage,
                    context: context // Pass context to the proxy
                })
            });
            
            if (!response.ok) {
                throw new Error(`Proxy request failed with status ${response.status}`);
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
    
    // Handle form submission for main chat (if exists)
    if (chatForm) {
        chatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userInput = document.getElementById('user-input');
            const sendButton = document.getElementById('send-button');
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
        const userInput = document.getElementById('user-input');
        if (userInput) {
            userInput.addEventListener('input', function() {
                const sendButton = document.getElementById('send-button');
                if (sendButton) {
                    sendButton.disabled = !this.value.trim();
                }
            });
        }
    }
    
    // Handle form submission for modal chat
    if (modalChatForm) {
        modalChatForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userInput = document.getElementById('modal-user-input');
            const sendButton = document.getElementById('modal-send-button');
            const message = userInput.value.trim();
            if (!message) return;
            
            // Add user message to chat
            addMessage(message, true, 'modal-chat-messages');
            
            // Clear input
            userInput.value = '';
            sendButton.disabled = true;
            
            // Get and add bot response
            const botResponse = await getGeminiResponse(message);
            addMessage(botResponse, false, 'modal-chat-messages');
            
            // Re-enable send button
            sendButton.disabled = false;
            userInput.focus();
        });
        
        // Enable/disable send button based on input
        const modalUserInput = document.getElementById('modal-user-input');
        if (modalUserInput) {
            modalUserInput.addEventListener('input', function() {
                const sendButton = document.getElementById('modal-send-button');
                if (sendButton) {
                    sendButton.disabled = !this.value.trim();
                }
            });
        }
    }
    
    // Add event listener to chatbot toggle button
    const chatbotToggle = document.getElementById('chatbot-toggle');
    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', function() {
            // Show the modal
            const modal = new bootstrap.Modal(document.getElementById('chatbotModal'));
            modal.show();
        });
    }
});