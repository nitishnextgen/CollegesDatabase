// Global Universities Database - Main Application
document.addEventListener('DOMContentLoaded', function () {
    // Initialize the application
    init();
});

// Global state
let displayedUniversities = 1000; // Show all universities
let filteredData = [...universitiesData];
let currentView = 'grid';

// Initialize app
function init() {
    // Show loading
    showLoading();

    // Simulate loading
    setTimeout(() => {
        hideLoading();
        setupEventListeners();
        populateFilters();
        renderUniversities();
        updateStatistics();
        renderFeaturedUniversities();
        updateRegionCounts();
        populateCompareDropdowns();
        updateDownloadStats(); // Add this line
    }, 500);
}

// Loading functions
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Setup all event listeners
function setupEventListeners() {
    // Navbar scroll effect
    window.addEventListener('scroll', handleScroll);

    // Mobile menu
    document.getElementById('mobileMenuBtn').addEventListener('click', toggleMobileMenu);
    document.getElementById('mobileMenuOverlay').addEventListener('click', closeMobileMenu);
    
    // Close mobile menu when clicking nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('clearSearch').addEventListener('click', clearSearch);

    // Filters
    document.getElementById('regionFilter').addEventListener('change', handleFilters);
    document.getElementById('countryFilter').addEventListener('change', handleFilters);
    document.getElementById('streamFilter').addEventListener('change', handleFilters);
    document.getElementById('sortFilter').addEventListener('change', handleSort);

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleView(btn.dataset.view));
    });

    // Load more
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreUniversities);

    // Region cards
    document.querySelectorAll('.region-card').forEach(card => {
        card.addEventListener('click', () => filterByRegion(card.dataset.region));
    });

    // Stream cards
    document.querySelectorAll('.stream-card').forEach(card => {
        card.addEventListener('click', () => filterByStream(card.dataset.stream));
    });

    // Admission cards expand/collapse
    document.querySelectorAll('.admission-card-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.parentElement;
            card.classList.toggle('active');
        });
    });

    // Compare
    document.querySelectorAll('.compare-select').forEach(select => {
        select.addEventListener('change', updateCompareTable);
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('universityModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('universityModal')) closeModal();
    });

    // Contact form (if exists)
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }

    // Back to top
    document.getElementById('backToTop').addEventListener('click', scrollToTop);

    // Featured slider
    document.getElementById('sliderPrev').addEventListener('click', () => scrollFeatured(-1));
    document.getElementById('sliderNext').addEventListener('click', () => scrollFeatured(1));

    // Nav links smooth scroll
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                closeMobileMenu();
                updateActiveNav(link);
            }
        });
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// Handle scroll events
function handleScroll() {
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
    // Update active nav based on scroll position
    updateActiveNavOnScroll();
}

// Mobile menu functions
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    navMenu.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Change icon
    const icon = menuBtn.querySelector('i');
    if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const overlay = document.getElementById('mobileMenuOverlay');
    const menuBtn = document.getElementById('mobileMenuBtn');
    
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    
    // Reset icon
    const icon = menuBtn.querySelector('i');
    icon.classList.remove('fa-times');
    icon.classList.add('fa-bars');
}

