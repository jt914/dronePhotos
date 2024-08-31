let map; // Global map variable
let markers = []; // Array to store current markers
let swiper; // Global swiper variable
let uniqueDates; // Array to store unique dates


var photoData = [
    {
        id: 1,
        lat: 38.76165133333333,
        lng: -77.30790544444444,
        month: 'June',
        year: 2024,
        photos: [
            '../photos/1_1.JPG',
            '../photos/1_2.JPG',
            '../photos/1_3.JPG'
        ],
        description: 'Burke Lake Park, 9:06 PM'
    },
    {
        id: 2,
        lat: 38.72045927777778,
        lng: -77.33891588888888,
        month: 'August',
        year: 2024,
        photos: [
            '../photos/2_1.JPG',
            '../photos/2_2.JPG',
            '../photos/2_3.JPG'
        ],
        description: 'Fountainhead Regional Park, 6:06 PM'
    },
    {
        id: 3,
        lat: 38.60755788888889,
        lng: -77.26645125,
        month: 'August',
        year: 2024,
        photos: [
            '../photos/3_1.JPG',
            '../photos/3_2.JPG',
        ],
        description: 'Burke Lake Park, 9:06 PM'
    },
    {
        id: 3,
        lat: 38.60755788888889,
        lng: -77.26645125,
        month: 'September',
        year: 2024,
        photos: [
            '../photos/3_1.JPG',
            '../photos/3_2.JPG',
        ],
        description: 'Burke Lake Park, 9:06 PM'
    },

    // Add more photo objects as needed
];


// Function to create uniqueDates array
function createUniqueDates() {
    // Assuming photoData is your array of photo objects
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

    // Add new markers with link to separate gallery page
    filteredData.forEach(photo => {
        const photoUrls = photo.photos.map(url => encodeURIComponent(url)).join('&photos[]=');
        const galleryUrl = `photo-gallery.html?photos[]=${photoUrls}&description=${encodeURIComponent(photo.description)}`;

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
  