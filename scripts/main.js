class ImprovedSlider {
    constructor() {
        this.container = document.querySelector(".slider-container");
        if (!this.container) return;
        
        this.slider = this.container.querySelector(".slider");
        this.slideWidth = 410; // Desktop slide width + margin

        this.images = [
            "assets/carousel/carusel-1.jpg",
            "assets/carousel/carusel-2.jpg", 
            "assets/carousel/carusel-3.jpg",
            "assets/carousel/carusel-4.jpg",
        ];

        this.isMobile = window.innerWidth < 992;
        this.currentIndex = this.images.length;
        this.isAnimating = false;

        this.handleLoop = this.handleLoop.bind(this);
        this.init();
    }

    init() {
        this.slider.innerHTML = '';
        this.createSlides();
        
        this.slider.removeEventListener('transitionend', this.handleLoop);
        
        this.slider.style.transition = "none"; 
        this.positionSlides();
        
        requestAnimationFrame(() => {
            this.slider.style.transition = "transform 0.3s ease-out";
        });

        this.setupEventListeners();
        this.startAutoplay();
    }

    createSlides() {
        const copies = 3;
        const totalSlides = this.images.length * copies;
        
        for (let i = 0; i < totalSlides; i++) {
            const index = i % this.images.length;
            const slide = document.createElement("div");
            slide.className = "slide";
            slide.innerHTML = `<img src="${this.images[index]}" alt="Slide ${index + 1}">`;
            this.slider.appendChild(slide);
        }
    }

    positionSlides() {
        const slides = this.slider.querySelectorAll(".slide");
        const currentSlideWidth = this.getSlideWidth();
        
        const offset = (this.container.offsetWidth - currentSlideWidth) / 2;
        const baseTransform = -this.currentIndex * currentSlideWidth + offset;
        this.slider.style.transform = `translateX(${baseTransform}px)`;

        slides.forEach((slide, index) => {
            slide.classList.toggle("active", index === this.currentIndex);
        });
    }

    getSlideWidth() {
        const margin = 10;
        if (this.isMobile) {
            return (window.innerWidth < 576 ? 350 : 400) + margin;
        }
        return 400 + margin;
    }

    moveSlides(direction) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        this.currentIndex += direction;
        this.positionSlides();
    }
    
    // AŽURIRANA METODA: Hendler za petlju (loop)
    handleLoop() {
        const numImages = this.images.length;
        const needsLooping = this.currentIndex >= numImages * 2 || this.currentIndex < numImages;

        if (needsLooping) {
            // KORAK 1: Dodaj klasu koja momentalno gasi SVE animacije
            this.slider.classList.add('no-transition');
            this.slider.style.transition = 'none';

            // KORAK 2: Uradi "skok" - prebaci poziciju i .active klasu
            this.currentIndex = (this.currentIndex % numImages) + numImages;
            this.positionSlides();
            
            // KORAK 3: Vrati animacije. Koristimo rAF da bi se ovo desilo u sledećem frejmu,
            // nakon što je browser obradio skok bez animacije.
            requestAnimationFrame(() => {
                this.slider.classList.remove('no-transition');
                this.slider.style.transition = 'transform 0.3s ease-out';
            });
        }
    }

    setupEventListeners() {
        this.slider.addEventListener('transitionend', (event) => {
            if (event.target === this.slider && event.propertyName === 'transform') {
                this.handleLoop();
                this.isAnimating = false;
            }
        });
        
        this.container.addEventListener("click", (e) => {
            const rect = this.container.getBoundingClientRect();
            const isLeft = e.clientX < rect.left + rect.width / 2;
            this.moveSlides(isLeft ? -1 : 1);
        });

        let touchStartX = 0;
        this.container.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; this.stopAutoplay(); }, { passive: true });
        this.container.addEventListener('touchend', (e) => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) this.moveSlides(diff > 0 ? 1 : -1);
            this.startAutoplay();
        }, { passive: true });

        window.addEventListener("resize", () => {
            this.isMobile = window.innerWidth < 992;
            this.slider.style.transition = 'none';
            this.positionSlides();
        });
        
        this.container.addEventListener("mouseenter", () => this.stopAutoplay());
        this.container.addEventListener("mouseleave", () => this.startAutoplay());
    }

    startAutoplay() {
        this.stopAutoplay();
        this.autoplayInterval = setInterval(() => this.moveSlides(1), 4000);
    }

    stopAutoplay() {
        clearInterval(this.autoplayInterval);
        this.autoplayInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', () => { new ImprovedSlider(); });

let currentLanguage = 'de';
let currentGallery = []; // Pamti slike iz trenutno otvorene kategorije
let currentIndex = 0;   // Pamti indeks trenutno prikazane slike
let currentCategory = ''; // << NOVA PROMENLJIVA: Pamti trenutnu kategoriju

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // initializeSlideshow();
    new ImprovedSlider();
    populateGallery();
    bindEventListeners();
    setupDarkModeDetector();
});

