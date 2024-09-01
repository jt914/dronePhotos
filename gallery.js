document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const galleryId = parseInt(urlParams.get('id'), 10);

    const gallery = photoData.find(g => g.id === galleryId);
    if (!gallery) {
        console.error('Gallery not found');
        return;
    }

    const galleryContainer = document.getElementById('gallery');

    gallery.photos.forEach(photo => {
        const link = document.createElement('a');
        link.href = photo; // Link to full resolution image
        link.dataset.title = gallery.description;
        link.classList.add('gallery-item');

        const img = document.createElement('img');
        createLowResImage(photo).then(lowResSrc => {
            img.src = lowResSrc; // Set the low-res image initially
            img.classList.add('gallery-img-low-res');
        });

        img.alt = gallery.description;
        img.classList.add('gallery-img');
        link.appendChild(img);
        galleryContainer.appendChild(link);

        img.onload = function() {
            // Once the low-res image is loaded, load the high-res image
            loadHighResImage(photo, img).then(() => {
                img.classList.remove('gallery-img-low-res');
                img.classList.add('gallery-img-high-res');
                updateSidePaneInfo(gallery.description);
            });
        };
    });

    // Function to create a low-resolution version of the image
    function createLowResImage(fullResSrc) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = fullResSrc;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set desired low-res size
                const MAX_WIDTH = 100;
                const MAX_HEIGHT = 100;
                
                let width = img.width;
                let height = img.height;
                
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Get the data URL of the reduced image
                const lowResSrc = canvas.toDataURL('image/jpeg', 0.7); // The second parameter is image quality (0.7 is 70% quality)
                resolve(lowResSrc);
            };
            img.onerror = reject;
        });
    }

    // Function to load the high-resolution image and replace the low-res image
    function loadHighResImage(fullResSrc, imgElement) {
        return new Promise((resolve, reject) => {
            const highResImg = new Image();
            highResImg.src = fullResSrc;
            highResImg.onload = function() {
                imgElement.src = fullResSrc; // Replace with full resolution once loaded
                resolve();
            };
            highResImg.onerror = reject;
        });
    }

    galleryContainer.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.tagName === 'IMG') {
            openSidePaneOverlay(event.target.src, gallery.description);
        }
    }, true); // The third parameter true indicates capturing phase which might help in event propagation

    function openSidePaneOverlay(imgSrc, description) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';

        const overlayContent = document.createElement('div');
        overlayContent.className = 'overlay-content';

        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'overlay-img';

        const sidePane = document.createElement('div');
        sidePane.className = 'side-pane';
        
        const paneInfo = document.createElement('div');
        paneInfo.className = 'pane-info';
        paneInfo.innerText = description;

        const fullResButton = document.createElement('button');
        fullResButton.innerText = 'Open Full Resolution';
        fullResButton.className = 'pane-button';
        fullResButton.onclick = () => window.open(imgSrc, '_blank');

        sidePane.appendChild(paneInfo);
        sidePane.appendChild(fullResButton);
        
        overlayContent.appendChild(img);
        overlayContent.appendChild(sidePane);
        overlay.appendChild(overlayContent);

        overlay.addEventListener('click', function(event) {
            if (event.target === overlay) {
                document.body.removeChild(overlay);
                document.body.classList.remove('no-scroll');
            }
        });

        document.body.appendChild(overlay);
        document.body.classList.add('no-scroll');
    }

    function updateSidePaneInfo(description) {
        const paneInfo = document.querySelector('.pane-info');
        if (paneInfo) {
            paneInfo.innerText = description;
        }
    }
});
