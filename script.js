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
    list.forEach((src) => {
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

function showToast(msg) {
    const notif = document.createElement('div');
    notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50';
    notif.innerHTML = '<i class="fas fa-check"></i> ' + escapeHtml(msg);
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2500);
}

function copyEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        showToast(contentCache?.toasts?.emailCopied || 'Email copied — paste & send');
    }).catch(() => {
        showToast('Could not copy — try selecting the email manually');
    });
}

function getTemplateSubjectAndBody() {
    const el = document.getElementById('template');
    const text = (el && el.innerText) ? el.innerText.trim() : '';
    const subjectMatch = text.match(/^Subject:\s*(.+?)(?:\n|$)/im);
    const subject = subjectMatch ? subjectMatch[1].trim() : 'Save Skyline Park';
    const bodyStart = text.indexOf('\n\n');
    const body = bodyStart >= 0 ? text.slice(bodyStart + 2).trim() : text;
    return { subject, body };
}

const TRUNCATE_NOTE = '\n\n[Template shortened for this link; use Copy for full text.]';
const MAX_BODY_RAW = 700;

function buildComposeUrls(subject, body) {
    let sub = subject || '';
    let b = body || '';
    if (b.length > MAX_BODY_RAW) b = b.slice(0, MAX_BODY_RAW) + TRUNCATE_NOTE;
    const subEnc = encodeURIComponent(sub);
    const bodyEnc = encodeURIComponent(b);
    return {
        gmail: 'https://mail.google.com/mail/?view=cm&fs=1&su=' + subEnc + '&body=' + bodyEnc,
        yahoo: 'https://compose.mail.yahoo.com/?subject=' + subEnc + '&body=' + bodyEnc,
        outlook: 'https://outlook.live.com/mail/0/deeplink/compose?subject=' + subEnc + '&body=' + bodyEnc,
        mailto: 'mailto:?subject=' + subEnc + '&body=' + bodyEnc
    };
}

function openCompose(provider) {
    const { subject, body } = getTemplateSubjectAndBody();
    const urls = buildComposeUrls(subject, body);
    const url = urls[provider];
    if (!url) return;
    if (provider === 'mailto') {
        const a = document.createElement('a');
        a.href = url;
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        window.open(url, '_blank', 'noopener,noreferrer');
    }
}

function copyTemplate() {
    const el = document.getElementById('template');
    const btn = document.getElementById('copy-template-btn');
    const text = el ? el.innerText : '';

    function resetBtn() {
        if (!btn) return;
        const label = btn.querySelector('span');
        const icon = btn.querySelector('i');
        if (label) label.textContent = label.dataset.orig || 'COPY FULL EMAIL';
        if (icon) icon.className = 'fas fa-copy';
        btn.disabled = false;
    }

    navigator.clipboard.writeText(text).then(() => {
        showToast(contentCache?.toasts?.templateCopied || 'Full template copied. Open your mail app and paste.');
        if (btn) {
            const label = btn.querySelector('span');
            const icon = btn.querySelector('i');
            if (label) { label.dataset.orig = label.dataset.orig || label.textContent; label.textContent = 'Copied!'; }
            if (icon) icon.className = 'fas fa-check';
            btn.disabled = true;
            setTimeout(resetBtn, 2000);
        }
    }).catch(() => {
        showToast('Could not copy — try selecting the text manually');
        resetBtn();
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
        navigator.share({ title, text, url }).catch(() => {
            copyLinkFallback(url);
        });
    } else {
        copyLinkFallback(url);
    }
}

function copyLinkFallback(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast(contentCache?.toasts?.linkCopied || 'Link copied — paste to share');
    }).catch(() => {
        showToast('Could not copy link');
    });
}

function initShareButtons() {
    document.querySelectorAll('#nav-share-btn, #action-share-btn').forEach(btn => {
        if (btn) btn.addEventListener('click', sharePage);
    });
}

