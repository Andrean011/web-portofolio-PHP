const i18n = {
    id: {
        pageTitle: "Portofolio Group 11 PHP",
        headerSubtitle: "Berkomitmen untuk terus belajar dan menaklukkan tantangan berat.",
        memberLabel: "Anggota",
        groupLabel: "Grup",
        teamLead: "Ketua Tim",
        member: "Anggota",
        motivation: "motivasi",
        viewProfile: "Lihat profil",
        certificates: "Sertifikat",
        fileSuffix: "file",
        openPdf: "Buka PDF",
        openImage: "Buka gambar",
        themeToLight: "Beralih ke mode terang",
        themeToDark: "Beralih ke mode gelap",
        langToEn: "Ganti ke Bahasa Inggris",
        langToId: "Ganti ke Bahasa Indonesia",
        closeModal: "Tutup detail",
        photoMissing: "Foto {name} belum tersedia",
        errorLoading: "Data anggota tidak dapat dimuat.",
        certPdfTitle: "Preview PDF sertifikat",
        certThumbAlt: "Thumbnail sertifikat",
        certModalTitle: "Sertifikat PDF",
        certImageAlt: "Sertifikat"
    },
    en: {
        pageTitle: "Group 11 PHP Portfolio",
        headerSubtitle: "Committed to continuous learning and conquering tough challenges.",
        memberLabel: "Members",
        groupLabel: "Group",
        teamLead: "Team Lead",
        member: "Member",
        motivation: "motivation",
        viewProfile: "View profile",
        certificates: "Certificates",
        fileSuffix: "files",
        openPdf: "Open PDF",
        openImage: "Open image",
        themeToLight: "Switch to light mode",
        themeToDark: "Switch to dark mode",
        langToEn: "Switch to English",
        langToId: "Switch to Indonesian",
        closeModal: "Close detail",
        photoMissing: "Photo of {name} not available",
        errorLoading: "Failed to load member data.",
        certPdfTitle: "PDF certificate preview",
        certThumbAlt: "Certificate thumbnail",
        certModalTitle: "PDF Certificate",
        certImageAlt: "Certificate"
    }
};

let currentLang = localStorage.getItem('php_group_lang') || 'id';
let currentTheme = localStorage.getItem('php_group_theme') || 'dark';
let membersData = [];
let activeModalMemberId = null;

function t(key, replacements = {}) {
    const langDict = i18n[currentLang] || i18n.id;
    let str = langDict[key] || i18n.id[key] || '';
    Object.keys(replacements).forEach(k => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), replacements[k]);
    });
    return str;
}

function getLocalizedText(field) {
    if (!field) return '';
    if (typeof field === 'object') {
        return field[currentLang] || field.id || field.en || '';
    }
    return String(field);
}

function getLocalizedRole(role) {
    return role === 'Team Lead' ? t('teamLead') : t('member');
}

async function init() {
    setupTheme();
    setupLanguage();
    await loadData();
    setupEventListeners();
}

async function loadData() {
    try {
        const response = await fetch('data.json');
        membersData = await response.json();
        renderCards(membersData);
    } catch (error) {
        console.error("Error loading data:", error);
        const container = document.getElementById('member-grid');
        if (container) {
            container.innerHTML = `<p class="data-error">${t('errorLoading')}</p>`;
        }
    }
}

function setupTheme() {
    applyTheme(currentTheme, false);
}

function applyTheme(theme, save = true) {
    currentTheme = theme;
    if (theme === 'light') {
        document.body.classList.add('light-theme');
    } else {
        document.body.classList.remove('light-theme');
    }

    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const nextModeLabel = theme === 'light' ? t('themeToDark') : t('themeToLight');
        themeToggleBtn.setAttribute('aria-label', nextModeLabel);
        themeToggleBtn.setAttribute('title', nextModeLabel);
    }

    if (save) {
        localStorage.setItem('php_group_theme', theme);
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme, true);
}

function setupLanguage() {
    applyLanguage(currentLang, false);
}

function applyLanguage(lang, save = true) {
    currentLang = lang;
    document.documentElement.lang = lang;

    // Update document title
    document.title = t('pageTitle');

    // Update Header static texts
    const headerSubtitle = document.getElementById('header-subtitle');
    if (headerSubtitle) {
        headerSubtitle.textContent = t('headerSubtitle');
    }

    const metaMember = document.getElementById('meta-member-text');
    if (metaMember) {
        metaMember.textContent = t('memberLabel');
    }

    const metaGroup = document.getElementById('meta-group-text');
    if (metaGroup) {
        metaGroup.textContent = t('groupLabel');
    }

    // Update theme toggle tooltip and label
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const nextModeLabel = currentTheme === 'light' ? t('themeToDark') : t('themeToLight');
        themeToggleBtn.setAttribute('aria-label', nextModeLabel);
        themeToggleBtn.setAttribute('title', nextModeLabel);
    }

    // Update active button indicators
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const btnLang = btn.getAttribute('data-lang');
        const isActive = btnLang === currentLang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    // Re-render cards if data is already loaded
    if (membersData.length > 0) {
        renderCards(membersData);
    }

    // If modal is currently open, refresh it with localized content
    if (activeModalMemberId !== null) {
        const activeModal = document.querySelector('.modal-overlay:not([style*="z-index: 2000"])');
        if (activeModal) {
            activeModal.remove();
            showDetail(activeModalMemberId);
        }
    }

    if (save) {
        localStorage.setItem('php_group_lang', lang);
    }
}

function setupEventListeners() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleTheme);
    }

    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang && lang !== currentLang) {
                applyLanguage(lang, true);
            }
        });
    });

    // Global escape key to close active modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlays = document.querySelectorAll('.modal-overlay');
            if (overlays.length > 0) {
                // Remove topmost overlay
                overlays[overlays.length - 1].remove();
                if (overlays.length === 1) {
                    activeModalMemberId = null;
                }
            }
        }
    });
}

