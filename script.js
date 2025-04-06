document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Get DOM elements
    const form = document.getElementById("confessionForm");
    const nameInput = document.getElementById("nameInput");
    const messageInput = document.getElementById("messageInput");
    const confessionsList = document.getElementById("confessionsList");
    const modal = document.getElementById("replyModal");
    const closeBtn = document.getElementsByClassName("close")[0];
    const replyForm = document.getElementById("replyForm");
    let currentConfessionId = null;

    // Add user info and share link
    const userInfo = document.createElement('div');
    userInfo.className = 'user-info';
    
    // Update the path handling for GitHub Pages
    const getBasePath = () => {
        // Check if we're on GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            return '/virtual-love-confession';
        }
        return '';
    };

    const baseUrl = window.location.origin + getBasePath();
    const shareUrl = `${baseUrl}/index.html?user=${currentUser}`;
    
    userInfo.innerHTML = `
        <h2>Welcome, ${currentUser}!</h2>
        <div class="share-section">
            <input type="text" id="shareLink" value="${shareUrl}" readonly>
            <button id="copyLink" class="copy-button">Copy Link</button>
            <p class="share-info">Share this link to let others view your confessions</p>
        </div>
    `;
    
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.className = 'logout-button';
    
    document.querySelector('.container').prepend(logoutBtn);
    document.querySelector('.container').prepend(userInfo);

    // Add copy link functionality
    const copyBtn = document.getElementById('copyLink');
    const shareLinkInput = document.getElementById('shareLink');
    
    copyBtn.addEventListener('click', () => {
        shareLinkInput.select();
        document.execCommand('copy');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy Link';
        }, 2000);
    });

    // Check for shared wall access
    const urlParams = new URLSearchParams(window.location.search);
    const sharedUser = urlParams.get('user');
    
    let confessions;
    if (sharedUser) {
        // Verify if shared user exists
        const usernames = JSON.parse(localStorage.getItem('usernames') || '[]');
        if (!usernames.includes(sharedUser)) {
            alert('User not found!');
            window.location.href = 'index.html';
            return;
        }
        
        if (sharedUser !== currentUser) {
            // Load shared user's confessions
            confessions = JSON.parse(localStorage.getItem(`confessions_${sharedUser}`)) || [];
            userInfo.innerHTML = `
                <h2>Viewing ${sharedUser}'s Wall</h2>
                <p><small>Logged in as: ${currentUser}</small></p>
                <button id="backButton" class="back-button">Back to My Wall</button>
            `;
            document.getElementById('confessionForm').style.display = 'none';
            
            // Update back button path
            setTimeout(() => {
                document.getElementById('backButton').addEventListener('click', () => {
                    window.location.href = './index.html';
                });
            }, 0);
        }
    } else {
        // Load own confessions
        confessions = JSON.parse(localStorage.getItem(`confessions_${currentUser}`)) || [];
    }

    renderConfessions();

    // Handle confession form submission
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let name = nameInput.value.trim();
        let message = messageInput.value.trim();

        if (!message) return;

        let confession = {
            id: Date.now().toString(),
            name: name || currentUser,
            message: message,
            time: new Date().toLocaleString(),
            replies: []
        };

        confessions.unshift(confession);
        localStorage.setItem(`confessions_${currentUser}`, JSON.stringify(confessions));
        renderConfessions();

        nameInput.value = "";
        messageInput.value = "";
        createHeartEffect();
    });

    // Display confessions
    function renderConfessions() {
        console.log("Rendering confessions:", confessions); // Debug log
        confessionsList.innerHTML = "";
        
        if (!confessions || confessions.length === 0) {
            const emptyMessage = document.createElement("li");
            emptyMessage.textContent = "No confessions yet. Be the first to confess!";
            confessionsList.appendChild(emptyMessage);
            return;
        }

        confessions.forEach((confession) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="confession">
                    <strong>${confession.name}:</strong> 
                    <p>${confession.message}</p>
                    <small>${confession.time}</small>
                    <button class="reply-button" data-confession-id="${confession.id}">Reply ❤️</button>
                    ${confession.replies && confession.replies.length > 0 ? 
                        `<div class="replies">
                            ${confession.replies.map(reply => `
                                <div class="reply">
                                    <strong>${reply.name}:</strong> 
                                    <p>${reply.message}</p>
                                    <small>${reply.time}</small>
                                </div>
                            `).join('')}
                        </div>` : ''
                    }
                </div>
            `;
            confessionsList.appendChild(li);
        });

        // Add reply button listeners
        document.querySelectorAll('.reply-button').forEach(button => {
            button.addEventListener('click', (e) => {
                currentConfessionId = e.target.dataset.confessionId;
                modal.style.display = "block";
            });
        });
    }

    // Handle reply form submission
    replyForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const replyName = document.getElementById("replyName").value.trim();
        const replyMessage = document.getElementById("replyMessage").value.trim();

        if (replyMessage && currentConfessionId) {
            const targetUser = sharedUser || currentUser;
            const confession = confessions.find(c => c.id === currentConfessionId);
            if (confession) {
                confession.replies.push({
                    name: replyName || currentUser,
                    message: replyMessage,
                    time: new Date().toLocaleString()
                });
                localStorage.setItem(`confessions_${targetUser}`, JSON.stringify(confessions));
                renderConfessions();
            }
            modal.style.display = "none";
            replyForm.reset();
        }
    });

    // Close modal handlers
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
    };

    // Logout handler
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = './login.html';
    });

    // Create heart effect
    function createHeartEffect() {
        const heart = document.createElement("div");
        heart.classList.add("heart");
        heart.innerHTML = "❤️";
        document.body.appendChild(heart);
        
        const x = Math.random() * window.innerWidth;
        heart.style.left = `${x}px`;
        heart.style.bottom = "0";
        
        setTimeout(() => heart.remove(), 2000);
    }
});
