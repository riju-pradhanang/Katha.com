document.addEventListener('DOMContentLoaded', () => {
    const authLinks = document.getElementById('auth-links');
    const loginMessage = document.getElementById('login-message');
    const profileContent = document.getElementById('profile-content');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const userPostsList = document.getElementById('user-posts-list');

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let posts = JSON.parse(localStorage.getItem('posts')) || [];

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
        loginMessage.style.display = 'none';
        profileContent.style.display = 'block';

        const user = users.find(u => u.username === loggedInUser.username);
        if (user) {
            profileUsername.textContent = user.username;
            profileEmail.textContent = user.email;
        } else {
            profileUsername.textContent = loggedInUser.username;
            profileEmail.textContent = 'Not available';
        }

        renderUserPosts();
    } else {
        authLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</a></li>
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a></li>
        `;
        loginMessage.style.display = 'block';
        profileContent.style.display = 'none';
    }

    function renderUserPosts() {
        userPostsList.innerHTML = '';
        const userPosts = posts.filter(post => post.username === loggedInUser.username);

        if (userPosts.length === 0) {
            userPostsList.innerHTML = `
                <div class="no-posts-message">
                    <h4>You haven't created any posts yet.</h4>
                </div>
            `;
        } else {
            userPosts.forEach((post, index) => {
                const globalIndex = posts.findIndex(p => p === post);
                let fileContent = '';
                if (post.file) {
                    if (post.file.type.startsWith('image/')) {
                        fileContent = `<img src="${post.file.data}" alt="Post Image" class="post-image">`;
                    } else {
                        fileContent = `<a href="${post.file.data}" download="${post.file.name}" class="attachment-link">Attachment</a>`;
                    }
                }

                const upvotes = post.upvotes !== undefined ? post.upvotes : 0;
                const downvotes = post.downvotes !== undefined ? post.downvotes : 0;

                const postElement = document.createElement('div');
                postElement.className = 'post-card';
                postElement.innerHTML = `
                    <h5>${post.title}</h5>
                    <p><small class="text-secondary">Category: ${post.category}</small></p>
                    ${fileContent}
                    <p>${post.content}</p>
                    <div class="vote-counts">
                        <button class="btn-vote" disabled>▲</button>
                        <span>${upvotes}</span>
                        <button class="btn-vote" disabled>▼</button>
                        <span>${downvotes}</span>
                    </div>
                    <button class="btn-delete" onclick="deletePost(${globalIndex})">Delete</button>
                `;
                userPostsList.appendChild(postElement);
            });
        }
    }

    window.deletePost = (index) => {
        if (confirm('Are you sure you want to delete this post?')) {
            posts.splice(index, 1);
            localStorage.setItem('posts', JSON.stringify(posts));
            renderUserPosts();
        }
    };

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