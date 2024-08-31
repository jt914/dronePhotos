let map; // Global map variable
let markers = []; // Array to store current markers
let swiper; // Global swiper variable
let uniqueDates; // Array to store unique dates


// Function to create uniqueDates array
function createUniqueDates() {
    uniqueDates = Array.from(new Set(photoData.map(photo => `${photo.month} ${photo.year}`)))
        .sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            const dateA = new Date(`${monthA} 1, ${yearA}`);
            const dateB = new Date(`${monthB} 1, ${yearB}`);
            return dateB - dateA; // Sort from most recent to oldest
        });
}

// Initialize Mapbox map
function initializeMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoianQ5MTQiLCJhIjoiY20waGhmZTlrMGJkNDJsb21peGl3NjFtbiJ9.KU2qkLy2rhOgSiFLn6fMbA';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [-77.3064, 38.8462], // Fairfax, VA coordinates
        zoom: 12
    });
}

function updateMapbox(selectedDate) {
    if (!selectedDate) return;

    const [selectedMonth, selectedYear] = selectedDate.split(' ');
    const filteredData = photoData.filter(photo => 
        photo.month === selectedMonth && photo.year.toString() === selectedYear
    );

    // Remove existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    // Add new markers with a link to the gallery page
    filteredData.forEach(photo => {
        const galleryUrl = `gallery.html?id=${photo.id}`; // Pass only the gallery ID

        const marker = new mapboxgl.Marker()
            .setLngLat([photo.lng, photo.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`
                <p>${photo.description}</p>
                <a href="${galleryUrl}" target="_blank">View Photos</a>
            `))
            .addTo(map);
        markers.push(marker);
    });

    // Adjust map view if there are markers
    if (markers.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(marker => bounds.extend(marker.getLngLat()));
        map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced version of the Mapbox update function
const debouncedUpdateMapbox = debounce(updateMapbox, 300);

// Function to create slides
function createSlides() {
    const sliderContainer = document.getElementById('month-slider');
    if (!sliderContainer) {
        console.error('Slider container not found');
        return;
    }
    
    uniqueDates.forEach(date => {
        const [month, year] = date.split(' ');
        const slide = document.createElement('div');
        slide.classList.add('swiper-slide');
        slide.innerHTML = `
            <span class="month">${month}</span>
            <span class="year">${year}</span>
        `;
        sliderContainer.appendChild(slide);
    });
}

// Initialize Swiper
function initializeSwiper() {
    swiper = new Swiper('.swiper-container', {
        direction: 'vertical',
        slidesPerView: 5,
        centeredSlides: true,
        spaceBetween: 10,
        mousewheel: true,
        slideToClickedSlide: true,
        on: {
            init: function () {
                if (this.slides.length > 0) {
                    this.slides[this.activeIndex].classList.add('swiper-slide-active');
                    var selectedDate = uniqueDates[this.activeIndex];
                    debouncedUpdateMapbox(selectedDate);
                }
            },
            slideChange: function () {
                this.slides.forEach((slide, index) => {
                    if (index === this.activeIndex) {
                        slide.classList.add('swiper-slide-active');
                    } else {
                        slide.classList.remove('swiper-slide-active');
                    }
                });
                
                var selectedDate = uniqueDates[this.activeIndex];
                debouncedUpdateMapbox(selectedDate);
            },
            click: function (swiper, event) {
                const clickedSlide = event.target.closest('.swiper-slide');
                if (clickedSlide) {
                    const clickedIndex = this.slides.indexOf(clickedSlide);
                    this.slideTo(clickedIndex);
                }
            }
        }
    });

    // Handle manual scrolling
    swiper.el.addEventListener('scroll', debounce(function() {
        const centerY = swiper.el.offsetHeight / 2;
        let closestSlide = null;
        let closestDistance = Infinity;

        swiper.slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            const distance = Math.abs(rect.top + rect.height / 2 - centerY);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSlide = slide;
            }
        });

        if (closestSlide) {
            swiper.slides.forEach(slide => slide.classList.remove('swiper-slide-active'));
            closestSlide.classList.add('swiper-slide-active');
            const selectedDate = uniqueDates[swiper.slides.indexOf(closestSlide)];
            debouncedUpdateMapbox(selectedDate);
        }
    }, 100));
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    createUniqueDates();
    initializeMap();
    createSlides();
    initializeSwiper();
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
  
    // Prevent map interaction when header is expanded
    if (mapContainer && typeof map !== 'undefined') {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (header.classList.contains('expanded')) {
                        map.scrollZoom.disable();
                        map.dragPan.disable();
                    } else {
                        map.scrollZoom.enable();
                        map.dragPan.enable();
                    }
                }
            });
        });
  
        observer.observe(header, { attributes: true });
    }
});
