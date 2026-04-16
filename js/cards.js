const cardsGrid = document.querySelector('.activities-grid');
const API_BASE_URL =
    window.CUET_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000/api`;
const escapeHtml = (value) =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

if (cardsGrid) {
    fetch(`${API_BASE_URL}/cards`)
        .then((response) => response.json())
        .then((cards) => {
            if (!Array.isArray(cards) || cards.length === 0) {
                return;
            }

            cardsGrid.innerHTML = '';
            cards.forEach((card) => {
                const cardEl = document.createElement('div');
                cardEl.className = 'activity-card';
                const features = Array.isArray(card.features) ? card.features : [];
                cardEl.innerHTML = `
                    <div class="card-icon">${escapeHtml(card.icon || '💻')}</div>
                    <h3 class="card-title">${escapeHtml(card.title)}</h3>
                    <p class="card-description">${escapeHtml(card.description)}</p>
                    <ul class="card-features">
                        ${features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join('')}
                    </ul>
                `;
                cardsGrid.appendChild(cardEl);
            });
        })
        .catch((error) => {
            console.error('Card API unavailable, showing fallback cards.', error);
        });
}
