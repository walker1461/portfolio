// Hamburger Menu
document.addEventListener('DOMContentLoaded', function() {
    // Open
    const burger = document.querySelectorAll('.navbar-burger');
    const menu = document.querySelectorAll('.navbar-menu');
    const menuItems = document.querySelectorAll('.navbar-menu a');

    if (burger.length && menu.length) {
        for (let i = 0; i < burger.length; i++) {
            burger[i].addEventListener('click', function() {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.toggle('hidden');
                }
            });
        }
    }

    // Close
    const close = document.querySelectorAll('.navbar-close');
    const backdrop = document.querySelectorAll('.navbar-backdrop');

    if (close.length) {
        for (let i = 0; i < close.length; i++) {
            close[i].addEventListener('click', function() {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.add('hidden');
                }
            });
        }
    }

    if (backdrop.length) {
        for (let i = 0; i < backdrop.length; i++) {
            backdrop[i].addEventListener('click', function() {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.add('hidden');
                }
            });
        }
    }

    // Auto-close
    if (menuItems.length) {
        for (let i = 0; i < menuItems.length; i++) {
            menuItems[i].addEventListener('click', function() {
                for (let j = 0; j < menu.length; j++) {
                    menu[j].classList.add('hidden');
                }
            });
        }
    }
});


// Change navbar background color on scroll - not currently working
window.onscroll = function() {
    var navbar = document.getElementById("navbar");
    if (window.pageYOffset > 100) {
        navbar.classList.add("bg-gray-900");
    } else {
        navbar.classList.remove("bg-gray-900");
    }
};

// Lightbox functionality
const galleryImages = document.querySelectorAll('.gallery-img');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

galleryImages.forEach(img => {
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.remove('hidden');
    });
});

function closeLightbox() {
    lightbox.classList.add('hidden');
}

// Contact form
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    // Change the submit button text to indicate loading
    const submitButton = document.getElementById('submit-btn');
    submitButton.textContent = "Sending...";

    // Fetch the form data
    const formData = new FormData(this);

    // Send the form data using Fetch API
    fetch(this.action, {
        method: this.method,
        body: formData,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            // Display the success message
            const successMessage = document.getElementById('success-message');
            successMessage.classList.remove('hidden');
            successMessage.classList.add('visible');
            // Optionally, clear the form fields
            this.reset();
        } else {
            alert('There was a problem with your submission. Please try again.');
        }
    }).catch(error => {
        alert('There was an error submitting the form. Please try again.');
    }).finally(() => {
        // Revert the submit button text back to normal
        submitButton.textContent = "Send Message";
    });
});

window.addEventListener('load', function() {
    const cards = document.querySelectorAll('#destinations ul li > div'); // Select all cards
    let maxHeight = 0;

    // Loop through each card to find the tallest one
    cards.forEach(card => {
        const cardHeight = card.getBoundingClientRect().height;
        if (cardHeight > maxHeight) {
            maxHeight = cardHeight;
        }
    });

    // Apply the tallest height to all cards
    cards.forEach(card => {
        card.style.height = `${maxHeight}px`;
    });
});
