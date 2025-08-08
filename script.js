import anime from 'animejs';

document.addEventListener('DOMContentLoaded', () => {
    // Hero section animations
    const heroTitle = document.querySelector('.hero-title');
    const heroTexts = document.querySelectorAll('.hero-text');
    const heartPulse = document.querySelector('.heart-pulse');

    anime.timeline({
        easing: 'easeOutExpo',
        duration: 1200
    })
    .add({
        targets: heroTitle,
        opacity: [0, 1],
        translateY: [20, 0]
    })
    .add({
        targets: heroTexts[0],
        opacity: [0, 1],
        translateY: [20, 0]
    }, '-=700') // Overlap animation
    .add({
        targets: heroTexts[1],
        opacity: [0, 1],
        translateY: [20, 0]
    }, '-=700')
    .add({
        targets: heartPulse,
        opacity: [0, 1],
        scale: [0.5, 1],
        easing: 'easeOutElastic(1, .8)'
    }, '-=500');

    // Section reveal on scroll
    const sections = document.querySelectorAll('.section:not(#hero)'); // Exclude hero section
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '0px',
        threshold: 0.2 // Trigger when 20% of the section is visible
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Stop observing once visible
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Staggered text animation for paragraphs within sections when they become visible
    // Also applies to section titles and signatures
    const paragraphObserverOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    };

    const paragraphObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Check if element is intersecting and not yet animated
            if (entry.isIntersecting && entry.target.getAttribute('data-animated') === 'false') {
                const originalNodes = Array.from(entry.target.childNodes); // Get a static copy of nodes
                let targets = []; // Elements that will be animated

                // Create a temporary container to hold the new structure
                // Using a div with display: contents to avoid affecting layout
                const tempContainer = document.createElement('div');
                tempContainer.style.display = 'contents';

                originalNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const words = node.textContent.split(/\s+/).filter(word => word.length > 0);
                        words.forEach(word => {
                            const span = document.createElement('span');
                            span.textContent = word + ' ';
                            span.classList.add('animate-hidden'); // Apply class for initial hidden state
                            targets.push(span);
                            tempContainer.appendChild(span);
                        });
                    } else if (node.nodeType === Node.ELEMENT_NODE && (node.classList.contains('highlight') || node.classList.contains('affectionate-term'))) {
                        // For highlight/affectionate-term spans, apply class and add to targets
                        node.classList.add('animate-hidden'); // Apply class for initial hidden state
                        targets.push(node);
                        tempContainer.appendChild(node); // Move the actual node to the temp container
                    } else {
                        // For other elements (e.g., <br>), just move them
                        tempContainer.appendChild(node);
                    }
                });

                // Replace all children of entry.target with children from tempContainer
                while (entry.target.firstChild) {
                    entry.target.removeChild(entry.target.firstChild);
                }
                while (tempContainer.firstChild) {
                    entry.target.appendChild(tempContainer.firstChild);
                }

                anime({
                    targets: targets,
                    opacity: [0, 1], // Anime will read initial 0 from .animate-hidden class
                    translateY: [20, 0], // Anime will read initial 20px from .animate-hidden class
                    delay: anime.stagger(50),
                    easing: 'easeOutQuad',
                    duration: 800,
                    complete: () => {
                        // After animation, remove the hidden class and clear inline styles
                        targets.forEach(t => {
                            t.style.opacity = ''; // Clear inline opacity (set by anime)
                            t.style.transform = ''; // Clear inline transform (set by anime)
                            t.classList.remove('animate-hidden'); // Remove the class that makes it hidden
                        });
                        entry.target.setAttribute('data-animated', 'true'); // Mark as animated
                    }
                });

                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, paragraphObserverOptions);

    // Initialize data-animated and observe elements
    document.querySelectorAll('.section p, .section .section-title, .section .signature').forEach(el => {
        if (!el.closest('#hero')) { // Exclude hero section elements as they have specific animations
            el.setAttribute('data-animated', 'false'); // Custom attribute to track animation state
            paragraphObserver.observe(el);
        }
    });

    // Fix for signature element, ensuring it's observed for animation
    const signatureElement = document.querySelector('.signature');
    if (signatureElement) {
        paragraphObserver.observe(signatureElement);
    }
});