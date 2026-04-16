const API_BASE_URL =
    window.CUET_API_BASE_URL ||
    `${window.location.protocol}//${window.location.hostname}:5000/api`;
const ADMIN_TOKEN_KEY = 'adminToken';
const escapeHtml = (value) =>
    String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const getToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);
const setToken = (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

const loginForm = document.getElementById('adminLoginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;

        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setToken(data.token);
            window.location.href = 'admin-dashboard.html';
        } catch (error) {
            alert(error.message);
        }
    });
}

const dashboard = document.getElementById('adminDashboard');
if (dashboard) {
    const cardsById = new Map();
    const adminInfo = document.getElementById('adminInfo');
    const cardForm = document.getElementById('cardForm');
    const cardsTableBody = document.getElementById('cardsTableBody');
    const logoutButton = document.getElementById('logoutButton');
    const submitButton = document.getElementById('submitButton');
    const cardIdInput = document.getElementById('cardId');

    const authHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
    });

    const redirectToLogin = () => {
        clearToken();
        window.location.href = 'admin-login.html';
    };

    const verifyAdmin = async () => {
        const token = getToken();
        if (!token) {
            redirectToLogin();
            return false;
        }

        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            redirectToLogin();
            return false;
        }

        const data = await response.json();
        adminInfo.textContent = `Logged in as: ${data.admin.name} (${data.admin.email})`;
        return true;
    };

    const renderCards = (cards) => {
        cardsTableBody.innerHTML = '';
        cardsById.clear();

        cards.forEach((card) => {
            cardsById.set(card._id, card);
            const row = document.createElement('tr');
            const safeFeatures = (card.features || []).map((feature) => escapeHtml(feature)).join(', ');
            row.innerHTML = `
                <td>${escapeHtml(card.icon || '💻')}</td>
                <td>${escapeHtml(card.title)}</td>
                <td>${escapeHtml(card.description)}</td>
                <td>${safeFeatures}</td>
                <td>
                    <button type="button" data-action="edit" data-id="${card._id}">Edit</button>
                    <button type="button" data-action="delete" data-id="${card._id}">Delete</button>
                </td>
            `;
            cardsTableBody.appendChild(row);
        });
    };

    const loadCards = async () => {
        const response = await fetch(`${API_BASE_URL}/cards`);
        const cards = await response.json();
        renderCards(cards);
    };

    cardsTableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button');
        if (!button) {
            return;
        }

        const cardId = button.dataset.id;
        const action = button.dataset.action;

        if (action === 'delete') {
            if (!confirm('Delete this card?')) {
                return;
            }

            const response = await fetch(`${API_BASE_URL}/cards/${cardId}`, {
                method: 'DELETE',
                headers: authHeaders(),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.message || 'Delete failed');
                return;
            }

            await loadCards();
            return;
        }

        if (action === 'edit') {
            const card = cardsById.get(cardId);
            if (!card) {
                alert('Unable to load card details for editing');
                return;
            }
            document.getElementById('icon').value = card.icon || '';
            document.getElementById('title').value = card.title || '';
            document.getElementById('description').value = card.description || '';
            document.getElementById('features').value = (card.features || []).join(', ');
            cardIdInput.value = cardId;
            submitButton.textContent = 'Update Card';
        }
    });

    cardForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            icon: document.getElementById('icon').value.trim(),
            title: document.getElementById('title').value.trim(),
            description: document.getElementById('description').value.trim(),
            features: document.getElementById('features').value.trim(),
        };

        const cardId = cardIdInput.value;
        const isUpdate = Boolean(cardId);

        const response = await fetch(
            isUpdate ? `${API_BASE_URL}/cards/${cardId}` : `${API_BASE_URL}/cards`,
            {
                method: isUpdate ? 'PUT' : 'POST',
                headers: authHeaders(),
                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();
        if (!response.ok) {
            alert(data.message || 'Request failed');
            return;
        }

        cardForm.reset();
        cardIdInput.value = '';
        submitButton.textContent = 'Add Card';
        await loadCards();
    });

    logoutButton.addEventListener('click', () => {
        clearToken();
        window.location.href = 'admin-login.html';
    });

    (async () => {
        const isValid = await verifyAdmin();
        if (isValid) {
            await loadCards();
        }
    })();
}