// Update active navigation
function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function updateActiveNavOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Populate filter dropdowns
function populateFilters() {
    const countries = [...new Set(universitiesData.map(u => u.country))].sort();
    const countrySelect = document.getElementById('countryFilter');

    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
    // Add Unranked filter option
    const sortFilter = document.getElementById('sortFilter');
    if (sortFilter && ![...sortFilter.options].some(opt => opt.value === 'unranked')) {
        const unrankedOption = document.createElement('option');
        unrankedOption.value = 'unranked';
        unrankedOption.textContent = 'Unranked Universities';
        sortFilter.appendChild(unrankedOption);
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

// Handle search
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    applyFilters();
}

// Clear search
function clearSearch() {
    document.getElementById('searchInput').value = '';
    applyFilters();
}

// Handle filter changes
function handleFilters() {
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    const regionFilter = document.getElementById('regionFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const streamFilter = document.getElementById('streamFilter').value;

    filteredData = universitiesData.filter(uni => {
        // Search filter
        const matchesSearch = !searchQuery ||
            uni.name.toLowerCase().includes(searchQuery) ||
            uni.location.toLowerCase().includes(searchQuery) ||
            uni.country.toLowerCase().includes(searchQuery) ||
            uni.programs.toLowerCase().includes(searchQuery);

        // Region filter
        let matchesRegion = true;
        if (regionFilter) {
            const countriesInRegion = regionMapping[regionFilter] || [];
            matchesRegion = countriesInRegion.includes(uni.country);
        }

        // Country filter
        const matchesCountry = !countryFilter || uni.country === countryFilter;

        // Stream filter
        const matchesStream = !streamFilter || uni.programs.toLowerCase().includes(streamFilter.toLowerCase());

        return matchesSearch && matchesRegion && matchesCountry && matchesStream;
    });

    // Reset displayed count - show all
    displayedUniversities = 1000;

    // Apply sorting
    handleSort();

    // Update UI
    updateActiveFilters();
    updateResultsCount();
}

// Handle sorting
function handleSort() {
    const sortBy = document.getElementById('sortFilter').value;

    // Handle unranked filter separately as it's a filter operation, not a sort
    if (sortBy === 'unranked') {
        filteredData = universitiesData.filter(u => !u.globalRank && u.ranking === null);
        renderUniversities();
        return;
    }

    // Apply sorting to filtered data
    filteredData.sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'ranking':
                const rankA = a.globalRank || 9999;
                const rankB = b.globalRank || 9999;
                return rankA - rankB;
            case 'country':
                return a.country.localeCompare(b.country);
            default:
                return 0;
        }
    });

    renderUniversities();
}

// Update active filters display
function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    container.innerHTML = '';

    const regionFilter = document.getElementById('regionFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const streamFilter = document.getElementById('streamFilter').value;
    const searchQuery = document.getElementById('searchInput').value.trim();

    if (searchQuery) {
        addFilterTag(container, 'Search', searchQuery, () => {
            document.getElementById('searchInput').value = '';
            applyFilters();
        });
    }

    if (regionFilter) {
        addFilterTag(container, 'Region', regionFilter, () => {
            document.getElementById('regionFilter').value = '';
            applyFilters();
        });
    }

    if (countryFilter) {
        addFilterTag(container, 'Country', countryFilter, () => {
            document.getElementById('countryFilter').value = '';
            applyFilters();
        });
    }

    if (streamFilter) {
        addFilterTag(container, 'Stream', streamFilter, () => {
            document.getElementById('streamFilter').value = '';
            applyFilters();
        });
    }
}

