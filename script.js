// script.js
let contentCache = null;

function getByPath(obj, path) {
    if (!path || path.startsWith('_')) return undefined;
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
}

function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function applyBold(str) {
    if (typeof str !== 'string') return '';
    const escaped = escapeHtml(str);
    return escaped.replace(/\*\*([^*]+)\*\*/g, (_, b) => '<strong>' + b + '</strong>');
}

function applyContent(content) {
    if (!content) return;
    contentCache = content;

    document.title = content.meta?.title || document.title;

    document.querySelectorAll('.supervisors-link').forEach(el => {
        if (content.meta?.supervisorsUrl) el.href = content.meta.supervisorsUrl;
    });

    document.querySelectorAll('[data-content]').forEach(el => {
        const path = el.getAttribute('data-content');
        const value = getByPath(content, path);
        if (value === undefined) return;

        const boldPath = el.getAttribute('data-content-bold');
        const boldValue = boldPath ? getByPath(content, boldPath) : null;

        if (el.tagName === 'IMG') {
            el.alt = value;
            return;
        }

        if (path === 'action.emailTemplate') {
            el.textContent = value;
            return;
        }

        if (path === 'threat.heading') {
            el.innerHTML = value.replace(/\n/g, '<br>');
            return;
        }

        if (path === 'threat.paragraph1') {
            el.innerHTML = applyBold(value);
            return;
        }

        if (path === 'park.closing' && boldValue !== undefined) {
            el.innerHTML = escapeHtml(value) + ' <span class="text-emerald-400 font-bold">' + escapeHtml(boldValue) + '</span>';
            return;
        }

        if (path === 'action.footerLinkText' && content.meta?.supervisorsUrl) {
            const urlAttr = content.meta.supervisorsUrl.replace(/"/g, '&quot;');
            const text = escapeHtml(value);
            el.innerHTML = text.replace('napacounty.gov', '<a href="' + urlAttr + '" target="_blank" class="underline hover:text-emerald-400">napacounty.gov</a>');
            return;
        }

        if (typeof value === 'string' && value.includes('**')) {
            el.innerHTML = applyBold(value);
            return;
        }

        el.textContent = value;
    });
}

function populateContacts(contacts) {
    const list = Array.isArray(contacts) ? contacts : [];
    const container = document.getElementById('contacts');
    if (!container) return;
    container.innerHTML = '';
    list.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-emerald-600 rounded-2xl p-5 transition cursor-pointer group';
        div.dataset.email = item.email || '';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-semibold text-emerald-300">${escapeHtml(item.name || '')}</div>
                    <div class="text-xs text-stone-400 font-mono">${escapeHtml(item.email || '')}</div>
                </div>
                <button type="button" class="copy-contact-email bg-emerald-900 hover:bg-emerald-700 text-emerald-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition">
                    <i class="fas fa-copy"></i> COPY
                </button>
            </div>
        `;
        div.onclick = (e) => { if (!e.target.closest('button')) copyEmail(div.dataset.email); };
        div.querySelector('.copy-contact-email').onclick = (e) => { e.stopPropagation(); copyEmail(div.dataset.email); };
        container.appendChild(div);
    });
}

function populateSources(sources) {
    const list = Array.isArray(sources) ? sources : [];
    const container = document.getElementById('sources-list');
    if (!container) return;
    container.innerHTML = '';
    list.forEach((src, i) => {
        const div = document.createElement('a');
        div.href = src.url || '#';
        div.target = '_blank';
        div.rel = 'noopener noreferrer';
        div.className = 'block bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-emerald-600 rounded-2xl p-5 transition group';
        div.innerHTML = `
            <div class="flex justify-between items-start gap-4">
                <div class="min-w-0">
                    <div class="font-semibold text-emerald-300 group-hover:text-emerald-200 transition">${escapeHtml(src.name || '')}</div>
                    <div class="text-sm text-stone-400 mt-1">${escapeHtml(src.description || '')}</div>
                </div>
                <div class="text-stone-500 group-hover:text-emerald-400 transition flex-shrink-0 mt-1">
                    <i class="fas fa-external-link-alt"></i>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function copyEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        const msg = contentCache?.toasts?.emailCopied || 'Email copied — paste & send';
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50';
        notif.innerHTML = `<i class="fas fa-check"></i> ${escapeHtml(msg)}`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    });
}