function populateGallery() {
    const colorfulGallery = document.getElementById('colorful-gallery');
    const bwGallery = document.getElementById('bw-gallery');
    const olderGallery = document.getElementById('older-gallery');

    // Clear existing content
    colorfulGallery.innerHTML = '';
    bwGallery.innerHTML = '';
    olderGallery.innerHTML = '';

    // Populate colorful gallery
    galleryData.colorful.forEach(item => {
        const galleryItem = createGalleryItem(item, 'colorful');
        colorfulGallery.appendChild(galleryItem);
    });

    // Populate black & white gallery
    galleryData.blackwhite.forEach(item => {
        const galleryItem = createGalleryItem(item, 'blackwhite');
        bwGallery.appendChild(galleryItem);
    });

    // Populate older works gallery
    galleryData.older.forEach(item => {
        const galleryItem = createGalleryItem(item, 'older');
        olderGallery.appendChild(galleryItem);
    });
}

function createGalleryItem(item, category) {
    const div = document.createElement('div');
    div.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = item.image;
    img.alt = currentLanguage === 'de' ? item.title : item.titleEn;
    img.loading = item.loading;

    const caption = document.createElement('span');
    caption.textContent = currentLanguage === 'de' ? item.title : item.titleEn;

    div.appendChild(img);
    div.appendChild(caption);

    div.addEventListener('click', () => {
        openModal(item, category);
    });

    return div;
}


// AŽURIRANA FUNKCIJA openModal
function openModal(item, category) {
    const modal = document.getElementById('modal');

    // Postavi trenutnu kategoriju kako bi ostale funkcije znale o kojoj se radi
    currentCategory = category;

    // Odredi koja galerija je aktivna na osnovu kategorije
    if (category === 'colorful') {
        currentGallery = galleryData.colorful;
    } else if (category === 'blackwhite') {
        currentGallery = galleryData.blackwhite;
    } else {
        currentGallery = galleryData.older;
    }
    
    // Pronađi indeks kliknute slike u nizu
    currentIndex = currentGallery.findIndex(galleryItem => galleryItem.image === item.image);

    modal.style.display = 'flex';
    document.querySelector('.nav-wrapper').style.display = 'none';
    document.body.style.overflow = 'hidden';

    // Prikaži prvu sliku
    showImage(currentIndex);
}

// AŽURIRANA FUNKCIJA showImage (sa logikom za sakrivanje)
function showImage(index) {
    // Proveri da li je indeks u validnom opsegu
    if (index >= currentGallery.length) {
        index = 0;
    }
    if (index < 0) {
        index = currentGallery.length - 1;
    }
    
    currentIndex = index;
    const item = currentGallery[currentIndex];

    // Pronađi elemente u modalu
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalImage = document.getElementById('modal-image');
    const modalInfo = document.querySelector('.modal-info'); // Selektuj kontejner sa informacijama

    // *** KLJUČNA IZMENA: Sakrij ili prikaži informacije o slici ***
    // Ako je kategorija 'older', sakrij .modal-info, u suprotnom ga prikaži.
    if (currentCategory === 'older') {
        modalInfo.style.display = 'none';
    } else {
        modalInfo.style.display = 'block'; // ili 'flex', zavisno od vašeg CSS-a
    }

    // Popuni podatke u modalu
    modalTitle.textContent = currentLanguage === 'de' ? item.title : item.titleEn;
    
    let details = '';
    if (item.subtitle) details += `"${item.subtitle}"<br>`;
    if (item.size) details += `${item.size}<br>`;
    if (item.medium) details += currentLanguage === 'de' ? item.mediumDe : item.medium;
    
    modalDetails.innerHTML = details;
    modalImage.src = item.image;
    modalImage.alt = currentLanguage === 'de' ? item.title : item.titleEn;
}

