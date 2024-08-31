document.addEventListener('DOMContentLoaded', function() {
    // Fetch URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const photos = urlParams.getAll('photos[]');
    const description = urlParams.get('description');

    const galleryContainer = document.getElementById('gallery');
    
    // Inject images into the gallery container
    photos.forEach(photo => {
        const link = document.createElement('a');
        link.href = photo;
        link.dataset.lightbox = 'gallery';
        link.dataset.title = description;

        const img = document.createElement('img');
        img.src = photo;
        img.alt = description;
        img.style.maxWidth = '100%';
        img.style.marginBottom = '10px';

        link.appendChild(img);
        galleryContainer.appendChild(link);
    });
});