function addFilterTag(container, label, value, onRemove) {
    const tag = document.createElement('span');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        ${label}: ${value}
        <button onclick="event.stopPropagation()"><i class="fas fa-times"></i></button>
    `;
    tag.querySelector('button').addEventListener('click', onRemove);
    container.appendChild(tag);
}

// Update results count
function updateResultsCount() {
    const countEl = document.getElementById('resultsCount');
    const total = filteredData.length;
    const displayed = Math.min(displayedUniversities, total);

    if (total === universitiesData.length) {
        countEl.textContent = `Showing ${displayed} of ${total} universities`;
    } else {
        countEl.textContent = `Found ${total} universities matching your criteria`;
    }
}

// Render universities
function renderUniversities() {
    const grid = document.getElementById('universitiesGrid');
    const toShow = filteredData.slice(0, displayedUniversities);

    if (toShow.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h3>No universities found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = toShow.map((uni, index) => createUniversityCard(uni, index)).join('');
    // Add Unranked Universities section if any
    const unranked = universitiesData.filter(u => !u.globalRank);
    if (unranked.length > 0) {
        const unrankedSection = document.getElementById('unrankedUniversitiesSection');
        if (unrankedSection) {
            unrankedSection.innerHTML = `
                    <h2>Unranked Universities</h2>
                    <div class="university-list">
                        ${unranked.map((uni, i) => createUniversityCard(uni, i)).join('')}
                    </div>
                `;
        }
    }

    // Add click listeners
    grid.querySelectorAll('.university-card').forEach((card, index) => {
        card.addEventListener('click', () => openModal(toShow[index]));
    });

    // Update load more button
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (displayedUniversities >= filteredData.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }

    updateResultsCount();
}

// Create university card HTML
function createUniversityCard(uni, index) {
    const programs = uni.programs.split(', ').slice(0, 3);
    const rankDisplay = uni.globalRank ? `#${uni.globalRank}` : 'Unranked';

    return `
        <div class="university-card fade-in" style="animation-delay: ${index * 0.05}s">
            <div class="card-header">
                <span class="card-rank">${rankDisplay}</span>
                <span class="card-country">
                    <i class="fas fa-map-marker-alt"></i>
                    ${uni.country}
                </span>
                <h3 class="card-title">${uni.name}</h3>
            </div>
            <div class="card-body">
                <div class="card-location">
                    <i class="fas fa-location-dot"></i>
                    ${uni.location}
                </div>
                <div class="card-programs">
                    ${programs.map(p => `<span class="program-tag">${p.trim()}</span>`).join('')}
                </div>
                <div class="card-footer">
                    <span class="card-fee">
                        <strong>${uni.feeStructure.split('/')[0]}</strong>/year
                    </span>
                    <span class="card-link">
                        View Details <i class="fas fa-arrow-right"></i>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Toggle view (grid/list)
function toggleView(view) {
    currentView = view;
    const grid = document.getElementById('universitiesGrid');

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });

    grid.classList.toggle('list-view', view === 'list');
}

// Load more universities
function loadMoreUniversities() {
    displayedUniversities += 12;
    renderUniversities();
}

// Filter by region (from region cards)
function filterByRegion(region) {
    document.getElementById('regionFilter').value = region;
    applyFilters();

    // Scroll to universities section
    document.getElementById('universities').scrollIntoView({ behavior: 'smooth' });
}

// Filter by stream (from stream cards)
function filterByStream(stream) {
    // Toggle stream card active state
    document.querySelectorAll('.stream-card').forEach(card => {
        card.classList.toggle('active', card.dataset.stream === stream);
    });

    document.getElementById('streamFilter').value = stream;
    applyFilters();

    // Scroll to universities section
    document.getElementById('universities').scrollIntoView({ behavior: 'smooth' });
}

// Modal functions
function openModal(uni) {
    const modal = document.getElementById('universityModal');
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${uni.name}</h2>
            <p class="modal-subtitle">${uni.location}, ${uni.country}</p>
        </div>
        <div class="modal-info">
            <div class="info-row">
                <span class="info-label"><i class="fas fa-trophy"></i> Global Rank</span>
                <span class="info-value">${uni.globalRank ? `#${uni.globalRank}` : 'Not Ranked'}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="fas fa-info-circle"></i> About</span>
                <span class="info-value">${uni.about}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="fas fa-book"></i> Programs</span>
                <span class="info-value">${uni.programs}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="fas fa-graduation-cap"></i> Qualification</span>
                <span class="info-value">${uni.qualification}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="fas fa-dollar-sign"></i> Fee Structure</span>
                <span class="info-value">${uni.feeStructure}</span>
            </div>
            <div class="info-row">
                <span class="info-label"><i class="fas fa-calendar"></i> Academic Session</span>
                <span class="info-value">${uni.academicSession}</span>
            </div>
        </div>
        <div class="modal-actions">
            <a href="${uni.link}" target="_blank" class="btn btn-primary">
                <i class="fas fa-external-link-alt"></i> Visit Website
            </a>
            <button class="btn btn-secondary" onclick="addToCompare(${uni.id})">
                <i class="fas fa-balance-scale"></i> Add to Compare
            </button>
        </div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('universityModal').classList.remove('active');
    document.body.style.overflow = '';
}

// Add to compare from modal
function addToCompare(id) {
    const selects = document.querySelectorAll('.compare-select');
    for (let select of selects) {
        if (!select.value) {
            select.value = id;
            updateCompareTable();
            closeModal();
            document.getElementById('compare').scrollIntoView({ behavior: 'smooth' });
            return;
        }
    }
    alert('All compare slots are filled. Please clear one first.');
}

// Populate compare dropdowns
function populateCompareDropdowns() {
    const selects = document.querySelectorAll('.compare-select');

    selects.forEach(select => {
        select.innerHTML = '<option value="">Select University</option>';
        universitiesData.forEach(uni => {
            const option = document.createElement('option');
            option.value = uni.id;
            option.textContent = `${uni.name} (${uni.country})`;
            select.appendChild(option);
        });
    });
}

