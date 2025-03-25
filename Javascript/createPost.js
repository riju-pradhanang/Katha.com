document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    const loginMessage = document.getElementById('login-message');
    const clearBtn = document.getElementById('clearBtn');
    const fileInput = document.getElementById('file');
    const authLinks = document.getElementById('auth-links');

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        authLinks.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ${loggedInUser.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </li>
        `;
        postForm.style.display = 'block';
        loginMessage.style.display = 'none';
    } else {
        authLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</a></li>
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a></li>
        `;
        postForm.style.display = 'none';
        loginMessage.style.display = 'block';
    }

    clearBtn.addEventListener('click', () => {
        fileInput.value = '';
    });

    postForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const category = document.getElementById('category').value;
        const content = document.getElementById('content').value;
        const file = fileInput.files[0];
        const username = loggedInUser.username;

        let posts = JSON.parse(localStorage.getItem('posts')) || [];

        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const fileData = e.target.result;
                const fileType = file.type;
                const fileName = file.name;

                posts.unshift({
                    title,
                    category,
                    content,
                    username,
                    upvotes: 0,
                    downvotes: 0,
                    file: {
                        data: fileData,
                        type: fileType,
                        name: fileName
                    },
                    comments: []
                });

                localStorage.setItem('posts', JSON.stringify(posts));
                window.location.href = 'index.html?newPost=true';
            };
            reader.readAsDataURL(file);
        } else {
            posts.unshift({
                title,
                category,
                content,
                username,
                upvotes: 0,
                downvotes: 0,
                file: null,
                comments: []
            });

            localStorage.setItem('posts', JSON.stringify(posts));
            window.location.href = 'index.html?newPost=true';
        }
    });

    window.logout = () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    };

    // Login Form Handler
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const usernameError = document.getElementById('login-username-error');
        const passwordError = document.getElementById('login-password-error');
        const loginError = document.getElementById('login-error');

        usernameError.textContent = '';
        passwordError.textContent = '';
        loginError.textContent = '';
        loginError.style.display = 'none';

        let hasError = false;

        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (!username) {
            usernameError.textContent = 'Please enter your username.';
            hasError = true;
        }

        if (!password) {
            passwordError.textContent = 'Please enter your password.';
            hasError = true;
        }

        if (!hasError) {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                localStorage.setItem('loggedInUser', JSON.stringify({ username }));
                window.location.reload();
            } else {
                loginError.textContent = 'Invalid username or password.';
                loginError.style.display = 'block';
            }
        }
    });

    // Signup Form Handler
    document.getElementById('signup-form').addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('signup-username').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        const usernameError = document.getElementById('signup-username-error');
        const emailError = document.getElementById('signup-email-error');
        const passwordError = document.getElementById('signup-password-error');

        usernameError.textContent = '';
        emailError.textContent = '';
        passwordError.textContent = '';

        let hasError = false;

        let users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.some(user => user.username === username)) {
            usernameError.textContent = 'This username is already taken.';
            hasError = true;
        }

        if (users.some(user => user.email === email)) {
            emailError.textContent = 'This email is already registered.';
            hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailError.textContent = 'Please enter a valid email.';
            hasError = true;
        }

        if (password.length < 6) {
            passwordError.textContent = 'Password must be at least 6 characters.';
            hasError = true;
        }

        if (!hasError) {
            users.push({ username, email, password });
            localStorage.setItem('users', JSON.stringify(users));
            localStorage.setItem('loggedInUser', JSON.stringify({ username }));
            window.location.reload();
        }
    });
});