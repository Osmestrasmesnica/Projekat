// Učitaj jezik iz localStorage ili koristi default 'de'
let currentLanguage = localStorage.getItem('selectedLanguage') || 'de';

// Debug funkcija
function logLanguageState() {
    console.log('Current language:', currentLanguage);
    console.log('LocalStorage language:', localStorage.getItem('selectedLanguage'));
    console.log('URL:', window.location.href);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // PRVO proveri URL parametre za jezik
    checkURLForLanguage();
    
    // ZATIM postavi jezik na početku (koji može biti ažuriran iz URL-a)
    initializeLanguage();
    
    // Ostala inicijalizacija
    if (document.getElementById('colorful-gallery')) {
        // Samo ako smo na glavnoj stranici
        new ImprovedSlider();
        populateGallery();
    }
    
    bindEventListeners();
    
    // Ako smo na glavnoj stranici i imamo hash u URL-u, idi na tu sekciju
    if (!window.location.pathname.includes('success.html') && window.location.hash) {
        const sectionId = window.location.hash.substring(1).split('?')[0]; // Ukloni ? deo
        if (sectionId && typeof showSection === 'function') {
            setTimeout(() => {
                showSection(sectionId);
                const targetLink = document.querySelector(`[data-section="${sectionId}"]`);
                if (targetLink) {
                    updateActiveNavLink(targetLink);
                }
            }, 100);
        }
    }
});

// Nova funkcija za čitanje jezika iz URL-a
function checkURLForLanguage() {
    // Proveri hash deo URL-a za jezik
    const hash = window.location.hash;
    if (hash.includes('?lang=')) {
        const langFromHash = hash.split('?lang=')[1];
        if (langFromHash === 'de' || langFromHash === 'en') {
            currentLanguage = langFromHash;
            localStorage.setItem('selectedLanguage', langFromHash);
            console.log('Language set from hash:', langFromHash); // Debug
        }
    }
    
    // Takođe proveri search parametar
    const urlParams = new URLSearchParams(window.location.search);
    const langFromURL = urlParams.get('lang');
    
    if (langFromURL && (langFromURL === 'de' || langFromURL === 'en')) {
        currentLanguage = langFromURL;
        localStorage.setItem('selectedLanguage', langFromURL);
        console.log('Language set from URL param:', langFromURL); // Debug
        
        // Ukloni parametar iz URL-a da ostane čist
        if (window.history && window.history.replaceState) {
            const cleanURL = window.location.pathname + window.location.hash.split('?')[0];
            window.history.replaceState({}, document.title, cleanURL);
        }
    }
}

// Funkcija za inicijalizaciju jezika
function initializeLanguage() {
    // Debug log
    logLanguageState();
    
    // Postavi jezik na HTML element
    document.documentElement.lang = currentLanguage;
    
    // Ažuriraj jezik dugmad
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${currentLanguage}"]`);
    if (activeBtn) {
        updateActiveLangBtn(activeBtn);
    }
    
    // Ažuriraj sadržaj na osnovu stranice
    if (window.location.pathname.includes('success.html')) {
        updateSuccessPageContent();
    } else {
        // Glavna stranica
        updateMainPageContent();
    }
}

// Funkcija za ažuriranje sadržaja success stranice
function updateSuccessPageContent() {
    // Ažuriraj navigaciju
    document.querySelectorAll('.nav-link').forEach(link => {
        const section = link.getAttribute('data-section');
        if (content[currentLanguage].nav[section]) {
            link.textContent = content[currentLanguage].nav[section];
        }
    });
    
    // Ažuriraj success sadržaj
    const successTitle = document.querySelector('.success-title');
    const successMessage = document.querySelector('.success-message p');
    const backButton = document.querySelector('.back-btn');
    
    if (successTitle) {
        successTitle.textContent = content[currentLanguage].success.title;
    }
    
    if (successMessage) {
        successMessage.textContent = content[currentLanguage].success.message;
    }
    
    if (backButton) {
        // Dodaj jezik kao parametar kada ideš nazad na glavnu stranicu
        const currentLang = localStorage.getItem('selectedLanguage') || 'de';
        backButton.href = 'index.html?lang=' + currentLang;
        backButton.innerHTML = `<i class="bi bi-arrow-left me-2"></i>${content[currentLanguage].success.backButton}`;
    }
}