// Update compare table
function updateCompareTable() {
    const container = document.getElementById('compareTableContainer');
    const ids = Array.from(document.querySelectorAll('.compare-select'))
        .map(select => parseInt(select.value))
        .filter(id => !isNaN(id));

    if (ids.length === 0) {
        container.innerHTML = '<p class="compare-placeholder">Select universities above to start comparing</p>';
        return;
    }

    const selectedUniversities = ids.map(id => universitiesData.find(u => u.id === id));

    const fields = [
        { key: 'country', label: 'Country' },
        { key: 'location', label: 'Location' },
        { key: 'globalRank', label: 'Global Rank', format: v => v ? `#${v}` : 'Not Ranked' },
        { key: 'programs', label: 'Programs' },
        { key: 'qualification', label: 'Qualification' },
        { key: 'feeStructure', label: 'Fee Structure' },
        { key: 'academicSession', label: 'Academic Session' }
    ];

    container.innerHTML = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Criteria</th>
                    ${selectedUniversities.map(uni => `<th>${uni.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${fields.map(field => `
                    <tr>
                        <td>${field.label}</td>
                        ${selectedUniversities.map(uni => {
        const value = uni[field.key];
        return `<td>${field.format ? field.format(value) : value}</td>`;
    }).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Update statistics
function updateStatistics() {
    const totalUniversities = universitiesData.length;
    const totalCountries = new Set(universitiesData.map(u => u.country)).size;
    const topRanked = universitiesData.filter(u => u.globalRank && u.globalRank <= 50).length;

    // Animate counters
    animateCounter('totalUniversities', totalUniversities);
    animateCounter('totalCountries', totalCountries);
    animateCounter('topRanked', topRanked);

    // Update hero stat
    document.getElementById('universityCount').textContent = totalUniversities + '+';

    // Render charts
    renderCharts();
}

function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 30);
}

// Render charts
function renderCharts() {
    // Region chart
    const regionData = {};
    Object.keys(regionMapping).forEach(region => {
        const count = universitiesData.filter(u =>
            regionMapping[region].includes(u.country)
        ).length;
        regionData[region] = count;
    });

    const regionCtx = document.getElementById('regionChart').getContext('2d');
    new Chart(regionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Americas', 'Europe', 'Asia', 'Oceania', 'Middle East', 'Africa'],
            datasets: [{
                data: Object.values(regionData),
                backgroundColor: [
                    '#2563eb',
                    '#7c3aed',
                    '#06b6d4',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#fff',
                        padding: 15
                    }
                }
            }
        }
    });

    // Country chart
    const countryData = {};
    universitiesData.forEach(u => {
        countryData[u.country] = (countryData[u.country] || 0) + 1;
    });

    const sortedCountries = Object.entries(countryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    const countryCtx = document.getElementById('countryChart').getContext('2d');
    new Chart(countryCtx, {
        type: 'bar',
        data: {
            labels: sortedCountries.map(c => c[0]),
            datasets: [{
                label: 'Universities',
                data: sortedCountries.map(c => c[1]),
                backgroundColor: '#60a5fa',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    ticks: { color: '#fff' },
                    grid: { color: 'rgba(255,255,255,0.1)' }
                },
                y: {
                    ticks: { color: '#fff' },
                    grid: { display: false }
                }
            }
        }
    });
}

// Update region counts
function updateRegionCounts() {
    Object.keys(regionMapping).forEach(region => {
        const count = universitiesData.filter(u =>
            regionMapping[region].includes(u.country)
        ).length;

        const elementId = region.replace('-', '') + 'Count';
        const element = document.getElementById(elementId.replace('middle', 'middleEast'));

        if (element) {
            element.textContent = `${count} Universities`;
        }
    });

    // Fix specific IDs
    const americasEl = document.getElementById('americasCount');
    const europeEl = document.getElementById('europeCount');
    const asiaEl = document.getElementById('asiaCount');
    const oceaniaEl = document.getElementById('oceaniaCount');
    const middleEastEl = document.getElementById('middleEastCount');
    const africaEl = document.getElementById('africaCount');

    if (americasEl) americasEl.textContent = `${universitiesData.filter(u => regionMapping.americas.includes(u.country)).length} Universities`;
    if (europeEl) europeEl.textContent = `${universitiesData.filter(u => regionMapping.europe.includes(u.country)).length} Universities`;
    if (asiaEl) asiaEl.textContent = `${universitiesData.filter(u => regionMapping.asia.includes(u.country)).length} Universities`;
    if (oceaniaEl) oceaniaEl.textContent = `${universitiesData.filter(u => regionMapping.oceania.includes(u.country)).length} Universities`;
    if (middleEastEl) middleEastEl.textContent = `${universitiesData.filter(u => regionMapping['middle-east'].includes(u.country)).length} Universities`;
    if (africaEl) africaEl.textContent = `${universitiesData.filter(u => regionMapping.africa.includes(u.country)).length} Universities`;
}

// Render featured universities
function renderFeaturedUniversities() {
    const featured = universitiesData
        .filter(u => u.globalRank && u.globalRank <= 30)
        .sort((a, b) => a.globalRank - b.globalRank)
        .slice(0, 10);

    const slider = document.getElementById('featuredSlider');

    slider.innerHTML = featured.map(uni => `
        <div class="featured-card" onclick="openModal(universitiesData.find(u => u.id === ${uni.id}))">
            <div class="featured-header">
                <span class="featured-rank">Global Rank #${uni.globalRank}</span>
                <h3 class="featured-name">${uni.name}</h3>
            </div>
            <div class="featured-body">
                <p><i class="fas fa-map-marker-alt"></i> ${uni.location}</p>
                <p><i class="fas fa-globe"></i> ${uni.country}</p>
                <p><i class="fas fa-book"></i> ${uni.programs.split(', ').slice(0, 2).join(', ')}</p>
            </div>
        </div>
    `).join('');
}

// Scroll featured slider
function scrollFeatured(direction) {
    const slider = document.getElementById('featuredSlider');
    const scrollAmount = 370 * direction;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
}

// Handle contact form submission
function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;

    // Simulate form submission
    showLoading();

    setTimeout(() => {
        hideLoading();
        alert(`Thank you, ${name}! Your message has been sent. We'll get back to you soon.`);
        e.target.reset();
    }, 1000);
}

