// DOM Elements - Selectors for main navigation and content elements
const nav = document.querySelector('nav');
const sections = document.querySelectorAll('main section');
const commentForm = document.getElementById('commentForm');
const commentList = document.getElementById('commentList');
const errorElement = document.getElementById('error');
const menuToggle = document.querySelector('.menu-toggle');

// Constants - Configuration values for scroll behavior and animations
const SCROLL_OFFSET = 100; // Additional space above sections when scrolling
const SCROLL_TO_TOP_THRESHOLD = 300; // Scroll position to show "back to top" button
const ANIMATION_DURATION = 800; // Duration of smooth scroll animation in milliseconds
const SCROLL_EASING = 0.1; // Easing factor for smooth scrolling

/**
 * Smoothly scrolls to a target element with easing animation
 * Uses requestAnimationFrame for smooth performance
 * @param {HTMLElement} target - Target element to scroll to
 * @param {number} offset - Additional offset from the top to account for fixed header
 */
function smoothScrollTo(target, offset = 0) {
    const startPosition = window.scrollY;
    const targetPosition = target.offsetTop - offset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / ANIMATION_DURATION, 1);
        
        // Easing function for smooth deceleration
        const easeOutCubic = t => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);
        
        window.scrollTo(0, startPosition + (distance * easedProgress));
        
        if (progress < 1) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

/**
 * Generates navigation menu items dynamically based on section data
 * Creates list items with links for each section using their h2 text or data-name attribute
 * Handles click events for smooth scrolling and active state management
 */
function generateNavigation() {
    // Get or create the navigation list
    let navList = document.querySelector('nav ul');
    if (!navList) {
        navList = document.createElement('ul');
        navList.id = 'navbar';
        nav.appendChild(navList);
    }

    // Clear existing navigation items
    navList.innerHTML = '';
    
    // Create navigation items for each section
    sections.forEach(section => {
        // Get section title from h2 element or data-name attribute
        const sectionTitle = section.querySelector('h2')?.textContent || section.getAttribute('data-name');
        const sectionId = section.id;
        
        if (sectionTitle && sectionId) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            // Set link attributes
            link.href = `#${sectionId}`;
            link.textContent = sectionTitle;
            link.setAttribute('data-section', sectionId);
            
            // Add click event for smooth scrolling
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = document.querySelector(`#${sectionId}`);
                if (targetSection) {
                    smoothScrollTo(targetSection, nav.offsetHeight + SCROLL_OFFSET);
                    
                    // Update active state
                    document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));
                    listItem.classList.add('active');
                    
                    // Close mobile menu if open
                    if (nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        menuToggle.classList.remove('active');
                    }
                }
            });
            
            listItem.appendChild(link);
            navList.appendChild(listItem);
        }
    });
}

/**
 * Sets up navigation functionality including:
 * - Dynamic menu generation
 * - Smooth scrolling to sections
 * - Active state management
 * - Mobile menu toggle
 * Handles both desktop and mobile navigation interactions
 */
function setupNavigation() {
    // Generate navigation items
    generateNavigation();
    
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

/**
 * Tracks and updates the active section based on scroll position
 * Updates navigation highlight and section visibility
 * Uses requestAnimationFrame for performance optimization
 * Considers viewport position to determine active section
 */
function handleActiveSection() {
    function updateActiveSection() {
        const headerHeight = nav.offsetHeight;
        const scrollPosition = window.scrollY;
        const viewportHeight = window.innerHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - SCROLL_OFFSET;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionMiddle = sectionTop + (section.offsetHeight / 2);

            // Consider section as active if it's in the middle of the viewport
            if (scrollPosition + (viewportHeight / 2) >= sectionTop && 
                scrollPosition + (viewportHeight / 2) <= sectionBottom) {
                sections.forEach(s => s.classList.remove('active-section'));
                document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));

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

/**
 * Handles comment form submission and validation
 * Validates input fields and adds new comments to the list
 * Includes error handling and form reset functionality
 */
function handleCommentForm() {
    if (!commentForm) return;

    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const comment = document.getElementById('comment').value.trim();

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

/**
 * Validates email format using regex
 * Ensures email contains @ symbol and valid domain
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if email is valid, false otherwise
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Displays error messages with fade animation
 * Shows error for 3 seconds with smooth fade in/out
 * @param {string} message - Error message to display
 */
function showError(message) {
    if (!errorElement) return;
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

/**
 * Creates and adds a new comment to the comment list
 * Formats comment with name, email, and timestamp
 * Includes animation for new comment appearance
 * @param {string} name - Commenter's name
 * @param {string} email - Commenter's email
 * @param {string} comment - Comment text
 */
function addComment(name, email, comment) {
    if (!commentList) return;

    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';
    
    const date = new Date().toLocaleDateString();
    
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
    
    commentDiv.innerHTML = commentHTML;
    commentDiv.style.opacity = '0';
    commentDiv.style.transform = 'translateX(-20px)';
    
    let commentsContainer = commentList.querySelector('.comments-container');
    if (!commentsContainer) {
        commentsContainer = document.createElement('div');
        commentsContainer.className = 'comments-container';
        const h3 = commentList.querySelector('h3');
        if (h3) {
            commentList.insertBefore(commentsContainer, h3.nextSibling);
        } else {
            commentList.appendChild(commentsContainer);
        }
    }
    
    commentsContainer.insertBefore(commentDiv, commentsContainer.firstChild);

    requestAnimationFrame(() => {
        commentDiv.style.transition = `all ${ANIMATION_DURATION}ms ease`;
        commentDiv.style.opacity = '1';
        commentDiv.style.transform = 'translateX(0)';
    });
}

// Initialize scroll to top button
const scrollTopBtn = document.createElement('button');
scrollTopBtn.className = 'scroll-top';
scrollTopBtn.innerHTML = '↑';
scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
document.body.appendChild(scrollTopBtn);

// Show/hide scroll to top button based on scroll position
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

// Smooth scroll to top with easing animation
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

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupNavigation();
    handleActiveSection();
    handleCommentForm();
});
