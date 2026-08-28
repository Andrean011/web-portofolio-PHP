async function init() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        renderCards(data);
    } catch (error) {
        console.error("Error loading data:", error);
        const container = document.getElementById('member-grid');
        if (container) {
            container.innerHTML = '<p class="data-error">Data anggota tidak dapat dimuat.</p>';
        }
    }
}

function renderCards(members) {
    const container = document.getElementById('member-grid');
    if (!container) return;
    
    container.innerHTML = members.map(m => `
        <article class="card ${m.role === 'Team Lead' ? 'priority' : ''}" onclick="showDetail(${m.id})" tabindex="0" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showDetail(${m.id}); }">
            <div class="card-tab">
                <span class="card-nickname">${m.displayName}</span>
                <span class="card-role ${m.role === 'Team Lead' ? 'responsible' : 'member'}">${m.role}</span>
            </div>
            <div class="card-photo-wrap">
                ${renderPhoto(m, 'card-photo')}
            </div>
            <div class="card-content">
                <h3>${m.name}</h3>
                <div class="motivation-label">motivation</div>
                <p class="motivation">${capitalizeFirst(m.motivation)}</p>
                <div class="card-action">View profile <span aria-hidden="true">-&gt;</span></div>
            </div>
        </article>
    `).join('');
}

function capitalizeFirst(value) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function renderPhoto(member, className) {
    if (!member.photo) {
        return `<div class="photo-placeholder ${className}" role="img" aria-label="Foto ${member.name} belum tersedia">?</div>`;
    }

    return `<img class="${className}" src="${member.photo}" alt="${member.name}">`;
}

window.showDetail = async (id) => {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const member = data.find(m => Number(m.id) === Number(id));
        
        if (!member) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
        
        modal.innerHTML = `
            <div class="modal-content glass">
                <div class="modal-topbar">
                    <span class="modal-topbar-label ${member.role === 'Team Lead' ? 'responsible' : 'member'}">${member.role}</span>
                    <button class="modal-close close" type="button" aria-label="Tutup detail"></button>
                </div>
                <div class="modal-profile">
                    <div class="modal-photo-wrap">
                        ${renderPhoto(member, 'modal-photo')}
                    </div>
                    <div class="modal-copy">
                        <h2 class="modal-name">${member.name}</h2>
                        <p class="modal-about">${member.about}</p>
                    </div>
                </div>

                <div class="modal-section-heading">
                    <h3>Sertifikat</h3>
                    <span>${member.certificates.length} file</span>
                </div>
                <div class="certificates">
                    ${(member.certificates || []).map(c => `
                        <button class="cert-item" type="button" onclick="openLightbox('${c}')" aria-label="Buka sertifikat">
                            <img src="${c}" class="cert-thumb" alt="Sertifikat" onerror="this.src='https://via.placeholder.com/150?text=Sertifikat'">
                            <span>Open image <b aria-hidden="true">-&gt;</b></span>
                        </button>
                    `).join('')}
                </div>

                <div class="socials">
                    ${member.social.github !== '#' ? `<a href="${member.social.github}" target="_blank" rel="noopener noreferrer"><img class="social-icon" src="https://cdn.simpleicons.org/github" alt="">GitHub <span aria-hidden="true">-&gt;</span></a>` : ''}
                    ${member.social.linkedin !== '#' ? `<a href="${member.social.linkedin}" target="_blank" rel="noopener noreferrer"><span class="social-icon linkedin-logo" aria-hidden="true">in</span>LinkedIn <span aria-hidden="true">-&gt;</span></a>` : ''}
                    ${member.social.instagram !== '#' ? `<a href="${member.social.instagram}" target="_blank" rel="noopener noreferrer"><img class="social-icon" src="https://cdn.simpleicons.org/instagram" alt="">Instagram <span aria-hidden="true">-&gt;</span></a>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.close').onclick = () => modal.remove();
    } catch (error) {
        console.error("Error showing details:", error);
    }
};

window.openLightbox = (src) => {
    const lightbox = document.createElement('div');
    lightbox.className = 'modal-overlay';
    lightbox.style.zIndex = '2000';
    lightbox.onclick = () => lightbox.remove();
    lightbox.innerHTML = `<img src="${src}" style="max-width: 90%; max-height: 90%; border-radius: 10px; box-shadow: 0 0 30px rgba(0,0,0,0.5);">`;
    document.body.appendChild(lightbox);
};

document.addEventListener('DOMContentLoaded', init);