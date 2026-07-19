const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', async () => {
    const loginView = document.getElementById('login-view');
    const vaultView = document.getElementById('vault-view');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const vaultList = document.getElementById('vault-list');
    const searchInput = document.getElementById('search');
    const logoutBtn = document.getElementById('logout-btn');

    let vaults = [];

    // Check if already logged in
    chrome.storage.local.get(['token'], async (result) => {
        if (result.token) {
            showVault(result.token);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            
            if (res.ok) {
                chrome.storage.local.set({ token: data.token });
                showVault(data.token);
            } else {
                loginError.textContent = data.message || 'Login failed';
                loginError.classList.remove('hidden');
            }
        } catch (error) {
            loginError.textContent = 'Network error. Make sure server is running.';
            loginError.classList.remove('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        chrome.storage.local.remove(['token']);
        loginView.classList.remove('hidden');
        vaultView.classList.add('hidden');
        vaults = [];
        vaultList.innerHTML = '';
        loginForm.reset();
    });

    searchInput.addEventListener('input', (e) => {
        renderVaults(e.target.value);
    });

    async function showVault(token) {
        loginView.classList.add('hidden');
        vaultView.classList.remove('hidden');
        
        try {
            const res = await fetch(`${API_URL}/vault`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                vaults = await res.json();
                renderVaults();
            } else {
                // Token invalid
                logoutBtn.click();
            }
        } catch (error) {
            vaultList.innerHTML = '<p class="error">Failed to load vaults</p>';
        }
    }

    function renderVaults(query = '') {
        vaultList.innerHTML = '';
        const filtered = vaults.filter(v => 
            v.title.toLowerCase().includes(query.toLowerCase()) || 
            (v.username && v.username.toLowerCase().includes(query.toLowerCase()))
        );

        if (filtered.length === 0) {
            vaultList.innerHTML = '<p style="text-align:center; color:#6b7280; font-size:12px;">No passwords found</p>';
            return;
        }

        filtered.forEach(vault => {
            const div = document.createElement('div');
            div.className = 'vault-item';
            div.innerHTML = `
                <div class="vault-item-info">
                    <h4>${vault.title}</h4>
                    <p>${vault.username || vault.email || ''}</p>
                </div>
                <button class="copy-btn" data-id="${vault._id}">Copy</button>
            `;
            
            div.querySelector('.copy-btn').addEventListener('click', () => copyPassword(vault._id));
            vaultList.appendChild(div);
        });
    }

    async function copyPassword(id) {
        chrome.storage.local.get(['token'], async (result) => {
            if (result.token) {
                try {
                    const res = await fetch(`${API_URL}/vault/${id}`, {
                        headers: { 'Authorization': `Bearer ${result.token}` }
                    });
                    const data = await res.json();
                    if (res.ok && data.password) {
                        navigator.clipboard.writeText(data.password);
                        const btn = document.querySelector(`.copy-btn[data-id="${id}"]`);
                        if (btn) {
                            const original = btn.textContent;
                            btn.textContent = 'Copied!';
                            setTimeout(() => btn.textContent = original, 2000);
                        }
                    } else if (data.itemType !== 'login' && data.customData) {
                        // Quick support for copying secure notes or cards in extension
                         navigator.clipboard.writeText(data.customData.content || data.customData.cardNumber || data.customData.keyValue || data.customData.docNumber || '');
                    }
                } catch (error) {
                    console.error('Failed to fetch password', error);
                }
            }
        });
    }
});
