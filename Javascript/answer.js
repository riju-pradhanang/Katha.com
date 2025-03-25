document.addEventListener('DOMContentLoaded', () => {
    const postsList = document.getElementById('postsList');
    const categoryItems = document.querySelectorAll('.category-list li');
    const authLinks = document.getElementById('auth-links');

    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let selectedCategory = null;

    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        authLinks.innerHTML = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    ${loggedInUser.username}
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown"}">
                    <li><a class="dropdown-item" href="profile.html">Profile</a></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()">Logout</a></li>
                </ul>
            </li>
        `;
    } else {
        authLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#signupModal">Sign Up</a></li>
            <li class="nav-item"><a class="nav-link" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">Login</a></li>
        `;
    }

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            selectedCategory = item.getAttribute('data-category');
            renderPosts();
        });
    });

    renderPosts();

    function renderPosts() {
        postsList.innerHTML = '';
        let filteredPosts = posts;

        const urlParams = new URLSearchParams(window.location.search);
        const postIndex = urlParams.get('postIndex');
        if (postIndex !== null) {
            filteredPosts = [posts[postIndex]];
        } else if (selectedCategory) {
            filteredPosts = posts.filter(post => post.category === selectedCategory);
        }

        if (filteredPosts.length === 0) {
            postsList.innerHTML = `
                <div class="no-posts-message">
                    <h3>No posts to show </h3> <h4>Be the first to post!</h4>
                </div>
            `;
        } else {
            filteredPosts.forEach((post, index) => {
                const globalIndex = posts.indexOf(post);
                let fileContent = '';
                if (post.file) {
                    if (post.file.type.startsWith('image/')) {
                        fileContent = `<img src="${post.file.data}" alt="Post Image" class="post-image">`;
                    } else {
                        fileContent = `<a href="${post.file.data}" download="${post.file.name}" class="attachment-link">Attachment</a>`;
                    }
                }

                const likes = post.likes !== undefined ? post.likes : 0;
                const dislikes = post.dislikes !== undefined ? post.dislikes : 0;

                const comments = post.comments || [];
                let commentsHTML = '';
                if (comments.length > 0) {
                    commentsHTML = '<div class="comments-section">';
                    comments.forEach(comment => {
                        commentsHTML += `
                            <hr>
                            <div class="comment">
                                <p class="comment-username">${comment.username}</p>
                                <p>${comment.text}</p>
                            </div>
                        `;
                    });
                    commentsHTML += '</div>';
                }

                const postElement = document.createElement('div');
                postElement.className = 'col-12 col-md-8 mx-auto mb-3';
                postElement.innerHTML = `
                    <div class="card post-card" style="position: relative;">
                        <div class="post-username" style="color:red;">${post.username}</div>
                        <br>
                        <div class="card-body">
                            <h5 class="card-title">${post.title}</h5>
                            <p class="card-text"><small class="text-secondary">Category: ${post.category}</small></p>
                            ${fileContent}
                            <p class="card-text">${post.content}</p>
                            <div class="vote-counts">
                                <button class="btn-vote" onclick="vote(${globalIndex}, 'like')">👍</button>
                                <span>${likes}</span>
                                <button class="btn-vote" onclick="vote(${globalIndex}, 'dislike')">👎</button>
                                <span>${dislikes}</span>
                                <button class="btn-comment" onclick="goToAnswer(${globalIndex})">Comment</button>
                            </div>
                            ${commentsHTML}
                            <form class="comment-form" onsubmit="addComment(event, ${globalIndex})">
                                <textarea rows="2" placeholder="Write your comment..." style="border:1px solid grey; border-radius:10px; padding:10px" required></textarea>
                                <button type="submit">Submit Comment</button>
                            </form>
                        </div>
                    </div>
                `;
                postsList.appendChild(postElement);
            });
        }
    }

    window.vote = (index, type) => {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (!loggedInUser) {
            alert('Please login to vote.');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }

        if (posts[index].likes === undefined) posts[index].likes = 0;
        if (posts[index].dislikes === undefined) posts[index].dislikes = 0;
        if (!posts[index].votedUsers) posts[index].votedUsers = {};

        const userVote = posts[index].votedUsers[loggedInUser.username];

        if (userVote === type) {
            if (type === 'like') {
                posts[index].likes = 0;
            } else if (type === 'dislike') {
                posts[index].dislikes = 0;
            }
            delete posts[index].votedUsers[loggedInUser.username];
        } else {
            if (userVote === 'like') {
                posts[index].likes = 0;
            } else if (userVote === 'dislike') {
                posts[index].dislikes = 0;
            }

            if (type === 'like') {
                posts[index].likes = 1;
            } else if (type === 'dislike') {
                posts[index].dislikes = 1;
            }
            posts[index].votedUsers[loggedInUser.username] = type;
        }

        localStorage.setItem('posts', JSON.stringify(posts));
        renderPosts();
    };

    window.goToAnswer = (index) => {
        window.location.href = `answer.html?postIndex=${index}`;
    };

    window.addComment = (event, index) => {
        event.preventDefault();
        if (!loggedInUser) {
            alert('Please login to comment.');
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
            return;
        }

        const textarea = event.target.querySelector('textarea');
        const commentText = textarea.value.trim();
        if (commentText) {
            if (!posts[index].comments) {
                posts[index].comments = [];
            }
            posts[index].comments.push({
                username: loggedInUser.username,
                text: commentText
            });
            localStorage.setItem('posts', JSON.stringify(posts));
            textarea.value = '';
            renderPosts();
        }
    };

    window.logout = () => {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
    };

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