// Newsletter subscription (in footer)
document.querySelector('.newsletter-form')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const email = this.querySelector('input').value;
    if (email) {
        alert(`Thank you for subscribing with ${email}! You'll receive updates soon.`);
        this.reset();
    }
});

// Excel Download Functions
let downloadFilteredData = [...universitiesData];

function downloadExcel(data, filename) {
    // Create proper Excel XML format for .xlsx compatibility
    const headers = [
        'S.No',
        'University Name',
        'Country',
        'Location',
        'Programs/Best Known For',
        'Global Rank',
        'About',
        'Qualification',
        'Fee Structure',
        'Academic Session',
        'Website Link'
    ];

    // Create Excel-compatible XML (SpreadsheetML)
    let excelContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
    <Styles>
        <Style ss:ID="Header">
            <Font ss:Bold="1" ss:Color="#FFFFFF"/>
            <Interior ss:Color="#4472C4" ss:Pattern="Solid"/>
            <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
        </Style>
        <Style ss:ID="Data">
            <Alignment ss:Vertical="Top" ss:WrapText="1"/>
        </Style>
        <Style ss:ID="Link">
            <Font ss:Color="#0563C1" ss:Underline="Single"/>
        </Style>
    </Styles>
    <Worksheet ss:Name="Universities Database">
        <Table>
`;

    // Add column widths
    const colWidths = [40, 200, 100, 120, 200, 60, 300, 200, 150, 150, 200];
    colWidths.forEach(width => {
        excelContent += `            <Column ss:Width="${width}"/>\n`;
    });

    // Add header row
    excelContent += '            <Row ss:Height="30">\n';
    headers.forEach(header => {
        excelContent += `                <Cell ss:StyleID="Header"><Data ss:Type="String">${escapeXml(header)}</Data></Cell>\n`;
    });
    excelContent += '            </Row>\n';

    // Add data rows
    data.forEach((uni, index) => {
        excelContent += '            <Row>\n';
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="Number">${index + 1}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.name)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.country)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.location)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.programs)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="${uni.globalRank ? 'Number' : 'String'}">${uni.globalRank || 'Not Ranked'}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.about)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.qualification)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.feeStructure)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Data"><Data ss:Type="String">${escapeXml(uni.academicSession)}</Data></Cell>\n`;
        excelContent += `                <Cell ss:StyleID="Link"><Data ss:Type="String">${escapeXml(uni.link)}</Data></Cell>\n`;
        excelContent += '            </Row>\n';
    });

    excelContent += `        </Table>
    </Worksheet>
</Workbook>`;

    // Change filename extension to .xls
    const excelFilename = filename.replace('.csv', '.xls');

    // Create Blob and download
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', excelFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Helper function to escape XML special characters
function escapeXml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// Populate download country filter
function populateDownloadCountryFilter() {
    const countries = [...new Set(universitiesData.map(u => u.country))].sort();
    const countrySelect = document.getElementById('downloadCountry');
    if (countrySelect) {
        countrySelect.innerHTML = '<option value="">All Countries</option>';
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }
}

