// script.js
function populateContacts() {
    const emails = [
        {name: "Napa Valley Register", email: "jennifer.huffman@napanews.com"},
        {name: "KQED Assignment", email: "assignmentdesk@kqed.org"},
        {name: "California Globe", email: "katy@californiaglobe.com"},
        {name: "California Globe", email: "evan@californiaglobe.com"},
        {name: "News Netter", email: "newsnetter3@gmail.com"},
        {name: "KPIX CBS", email: "kpixnewsassign.editors@cbs.com"},
        {name: "KGO 7 On Your Side", email: "7onYourSide@kgo-tv.com"},
        {name: "FOX News Tips", email: "newstips@fox.com"},
        {name: "KRON 4", email: "BreakingNews@kron4.com"},
        {name: "KCRA", email: "news@kcra.com"}
    ];

    const container = document.getElementById('contacts');
    emails.forEach(item => {
        const div = document.createElement('div');
        div.className = 'bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-emerald-600 rounded-2xl p-5 transition cursor-pointer group';
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <div class="font-semibold text-emerald-300">${item.name}</div>
                    <div class="text-xs text-stone-400 font-mono">${item.email}</div>
                </div>
                <button onclick="copyEmail('${item.email}'); event.stopImmediatePropagation();" 
                        class="bg-emerald-900 hover:bg-emerald-700 text-emerald-100 px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition">
                    <i class="fas fa-copy"></i> COPY
                </button>
            </div>
        `;
        div.onclick = () => copyEmail(item.email);
        container.appendChild(div);
    });
}

function copyEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50';
        notif.innerHTML = `<i class="fas fa-check"></i> Email copied — paste & send`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2500);
    });
}

function copyTemplate() {
    const text = document.getElementById('template').innerText;
    navigator.clipboard.writeText(text).then(() => {
        const notif = document.createElement('div');
        notif.className = 'fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-3 z-50 font-medium';
        notif.innerHTML = `✅ Full template copied. Open your mail app and paste.`;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    });
}

// Tailwind script already in HTML
window.onload = () => {
    populateContacts();
    
    // Mobile menu could go here if expanded later
    console.log('%cSave Skyline Park site loaded. Fuck the housing grab.', 'color:#10b981; font-family:monospace');
};