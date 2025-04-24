// DOM Elements
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('main section');
const navLinks = document.querySelectorAll('nav ul li a');
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const errorElement = document.getElementById('error');
const menuToggle = document.querySelector('.menu-toggle');

// Debug logging
console.log('DOM Elements:', {
    commentForm,
    commentList,
    errorElement,
    menuToggle
});

// Constants
const SCROLL_OFFSET = 80;
const SCROLL_TO_TOP_THRESHOLD = 300;
const ANIMATION_DURATION = 300;

// Navigation and Scrolling
function setupNavigation() {
    // Handle desktop navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Calculate scroll position with proper offset
                const navHeight = nav.offsetHeight;
                const sectionTop = targetSection.offsetTop;
                const scrollPosition = sectionTop - navHeight - SCROLL_OFFSET;
                
                // Scroll to section
                window.scrollTo({
                    top: scrollPosition,
                    behavior: 'smooth'
                });
                
                // Update active section
                document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));
                link.parentElement.classList.add('active');
                
                // Close mobile menu if open
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            }
        });
    });

    // Handle mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('active') && 
                !e.target.closest('nav') && 
                !e.target.closest('.menu-toggle')) {
                nav.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// Active Section Tracking
function handleActiveSection() {
    function updateActiveSection() {
        const headerHeight = nav.offsetHeight;
        const scrollPosition = window.scrollY;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - SCROLL_OFFSET;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                sections.forEach(s => s.classList.remove('active-section'));
                navLinks.forEach(link => link.parentElement.classList.remove('active'));

                section.classList.add('active-section');
                const correspondingLink = document.querySelector(`nav a[href="#${section.id}"]`);
                if (correspondingLink) {
                    correspondingLink.parentElement.classList.add('active');
                }
            }
        });
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveSection();
                ticking = false;
            });
            ticking = true;
        }
    });

    updateActiveSection();
}

// Comment Form Handling
function handleCommentForm() {
    if (!commentForm) {
        console.error('Comment form not found!');
        return;
    }

    console.log('Setting up comment form handler');
    
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const comment = document.getElementById('comment').value.trim();

        console.log('Form values:', { name, email, comment });

        if (!name || !email || !comment) {
            showError('All fields are required.');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }

        addComment(name, email, comment);
        commentForm.reset();
        if (errorElement) {
            errorElement.textContent = '';
        }
    });
}

// Helper Functions
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    console.log('Showing error:', message);
    if (!errorElement) {
        console.error('Error element not found!');
        return;
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    errorElement.style.opacity = '1';
    setTimeout(() => {
        errorElement.style.opacity = '0';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 300);
    }, 3000);
}

function addComment(name, email, comment) {
    console.log('Adding comment:', { name, email, comment });
    
    if (!commentList) {
        console.error('Comment list not found!');
        return;
    }

    // Create comment container
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    // Get current date
    const date = new Date().toLocaleDateString();
    
    // Create comment HTML
    const commentHTML = `
        <div class="comment-header">
            <strong>${name}</strong>
            <span class="email">(${email})</span>
            <span class="date">${date}</span>
        </div>
        <div class="comment-content">
            <p>${comment}</p>
        </div>
    `;
    
    // Set the HTML content
    commentDiv.innerHTML = commentHTML;

    // Add animation styles
    commentDiv.style.opacity = '0';
    commentDiv.style.transform = 'translateX(-20px)';
    
    // Create comments container if it doesn't exist
    let commentsContainer = commentList.querySelector('.comments-container');
    if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.className = 'comments-container';
        // Insert after the h3 element
        const h3 = commentList.querySelector('h3');
        if (h3) {
            commentList.insertBefore(commentsContainer, h3.nextSibling);
        } else {
            commentList.appendChild(commentsContainer);
        }
    }
    
    // Add the comment to the container
    commentsContainer.insertBefore(commentDiv, commentsContainer.firstChild);
    console.log('Comment added to container:', commentsContainer);

    // Trigger animation
    requestAnimationFrame(() => {
        commentDiv.style.transition = `all ${ANIMATION_DURATION}ms ease`;
        commentDiv.style.opacity = '1';
        commentDiv.style.transform = 'translateX(0)';
    });
}

// Scroll to Top Button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollTopBtn);

// Show/hide scroll to top button with smooth transition
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }, 100);
});

// Smooth scroll to top with easing
scrollTopBtn.addEventListener('click', () => {
    const startPosition = window.scrollY;
    const startTime = performance.now();
    const duration = 800; // milliseconds

    function scrollToTop(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth deceleration
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        window.scrollTo(0, startPosition * (1 - easedProgress));
        
        if (progress < 1) {
            requestAnimationFrame(scrollToTop);
        }
    }

    requestAnimationFrame(scrollToTop);
});

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    setupNavigation();
    handleActiveSection();
    handleCommentForm();
});