// NOVA FUNKCIJA ZA NAVIGACIJU
function navigateGallery(direction) {
    showImage(currentIndex + direction);
}

function bindEventListeners() {
    // Unutar ili pored tvoje bindEventListeners funkcije

    // Navigacija klikom na strelice
    document.querySelector('.next').addEventListener('click', () => navigateGallery(1));
    document.querySelector('.prev').addEventListener('click', () => navigateGallery(-1));

    // Navigacija tastaturom (levo/desno)
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('modal');
        if (modal.style.display === 'flex') { // Ako je modal otvoren
            if (e.key === 'ArrowRight') {
                navigateGallery(1);
            } else if (e.key === 'ArrowLeft') {
                navigateGallery(-1);
            } else if (e.key === 'Escape') {
                // Iskoristi postojeću logiku za zatvaranje
                modal.style.display = 'none';
                document.querySelector('.nav-wrapper').style.display = '';
                document.body.style.overflow = '';
            }
        }
    });

    // Osnovna Swipe funkcionalnost za mobilne
    let touchStartX = 0;
    let touchEndX = 0;
    const modalImage = document.getElementById('modal-image');

    modalImage.addEventListener('touchstart', function(event) {
        touchStartX = event.changedTouches[0].screenX;
    }, { passive: true });

    modalImage.addEventListener('touchend', function(event) {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        // Prevlačenje ulevo (sledeća slika)
        if (touchEndX < touchStartX - 50) { // 50px je prag
            navigateGallery(1);
        }
        
        // Prevlačenje udesno (prethodna slika)
        if (touchEndX > touchStartX + 50) {
            navigateGallery(-1);
        }
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('data-section');
            showSection(targetSection);
            updateActiveNavLink(this);
        });
    });

    // Language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
            updateActiveLangBtn(this);
        });
    });

    // Modal close
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
        document.querySelector('.nav-wrapper').style.display = '';
        document.body.style.overflow = '';
    });

    // Modal background close
    document.getElementById('modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
            document.querySelector('.nav-wrapper').style.display = '';
            document.body.style.overflow = '';
        }
    });

    // Contact form
    // document.querySelector('form').addEventListener('submit', function(e) {
    //     e.preventDefault();
    //     alert(currentLanguage === 'de' ? 'Nachricht gesendet!' : 'Message sent!');
    //     this.reset();
    // });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function updateActiveNavLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function updateActiveLangBtn(activeBtn) {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.display = 'inline-block';
    });

    activeBtn.classList.add('active');
    activeBtn.style.display = 'none';

    // Prikaži samo suprotni jezik
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (!btn.classList.contains('active')) {
            btn.textContent = currentLanguage === 'de' ? 'EN' : 'DE';
        }
    });
}


function switchLanguage(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const section = link.getAttribute('data-section');
        link.textContent = content[lang].nav[section];
    });

    // Update gallery section titles
    document.querySelectorAll('.section-title').forEach((title, index) => {
        if (index === 0) title.textContent = content[lang].gallery.colorful;
        if (index === 1) title.textContent = content[lang].gallery.blackwhite;
        if (index === 2) title.textContent = content[lang].gallery.older;
        if (index === 3) title.textContent = content[lang].about.title;
    });

    // Update about section
    const aboutSection = document.querySelector('#about .about-content');
    if (aboutSection) {
        aboutSection.querySelector('h2').textContent = content[lang].about.title;
        aboutSection.querySelector('.about-text').innerHTML = content[lang].about.content;
        aboutSection.querySelector('.quote').textContent = content[lang].about.quote;
    }

    // Update contact section
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        contactSection.querySelector('h2').textContent = content[lang].contact.title;
        contactSection.querySelector('p').textContent = content[lang].contact.subtitle;
        contactSection.querySelector('label[for="name"]').textContent = content[lang].contact.name;
        contactSection.querySelector('label[for="email"]').textContent = content[lang].contact.email;
        contactSection.querySelector('label[for="subject"]').textContent = content[lang].contact.subject;
        contactSection.querySelector('label[for="message"]').textContent = content[lang].contact.message;
        contactSection.querySelector('.submit-btn').textContent = content[lang].contact.send;
    }

    // Repopulate gallery with new language
    populateGallery();

    // Update language toggle buttons
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    updateActiveLangBtn(activeBtn);
}

