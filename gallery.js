document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = parseInt(urlParams.get('id'), 10);

    // Assuming this is the same photoData array from scripts.js

    const gallery = photoData.find(g => g.id === galleryId);
    if (!gallery) {
        console.error('Gallery not found');
        return;
    }

    const galleryContainer = document.getElementById('gallery');
    
    // Inject images into the gallery container
    gallery.photos.forEach(photo => {
        const link = document.createElement('a');
        link.href = photo;
        link.dataset.lightbox = 'gallery';
        link.dataset.title = gallery.description;

        const img = document.createElement('img');
        img.src = photo;
        img.alt = gallery.description;

        link.appendChild(img);
        galleryContainer.appendChild(link);
    });

    // Initialize Lightbox with custom options
    lightbox.option({
        'resizeDuration': 200,
        'fadeDuration': 200,
        'imageFadeDuration': 200,
        'wrapAround': true,
        'positionFromTop': 50
    });

});

document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('immersive-header');
    const mapContainer = document.getElementById('map');
    const closeArrow = header.querySelector('.close-arrow');
  
    header.addEventListener('click', function(e) {
      if (e.target === closeArrow && header.classList.contains('expanded')) {
        header.classList.remove('expanded');
        document.body.classList.remove('header-expanded');
      } else if (e.target !== closeArrow) {
        header.classList.toggle('expanded');
        document.body.classList.toggle('header-expanded');
      }
    });
  
    // Close header when clicking on a nav link
    const navLinks = header.querySelectorAll('.header-nav a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent the header click event
        header.classList.remove('expanded');
        document.body.classList.remove('header-expanded');
      });
    });
  
  });
  