// Funkcija za ažuriranje sadržaja glavne stranice
function updateMainPageContent() {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        const section = link.getAttribute('data-section');
        if (content[currentLanguage].nav[section]) {
            link.textContent = content[currentLanguage].nav[section];
        }
    });

    // Update gallery section titles
    document.querySelectorAll('.section-title').forEach((title, index) => {
        if (index === 0) title.textContent = content[currentLanguage].gallery.colorful;
        if (index === 1) title.textContent = content[currentLanguage].gallery.blackwhite;
        if (index === 2) title.textContent = content[currentLanguage].gallery.older;
        if (index === 3) title.textContent = content[currentLanguage].about.title;
    });

    // Update about section
    const aboutSection = document.querySelector('#about .about-content');
    if (aboutSection) {
        const aboutTitle = aboutSection.querySelector('h2');
        const aboutText = aboutSection.querySelector('.about-text');
        const quote = aboutSection.querySelector('.quote');
        
        if (aboutTitle) aboutTitle.textContent = content[currentLanguage].about.title;
        if (aboutText) aboutText.innerHTML = content[currentLanguage].about.content;
        if (quote) quote.textContent = content[currentLanguage].about.quote;
    }

    // Update contact section
    const contactSection = document.querySelector('#contact');
    if (contactSection) {
        const contactTitle = contactSection.querySelector('h2');
        const contactSubtitle = contactSection.querySelector('p');
        const nameLabel = contactSection.querySelector('label[for="name"]');
        const emailLabel = contactSection.querySelector('label[for="email"]');
        const subjectLabel = contactSection.querySelector('label[for="subject"]');
        const messageLabel = contactSection.querySelector('label[for="message"]');
        const submitBtn = contactSection.querySelector('.submit-btn');
        
        if (contactTitle) contactTitle.textContent = content[currentLanguage].contact.title;
        if (contactSubtitle) contactSubtitle.textContent = content[currentLanguage].contact.subtitle;
        if (nameLabel) nameLabel.textContent = content[currentLanguage].contact.name;
        if (emailLabel) emailLabel.textContent = content[currentLanguage].contact.email;
        if (subjectLabel) subjectLabel.textContent = content[currentLanguage].contact.subject;
        if (messageLabel) messageLabel.textContent = content[currentLanguage].contact.message;
        if (submitBtn) submitBtn.textContent = content[currentLanguage].contact.send;
    }

    // Repopulate gallery with new language (samo ako postoji)
    if (typeof populateGallery === 'function') {
        populateGallery();
    }
}