function renderCards(members) {
    const container = document.getElementById('member-grid');
    if (!container) return;

    container.innerHTML = members.map(m => {
        const motivationText = capitalizeFirst(getLocalizedText(m.motivation));
        const roleLabel = getLocalizedRole(m.role);
        return `
            <article class="card ${m.role === 'Team Lead' ? 'priority' : ''}" onclick="showDetail(${m.id})" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(${m.id}); }">
                <div class="card-tab">
                    <span class="card-nickname">${m.displayName}</span>
                    <span class="card-role ${m.role === 'Team Lead' ? 'responsible' : 'member'}">${roleLabel}</span>
                </div>
                <div class="card-photo-wrap">
                    ${renderPhoto(m, 'card-photo')}
                </div>
                <div class="card-content">
                    <h3>${m.name}</h3>
                    <div class="motivation-label">${t('motivation')}</div>
                    <p class="motivation">${motivationText}</p>
                    <div class="card-action">${t('viewProfile')} <span aria-hidden="true">-&gt;</span></div>
                </div>
            </article>
        `;
    }).join('');
}

function capitalizeFirst(value) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderPhoto(member, className) {
    if (!member.photo) {
        return `<div class="photo-placeholder ${className}" role="img" aria-label="${t('photoMissing', { name: member.name })}">?</div>`;
    }

    return `<img class="${className}" src="${member.photo}" alt="${member.name}">`;
}

function isPdf(src) {
    return src.toLowerCase().split('?')[0].endsWith('.pdf');
}

function renderCertificateThumbnail(src) {
    if (isPdf(src)) {
        return `<iframe class="cert-thumb cert-pdf-thumb" src="${src}#page=1&view=FitH" title="${t('certPdfTitle')}" loading="lazy"></iframe>`;
    }

    return `<img src="${src}" class="cert-thumb" alt="${t('certThumbAlt')}" loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=Sertifikat'">`;
}

window.showDetail = (id) => {
    try {
        const member = membersData.find(m => Number(m.id) === Number(id));
        if (!member) return;

        activeModalMemberId = id;

        // Close any existing modal
        const existingModal = document.querySelector('.modal-overlay:not([style*="z-index: 2000"])');
        if (existingModal) existingModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
                activeModalMemberId = null;
            }
        };

        const roleLabel = getLocalizedRole(member.role);
        const aboutText = getLocalizedText(member.about);
        const certCount = member.certificates ? member.certificates.length : 0;
        const certCountText = `${certCount} ${t('fileSuffix')}`;

        modal.innerHTML = `
            <div class="modal-content glass" role="dialog" aria-modal="true" aria-labelledby="modal-member-name">
                <div class="modal-topbar">
                    <span class="modal-topbar-label ${member.role === 'Team Lead' ? 'responsible' : 'member'}">${roleLabel}</span>
                    <button class="modal-close close" type="button" aria-label="${t('closeModal')}"></button>
                </div>
                <div class="modal-profile">
                    <div class="modal-photo-wrap">
                        ${renderPhoto(member, 'modal-photo')}
                    </div>
                    <div class="modal-copy">
                        <h2 class="modal-name" id="modal-member-name">${member.name}</h2>
                        <p class="modal-about">${aboutText}</p>
                    </div>
                </div>

                <div class="modal-section-heading">
                    <h3>${t('certificates')}</h3>
                    <span>${certCountText}</span>
                </div>
                <div class="certificates">
                    ${(member.certificates || []).map(c => `
                        <button class="cert-item" type="button" onclick="openLightbox('${c}')" aria-label="${isPdf(c) ? t('openPdf') : t('openImage')}">
                            ${renderCertificateThumbnail(c)}
                            <span>${isPdf(c) ? t('openPdf') : t('openImage')} <b aria-hidden="true">-&gt;</b></span>
                        </button>
                    `).join('')}
                </div>

                <div class="socials">
                    ${member.social && member.social.github && member.social.github !== '#' ? `<a href="${member.social.github}" target="_blank" rel="noopener noreferrer"><img class="social-icon github-icon" src="https://cdn.simpleicons.org/github" alt="">GitHub <span aria-hidden="true">-&gt;</span></a>` : ''}
                    ${member.social && member.social.linkedin && member.social.linkedin !== '#' ? `<a href="${member.social.linkedin}" target="_blank" rel="noopener noreferrer"><span class="social-icon linkedin-logo" aria-hidden="true">in</span>LinkedIn <span aria-hidden="true">-&gt;</span></a>` : ''}
                    ${member.social && member.social.instagram && member.social.instagram !== '#' ? `<a href="${member.social.instagram}" target="_blank" rel="noopener noreferrer"><img class="social-icon" src="https://cdn.simpleicons.org/instagram" alt="">Instagram <span aria-hidden="true">-&gt;</span></a>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.remove();
                activeModalMemberId = null;
            };
        }
    } catch (error) {
        console.error("Error showing details:", error);
    }
};

window.openLightbox = (src) => {
    const lightbox = document.createElement('div');
    lightbox.className = 'modal-overlay';
    lightbox.style.zIndex = '2000';
    lightbox.onclick = (event) => { if (event.target === lightbox) lightbox.remove(); };
    lightbox.innerHTML = isPdf(src)
        ? `<iframe class="pdf-viewer" src="${src}" title="${t('certModalTitle')}"></iframe>`
        : `<img src="${src}" class="image-viewer" alt="${t('certImageAlt')}">`;
    document.body.appendChild(lightbox);
};

document.addEventListener('DOMContentLoaded', init);