function initFooterShareLinks() {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(getShareText());
    const xLink = document.getElementById('footer-share-x');
    const fbLink = document.getElementById('footer-share-facebook');
    if (xLink) xLink.href = 'https://twitter.com/intent/tweet?url=' + url + '&text=' + text;
    if (fbLink) fbLink.href = 'https://www.facebook.com/sharer/sharer.php?u=' + url;

    const forwardLink = document.getElementById('forward-neighbor-link');
    if (forwardLink) {
        forwardLink.href = 'mailto:?subject=' + encodeURIComponent('Please read this about Skyline Park') + '&body=' + encodeURIComponent(getShareUrl());
    }
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

function initDistrictFinder() {
    var container = document.getElementById('district-finder');
    var input = document.getElementById('district-address');
    var submitBtn = document.getElementById('district-submit');
    var resultEl = document.getElementById('district-result');
    var errorEl = document.getElementById('district-error');
    if (!container || !input || !submitBtn) return;

    var GEOCODE_URL = 'https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
    var DISTRICT_URL = 'https://gis.napacounty.gov/arcgis/rest/services/Hosted/Supervisor_Districts/FeatureServer/0/query';

    var supervisors = {
        '1': { name: 'Joelle Gallagher', phone: '(707) 253-4828', tel: '+17072534828', email: 'joelle.gallagher@countyofnapa.org' },
        '2': { name: 'Liz Alessio', phone: '(707) 259-8276', tel: '+17072598276', email: 'liz.alessio@countyofnapa.org' },
        '3': { name: 'Anne Cottrell', phone: '(707) 253-4827', tel: '+17072534827', email: 'anne.cottrell@countyofnapa.org' },
        '4': { name: 'Amber Manfree', phone: '(707) 259-8278', tel: '+17072598278', email: 'amber.manfree@countyofnapa.org' },
        '5': { name: 'Belia Ramos', phone: '(707) 259-8277', tel: '+17072598277', email: 'belia.ramos@countyofnapa.org' }
    };

    function setLoading(on) {
        submitBtn.disabled = on;
        submitBtn.innerHTML = on
            ? '<i class="fas fa-spinner fa-spin"></i> Looking up…'
            : '<i class="fas fa-search"></i> Find My Supervisor';
    }

    function showError(msg) {
        resultEl.classList.add('hidden');
        errorEl.textContent = msg;
        errorEl.classList.remove('hidden');
    }

    function buildSupervisorMailto(sup) {
        var tmpl = getTemplateSubjectAndBody();
        var subject = tmpl.subject;
        var body = tmpl.body.replace('[Media Contact / Supervisor]', 'Supervisor ' + sup.name);
        return 'mailto:' + encodeURIComponent(sup.email) +
            '?subject=' + encodeURIComponent(subject) +
            '&body=' + encodeURIComponent(body);
    }

    function showResult(district, matchAddr) {
        errorEl.classList.add('hidden');
        var sup = supervisors[district] || { name: 'Supervisor', phone: '(707) 253-4580', tel: '+17072534580', email: '' };
        var mailtoHref = sup.email ? buildSupervisorMailto(sup) : '';
        resultEl.innerHTML =
            '<div class="bg-emerald-900/40 border border-emerald-700 rounded-xl p-4">' +
                '<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">' +
                    '<div>' +
                        '<div class="text-emerald-400 text-xs font-mono mb-1">YOUR SUPERVISOR</div>' +
                        '<div class="text-white text-lg font-bold">' + escapeHtml(sup.name) + '</div>' +
                        '<div class="text-stone-400 text-sm">District ' + escapeHtml(district) + '</div>' +
                        (matchAddr ? '<div class="text-stone-500 text-xs mt-1">' + escapeHtml(matchAddr) + '</div>' : '') +
                    '</div>' +
                    '<div class="flex flex-col sm:flex-row gap-2">' +
                        (mailtoHref
                            ? '<a href="' + mailtoHref + '" class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold text-sm transition min-h-[44px]">' +
                                '<i class="fas fa-envelope"></i> Email Supervisor' +
                              '</a>'
                            : '') +
                        '<a href="tel:' + sup.tel + '" class="inline-flex items-center justify-center gap-2 bg-stone-700 hover:bg-stone-600 text-white px-5 py-3 rounded-xl font-semibold text-sm transition min-h-[44px]">' +
                            '<i class="fas fa-phone"></i> Call ' + escapeHtml(sup.phone) +
                        '</a>' +
                    '</div>' +
                '</div>' +
            '</div>';
        resultEl.classList.remove('hidden');

        document.querySelectorAll('#supervisor-list [data-district]').forEach(function(el) {
            if (el.dataset.district === district) {
                el.classList.add('ring-1', 'ring-emerald-500');
            } else {
                el.classList.remove('ring-1', 'ring-emerald-500');
            }
        });
    }

    function doLookup() {
        var addr = input.value.trim();
        if (!addr) return;
        if (!/napa/i.test(addr)) addr += ', Napa, CA';
        setLoading(true);
        errorEl.classList.add('hidden');
        resultEl.classList.add('hidden');

        fetch(GEOCODE_URL + '?SingleLine=' + encodeURIComponent(addr) + '&outFields=Match_addr&maxLocations=1&f=json')
            .then(function(r) { return r.json(); })
            .then(function(data) {
                var c = data.candidates && data.candidates[0];
                if (!c || c.score < 70) throw new Error('not_found');
                var lng = c.location.x;
                var lat = c.location.y;
                var matchAddr = c.attributes && c.attributes.Match_addr;
                return fetch(DISTRICT_URL + '?geometry=' + lng + ',' + lat +
                    '&geometryType=esriGeometryPoint&inSR=4326' +
                    '&spatialRel=esriSpatialRelIntersects' +
                    '&outFields=sup_district,supervisor&returnGeometry=false&f=json')
                    .then(function(r) { return r.json(); })
                    .then(function(distData) {
                        var feat = distData.features && distData.features[0];
                        if (!feat) throw new Error('no_district');
                        showResult(feat.attributes.sup_district, matchAddr);
                    });
            })
            .catch(function(err) {
                if (err.message === 'not_found') {
                    showError('Address not found. Try including your street number and "Napa" (e.g. "1234 Main St, Napa").');
                } else if (err.message === 'no_district') {
                    showError('That address doesn\'t appear to be in a Napa County supervisor district. Try a different address.');
                } else {
                    showError('Lookup failed — check your connection and try again, or call the Clerk at (707) 253-4580.');
                }
            })
            .finally(function() { setLoading(false); });
    }

    submitBtn.addEventListener('click', doLookup);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { e.preventDefault(); doLookup(); }
    });
}

