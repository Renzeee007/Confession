document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    // Switch tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Handle signup
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value.trim();
        const password = document.getElementById('signupPassword').value;
        const confirmPass = document.getElementById('confirmPassword').value;

        // Validate username
        if (username.length < 3) {
            alert('Username must be at least 3 characters long!');
            return;
        }

        // Validate password
        if (password !== confirmPass) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long!');
            return;
        }

        const usernames = JSON.parse(localStorage.getItem('usernames') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');

        // Check if username is taken
        if (usernames.includes(username)) {
            alert('Username is already taken. Please choose another one.');
            return;
        }

        // Save user data
        usernames.push(username);
        users.push({
            username: username,
            password: password
        });

        localStorage.setItem('usernames', JSON.stringify(usernames));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', username);
        window.location.href = './index.html';
    });

    // Login form
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username);
        
        if (user && user.password === password) {
            localStorage.setItem('currentUser', username);
            window.location.href = './index.html';
        } else {
            alert('Invalid username or password.');
        }
    });
});