function populateGallery() {
    const colorfulGallery = document.getElementById('colorful-gallery');
    const bwGallery = document.getElementById('bw-gallery');
    const olderGallery = document.getElementById('older-gallery');

    if (!colorfulGallery || !bwGallery || !olderGallery) return;

    // Clear existing content
    colorfulGallery.innerHTML = '';
    bwGallery.innerHTML = '';
    olderGallery.innerHTML = '';

    // Populate colorful gallery
    if (typeof galleryData !== 'undefined') {
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

function openModal(item, category) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.getElementById('modal-details');
    const modalImage = document.getElementById('modal-image');

    if (!modal || !modalTitle || !modalDetails || !modalImage) return;

    modalTitle.textContent = currentLanguage === 'de' ? item.title : item.titleEn;
    
    let details = '';
    if (item.subtitle) {
        details += `"${item.subtitle}"<br>`;
    }
    if (item.size) {
        details += `${item.size}<br>`;
    }
    if (item.medium) {
        details += currentLanguage === 'de' ? item.mediumDe : item.medium;
    }
    modalDetails.innerHTML = details;

    // Set modal image
    modalImage.src = item.image;
    modalImage.alt = currentLanguage === 'de' ? item.title : item.titleEn;
    
    modal.style.display = 'flex';

    document.querySelector('.nav-wrapper').style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function bindEventListeners() {
    // Navigation - AŽURIRANO za rad sa linkovima između stranica
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            const targetSection = this.getAttribute('data-section');
            
            // Ako smo na success.html i kliknemo na navigaciju, idemo na index.html
            if (window.location.pathname.includes('success.html')) {
                // Dodaj jezik kao parametar u URL - koristeći hash način
                const currentLang = localStorage.getItem('selectedLanguage') || 'de';
                if (href && href.includes('index.html')) {
                    // Dodaj jezik u hash deo
                    const newHref = href + '?lang=' + currentLang;
                    window.location.href = newHref;
                } else {
                    // Za slučaj da nema href
                    window.location.href = 'index.html#' + targetSection + '?lang=' + currentLang;
                }
                return; // Izađi iz funkcije
            }
            
            // Ako smo na glavnoj stranici, koristi normalnu navigaciju
            if (!href || href.startsWith('#') || href.includes('index.html#')) {
                e.preventDefault();
                if (typeof showSection === 'function') {
                    showSection(targetSection);
                    updateActiveNavLink(this);
                }
            }
            // Inače dozvoli prirodno ponašanje linka
        });
    });

    // Language switcher - AŽURIRANO
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
            updateActiveLangBtn(this);
        });
    });

    // Modal close (samo ako postoji modal)
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            const modal = document.getElementById('modal');
            if (modal) {
                modal.style.display = 'none';
                document.querySelector('.nav-wrapper').style.display = '';
                document.body.style.overflow = '';
            }
        });
    }

    // Modal background close
    const modal = document.getElementById('modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.querySelector('.nav-wrapper').style.display = '';
                document.body.style.overflow = '';
            }
        });
    }
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
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

// AŽURIRANA FUNKCIJA za menjanje jezika
function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Sačuvaj jezik u localStorage
    localStorage.setItem('selectedLanguage', lang);
    
    document.documentElement.lang = lang;
    
    // Ažuriraj sadržaj na osnovu stranice
    if (window.location.pathname.includes('success.html')) {
        updateSuccessPageContent();
    } else {
        updateMainPageContent();
    }

    // Update language toggle buttons
    const activeBtn = document.querySelector(`.lang-btn[data-lang="${lang}"]`);
    if (activeBtn) {
        updateActiveLangBtn(activeBtn);
    }
}

// Burger menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const burgerMenu = document.getElementById('burger-menu');
    const subNav = document.getElementById('sub-nav');
    
    if (burgerMenu && subNav) {
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
    }
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

// Hide active language button initially
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        if (btn.classList.contains('active')) {
            btn.style.display = 'none';
        }
    });
});

// Back to Top functionality
const backToTopBtn = document.getElementById('backToTop');
const navbar = document.getElementById('navbar');

if (backToTopBtn) {
    // Show/hide back to top dugme
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Sticky navigation
        if (navbar && window.pageYOffset > 100) {
            navbar.classList.add('sticky');
        } else if (navbar) {
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
}

// Sticky navigation for mobile
window.addEventListener("scroll", function () {
    if (window.innerWidth < 900) {
        const nav = document.querySelector(".nav-wrapper");

        if (nav) {
            if (window.scrollY > 200) {
                nav.classList.add("is-sticky");
            } else {
                nav.classList.remove("is-sticky");
            }
        }
    }
});

// Reset form when page loads
window.onload = function() {
    const form = document.getElementById("form");
    if (form) {
        form.reset();
    }
};