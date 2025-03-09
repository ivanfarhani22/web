// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetSection = document.querySelector(this.getAttribute('href'));
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start' // Align the top of the section to the viewport
            });
        }
    });
});

// Add active class to nav links on scroll and update progress bar
window.addEventListener('scroll', () => {
    let currentSection = '';
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Determine the current section
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop - 60 && scrollPosition < sectionTop + sectionHeight - 60) {
            currentSection = section.getAttribute('id');
        }
    });

    // Update active link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });

    // Update scroll progress indicator
    const scrollIndicator = document.querySelector('.scroll-progress');
    if (scrollIndicator) {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (scrollPosition / totalHeight) * 100;
        scrollIndicator.style.width = `${progress}%`;
    }
});

// Responsive nav toggle for mobile devices
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-links');
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

// Close nav menu on link click (mobile view)
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
        }
    });
});