function copyTemplate() {
    const text = document.getElementById('template').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const msg = contentCache?.toasts?.templateCopied || 'Full template copied. Open your mail app and paste.';
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 font-medium';
        notif.innerHTML = `&#x2713; ${escapeHtml(msg)}`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    });
}

function getShareUrl() {
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical && canonical.href) return canonical.href;
    if (contentCache?.meta?.siteUrl) return contentCache.meta.siteUrl;
    return window.location.href;
}

function getShareText() {
    return contentCache?.meta?.shareText || 'Skyline Wilderness Park in Napa is under threat. Take action to save the park.';
}

function sharePage() {
    const url = getShareUrl();
    const title = document.title;
    const text = getShareText();

    if (navigator.share) {
        navigator.share({ title, text, url })
            .then(() => {})
            .catch(() => {
                copyLinkFallback(url);
            });
    } else {
        copyLinkFallback(url);
    }
}

function copyLinkFallback(url) {
    navigator.clipboard.writeText(url).then(() => {
        const msg = contentCache?.toasts?.linkCopied || 'Link copied — paste to share';
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50';
        notif.innerHTML = `<i class="fas fa-check"></i> ${escapeHtml(msg)}`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    });
}

function initShareButtons() {
    document.querySelectorAll('#nav-share-btn, #action-share-btn').forEach(btn => {
        if (btn) btn.addEventListener('click', sharePage);
    });
}

function initAudioPlayer() {
    const audio = document.getElementById('podcast-audio');
    const player = document.getElementById('audio-player');
    const prompt = document.getElementById('audio-prompt');
    const playBtn = document.getElementById('audio-play-btn');
    const icon = document.getElementById('audio-icon');
    const progressBar = document.getElementById('audio-progress-bar');
    const progress = document.getElementById('audio-progress');
    const currentEl = document.getElementById('audio-current');
    const durationEl = document.getElementById('audio-duration');
    const closeBtn = document.getElementById('audio-close-btn');

    if (!audio || !player || !prompt) return;

    function fmt(s) {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    prompt.addEventListener('click', () => {
        prompt.classList.add('hidden');
        player.classList.remove('translate-y-full');
        audio.play();
    });

    playBtn.addEventListener('click', () => {
        if (audio.paused) { audio.play(); } else { audio.pause(); }
    });

    audio.addEventListener('play', () => {
        icon.className = 'fas fa-pause text-sm';
    });
    audio.addEventListener('pause', () => {
        icon.className = 'fas fa-play text-sm';
    });

    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = fmt(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        if (!audio.duration) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        progress.style.width = pct + '%';
        currentEl.textContent = fmt(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
        icon.className = 'fas fa-play text-sm';
        progress.style.width = '0%';
        currentEl.textContent = '0:00';
    });

    progressBar.addEventListener('click', (e) => {
        if (!audio.duration) return;
        const rect = progressBar.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pct * audio.duration;
    });

    closeBtn.addEventListener('click', () => {
        audio.pause();
        player.classList.add('translate-y-full');
        prompt.classList.remove('hidden');
    });
}

window.onload = () => {
    fetch('content.json')
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(content => {
            applyContent(content);
            populateContacts(content.contacts);
            populateSources(content.sources);
        })
        .catch(() => {
            populateContacts([
                { name: "Napa Valley Register", email: "jennifer.huffman@napanews.com" },
                { name: "KQED Assignment", email: "assignmentdesk@kqed.org" },
                { name: "California Globe", email: "katy@californiaglobe.com" },
                { name: "California Globe", email: "evan@californiaglobe.com" },
                { name: "News Netter", email: "newsnetter3@gmail.com" },
                { name: "KPIX CBS", email: "kpixnewsassign.editors@cbs.com" },
                { name: "KGO 7 On Your Side", email: "7onYourSide@kgo-tv.com" },
                { name: "FOX News Tips", email: "newstips@fox.com" },
                { name: "KRON 4", email: "BreakingNews@kron4.com" },
                { name: "KCRA", email: "news@kcra.com" }
            ]);
        });
    initShareButtons();
    initAudioPlayer();
};