function initMobileMenu() {
    const btn = document.getElementById('nav-menu-btn');
    const menu = document.getElementById('nav-menu');
    const icon = btn ? btn.querySelector('i') : null;
    if (!btn || !menu) return;
    function setMenuOpen(open) {
        if (open) {
            menu.classList.add('is-open');
        } else {
            menu.classList.remove('is-open');
        }
        menu.setAttribute('aria-hidden', !open);
        btn.setAttribute('aria-expanded', open);
        btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (icon) icon.className = open ? 'fas fa-times text-xl' : 'fas fa-bars text-xl';
    }
    btn.addEventListener('click', () => {
        setMenuOpen(!menu.classList.contains('is-open'));
    });
    menu.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => setMenuOpen(false));
    });
}

function initSectionReveal() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        document.querySelectorAll('.section-reveal').forEach(el => el.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.05 });
    document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
}

function initBackToTop() {
    const link = document.getElementById('back-to-top');
    if (!link) return;
    const hero = document.querySelector('header#main');
    const heroBottom = hero ? hero.offsetTop + hero.offsetHeight : 600;
    function update() {
        if (window.scrollY > heroBottom * 0.8) link.classList.add('is-visible');
        else link.classList.remove('is-visible');
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
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
    initFooterShareLinks();
    initAudioPlayer();
    initMobileMenu();
    initSectionReveal();
    initBackToTop();
    initDistrictFinder();
};