// Populate download country filter based on region
function populateDownloadCountryFilterByRegion() {
    const regionFilter = document.getElementById('downloadRegion')?.value || '';
    const countrySelect = document.getElementById('downloadCountry');
    
    if (!countrySelect) return;
    
    let countries;
    if (regionFilter) {
        const countriesInRegion = regionMapping[regionFilter] || [];
        countries = [...new Set(universitiesData
            .filter(u => countriesInRegion.includes(u.country))
            .map(u => u.country))].sort();
    } else {
        countries = [...new Set(universitiesData.map(u => u.country))].sort();
    }
    
    countrySelect.innerHTML = '<option value="">All Countries</option>';
    countries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countrySelect.appendChild(option);
    });
}

// Update download preview count
function updateDownloadPreview() {
    const regionFilter = document.getElementById('downloadRegion')?.value || '';
    const countryFilter = document.getElementById('downloadCountry')?.value || '';
    const streamFilter = document.getElementById('downloadStream')?.value || '';

    downloadFilteredData = universitiesData.filter(uni => {
        // Region filter
        let matchesRegion = true;
        if (regionFilter) {
            const countriesInRegion = regionMapping[regionFilter] || [];
            matchesRegion = countriesInRegion.includes(uni.country);
        }

        // Country filter
        const matchesCountry = !countryFilter || uni.country === countryFilter;

        // Stream filter
        const matchesStream = !streamFilter || uni.programs.toLowerCase().includes(streamFilter.toLowerCase());

        return matchesRegion && matchesCountry && matchesStream;
    });

    const previewEl = document.getElementById('downloadPreviewCount');
    if (previewEl) {
        previewEl.textContent = `${downloadFilteredData.length} universities`;
    }
}

// Initialize download filters
function initDownloadFilters() {
    populateDownloadCountryFilter();
    updateDownloadPreview();

    document.getElementById('downloadRegion')?.addEventListener('change', function() {
        populateDownloadCountryFilterByRegion();
        updateDownloadPreview();
    });
    document.getElementById('downloadCountry')?.addEventListener('change', updateDownloadPreview);
    document.getElementById('downloadStream')?.addEventListener('change', updateDownloadPreview);
}

// Call on page load
setTimeout(initDownloadFilters, 100);

// Update download statistics
function updateDownloadStats() {
    const totalUniversities = universitiesData.length;
    const uniqueCountries = [...new Set(universitiesData.map(u => u.country))].length;
    
    const totalUniversitiesEl = document.getElementById('totalUniversitiesCount');
    const totalCountriesEl = document.getElementById('totalCountriesCount');
    
    if (totalUniversitiesEl) {
        totalUniversitiesEl.textContent = totalUniversities;
    }
    if (totalCountriesEl) {
        totalCountriesEl.textContent = uniqueCountries;
    }
}

// Download universities
document.getElementById('downloadExcelBtn')?.addEventListener('click', function () {
    if (downloadFilteredData.length === 0) {
        alert('No universities match your filters. Please adjust your criteria.');
        return;
    }

    const filename = downloadFilteredData.length === universitiesData.length
        ? 'Global_Universities_Database.xls'
        : 'Filtered_Universities.xls';

    downloadExcel(downloadFilteredData, filename);

    // Show success message
    const originalText = this.innerHTML;
    this.innerHTML = '<i class="fas fa-check"></i> Downloaded!';
    this.style.background = '#10b981';

    setTimeout(() => {
        this.innerHTML = originalText;
        this.style.background = '';
    }, 2000);
});

// Reset download filters
document.getElementById('resetDownloadFilters')?.addEventListener('click', function () {
    document.getElementById('downloadRegion').value = '';
    document.getElementById('downloadCountry').value = '';
    document.getElementById('downloadStream').value = '';
    updateDownloadPreview();
});

// Download from nav
document.getElementById('downloadExcelNav')?.addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
});