// Burger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burger-menu');
    const subNav = document.getElementById('sub-nav');
    
    burgerMenu.addEventListener('click', function() {
        subNav.classList.toggle('show');
        
        // Animate burger menu
        this.classList.toggle('active');
        
        // Close menu when clicking on nav links
        const navLinks = subNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                subNav.classList.remove('show');
                burgerMenu.classList.remove('active');
            });
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!burgerMenu.contains(e.target) && !subNav.contains(e.target)) {
            subNav.classList.remove('show');
            burgerMenu.classList.remove('active');
        }
    });
});

// Optional: Add burger menu animation
const style = document.createElement('style');
style.textContent = `
    .burger-menu.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }
    
    .burger-menu.active span:nth-child(2) {
        opacity: 0;
    }
    
    .burger-menu.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }
`;
document.head.appendChild(style);

document.querySelectorAll('.lang-btn').forEach(btn => {
if (btn.classList.contains('active')) {
    btn.style.display = 'none';
}
});

// Back to Top functionality
const backToTopBtn = document.getElementById('backToTop');
const navbar = document.getElementById('navbar');

// Show/hide back to top dugme
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }

    // Sticky navigation
    if (window.pageYOffset > 100) {
        navbar.classList.add('sticky');
    } else {
        navbar.classList.remove('sticky');
    }
});

// Back to top click
backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});


window.addEventListener("scroll", function () {
    if (window.innerWidth < 900) {
        const nav = document.querySelector(".nav-wrapper");

        if (window.scrollY > 200) {
            nav.classList.add("is-sticky");
        } else {
            nav.classList.remove("is-sticky");
        }
    }
});

window.onload = function() {
    // Reset the form fields when the page loads
    document.getElementById("form").reset();
};

window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('preloader').style.display = 'none';
    }, 3000); // 3 sekunde
});

function setupDarkModeDetector() {
    const body = document.body;
    const containerFluid = document.querySelector('.container-fluid');

    if (!containerFluid) return;

    const checkAndUpdateDarkModeClass = () => {
        // Prvo proveri boju na .container-fluid
        let computedStyle = window.getComputedStyle(containerFluid);
        let backgroundColor = computedStyle.backgroundColor;

        // Ako je providna (kao na mobilnom), proveri boju na <body>
        if (backgroundColor === 'rgba(0, 0, 0, 0)') {
            computedStyle = window.getComputedStyle(body);
            backgroundColor = computedStyle.backgroundColor;
        }

        const rgbMatch = backgroundColor.match(/\d+/g);
        if (!rgbMatch) return;

        const rgb = rgbMatch.map(Number);
        const brightness = Math.round(((rgb[0] * 299) + (rgb[1] * 587) + (rgb[2] * 114)) / 1000);
        
        // Ako je pozadina tamna, dodaj klasu. Ako je svetla, ukloni je.
        if (brightness < 128) {
            body.classList.add('dark-mode-active');
        } else {
            body.classList.remove('dark-mode-active');
        }
    };

    // Postavi "čuvara" (MutationObserver) na oba elementa
    const observer = new MutationObserver(checkAndUpdateDarkModeClass);
    const observerOptions = { attributes: true, attributeFilter: ['style', 'class'] };
    
    observer.observe(containerFluid, observerOptions);
    observer.observe(body, observerOptions);

    // Pokreni proveru odmah
    checkAndUpdateDarkModeClass();
}