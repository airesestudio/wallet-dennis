/* ==========================================================================
   WEALTHFLOW - APPLICATION SCRIPT (STITCH INTEGRATED SPA LOGIC)
   ========================================================================== */

// --- Firebase Configuration ---
const firebaseConfig = {
  projectId: "wallet-dennis",
  appId: "1:518161630515:web:9b0f37bfdd673216892a46",
  storageBucket: "wallet-dennis.firebasestorage.app",
  apiKey: "AIzaSyB_YnhZQ6ktvJdUxi_yBZBaDJzF5t7Te50",
  authDomain: "wallet.kofmanstudio.com",
  messagingSenderId: "518161630515",
  projectNumber: "518161630515"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Handle Google redirect result on page load
auth.getRedirectResult().catch((err) => {
    if (err && err.code !== 'auth/no-auth-event') {
        console.error('Google redirect error:', err);
    }
});

// --- Default Template State (Para Pruebas en Local) ---
const DEFAULT_STATE_DEMO = {
    isLoggedIn: false,
    themePalette: "indigo",
    user: {
        name: "Dennis A.",
        alias: "dennis.wallet",
        gender: "male",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIrxuohm3YM2dqkuFLPFnTyA7x9qCZHDOq8qCzBIn5-hzEjPCh1GMqnqyBxo6y0SZ-VpoE0Hvr_H1Ieg2fxc0dUuK8IlIR2CmJwmm9t5Xkom-g3463FT3F1vQrMfk-f71YlP_tRpLunQaulJqlzyxYBr9_J3Ipy8ekKI0qkN5_hjMHd8wsAlgqQTJrmn6SoJDDKjdzT2wyz-K9rE0ZFNVil5ij4DV2kBBQkTKtQ-cvKzDnuIwzLkt7iLmuIYZoKwxpMqFxfow9C5V3"
    },
    wallets: {
        Galicia: 2850400.42,
        MercadoPago: 1240500.00,
        PayPal: 450.00, // USD
        Prex: 1500.00
    },
    exchangeRate: 1000,
    transactions: [
        { id: 1, type: 'outgoing', title: 'Coto Supermercados', amount: 45200.00, wallet: 'MercadoPago', date: 'Hoy • 14:20', category: 'Alimentación' },
        { id: 2, type: 'incoming', title: 'Transferencia Recibida', amount: 120000.00, wallet: 'Banco Galicia', date: 'Ayer • 09:15', category: 'Ingreso' },
        { id: 3, type: 'outgoing', title: 'Adobe Subscription', amount: 20.99, wallet: 'PayPal', date: '22 May', category: 'Servicios', isUSD: true },
        { id: 4, type: 'outgoing', title: 'Kentucky Pizza', amount: 8400.00, wallet: 'MercadoPago', date: '21 May', category: 'Alimentación' },
        { id: 5, type: 'outgoing', title: 'Supermercado Jumbo', amount: 12450.00, wallet: 'Banco Galicia', date: 'Hace 2 horas', category: 'Alimentación' },
        { id: 6, type: 'outgoing', title: 'Netflix Streaming', amount: 4800.00, wallet: 'MercadoPago', date: 'Ayer • 18:42', category: 'Servicios' },
        { id: 7, type: 'outgoing', title: 'Combustible Shell', amount: 25000.00, wallet: 'Banco Galicia', date: '24 May • 10:15', category: 'Ocio' }
    ],
    bills: [
        { id: 'bill-1', name: 'Alquiler Depto', amount: 120000.00, date: 'VENCE EN 2 DÍAS', category: 'Alquiler', status: 'overdue' },
        { id: 'bill-2', name: 'Servicio Internet (Fibertel)', amount: 6800.00, date: 'Vence hoy', category: 'Servicios', status: 'overdue' },
        { id: 'bill-3', name: 'Tarjeta Visa Gold', amount: 145300.00, date: 'Vence en 4 días', category: 'Tarjetas', status: 'upcoming' },
        { id: 'bill-4', name: 'Osde 310 - Salud', amount: 42500.00, date: 'Vence en 6 días', category: 'Servicios', status: 'upcoming' },
        { id: 'bill-5', name: 'Patente Automotor', amount: 18900.00, date: 'Vence en 10 días', category: 'Impuestos', status: 'upcoming' }
    ],
    loans: [
        { id: 'loan-1', type: 'receivable', name: 'Juan Pérez', amount: 15000.00, desc: 'Vence en 2 días', status: 'PENDIENTE' },
        { id: 'loan-2', type: 'payable', name: 'María García', amount: 8200.00, desc: 'Vence en 5 días', status: 'PARCIAL' }
    ],
    savingsGoals: [
        { id: 1, title: 'Reserva de Emergencia', current: 15300, target: 18000, color: 'bg-secondary' },
        { id: 2, title: 'Viaje a Bariloche', current: 4200, target: 10000, color: 'bg-primary' }
    ],
    webhookUrl: 'https://dennis.wallet.com/webhooks',
    theme: 'light',
    monthlyBudget: 0
};

// --- Clean Template State (Para Producción en Limpio / Reseteado) ---
const DEFAULT_STATE_PRODUCTION = {
    isLoggedIn: false,
    themePalette: "indigo",
    user: {
        name: "Usuario",
        alias: "usuario.wallet",
        gender: "male",
        avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIrxuohm3YM2dqkuFLPFnTyA7x9qCZHDOq8qCzBIn5-hzEjPCh1GMqnqyBxo6y0SZ-VpoE0Hvr_H1Ieg2fxc0dUuK8IlIR2CmJwmm9t5Xkom-g3463FT3F1vQrMfk-f71YlP_tRpLunQaulJqlzyxYBr9_J3Ipy8ekKI0qkN5_hjMHd8wsAlgqQTJrmn6SoJDDKjdzT2wyz-K9rE0ZFNVil5ij4DV2kBBQkTKtQ-cvKzDnuIwzLkt7iLmuIYZoKwxpMqFxfow9C5V3"
    },
    wallets: {
        Galicia: 0.00,
        MercadoPago: 0.00,
        PayPal: 0.00,
        Prex: 0.00
    },
    exchangeRate: 1000,
    transactions: [],
    bills: [],
    loans: [],
    savingsGoals: [],
    webhookUrl: '',
    theme: 'light',
    monthlyBudget: 0
};

function getInitialTemplateState() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
    return JSON.parse(JSON.stringify(isLocal ? DEFAULT_STATE_DEMO : DEFAULT_STATE_PRODUCTION));
}

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial State ---
    let state = getInitialTemplateState();

    // --- Firebase Integration ---
    async function loadState(uid) {
        try {
            const doc = await db.collection("users").doc(uid).get();
            const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBIrxuohm3YM2dqkuFLPFnTyA7x9qCZHDOq8qCzBIn5-hzEjPCh1GMqnqyBxo6y0SZ-VpoE0Hvr_H1Ieg2fxc0dUuK8IlIR2CmJwmm9t5Xkom-g3463FT3F1vQrMfk-f71YlP_tRpLunQaulJqlzyxYBr9_J3Ipy8ekKI0qkN5_hjMHd8wsAlgqQTJrmn6SoJDDKjdzT2wyz-K9rE0ZFNVil5ij4DV2kBBQkTKtQ-cvKzDnuIwzLkt7iLmuIYZoKwxpMqFxfow9C5V3";
            if (doc.exists) {
                state = doc.data();
                if (!state.themePalette) state.themePalette = 'indigo';
                if (!state.user) state.user = {};
                if (!state.user.email && auth.currentUser) {
                    state.user.email = auth.currentUser.email;
                }
                if (!state.user.gender) state.user.gender = 'male';
                if (!state.user.avatarUrl) {
                    state.user.avatarUrl = defaultAvatar;
                }

                // Limpieza automática si un usuario antiguo como contacto.dennis@gmail.com o en Producción tiene transacciones demo viejas precargadas en su documento de Firestore:
                const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
                const hasDemoTx = (state.transactions || []).some(tx => tx.id === 1 && tx.title === 'Coto Supermercados');
                const userEmail = auth.currentUser ? auth.currentUser.email : state.user.email;
                
                if ((!isLocal && hasDemoTx) || (userEmail === 'contacto.dennis@gmail.com' && hasDemoTx)) {
                    console.log('Limpiando datos ficticios antiguos de la nube...');
                    state = getInitialTemplateState();
                    state.isLoggedIn = true;
                    state.user.name = auth.currentUser ? (auth.currentUser.displayName || "Dennis A.") : "Dennis A.";
                    state.user.alias = "dennis.wallet";
                    state.user.email = userEmail || "contacto.dennis@gmail.com";
                    state.user.role = 'admin';
                    state.user.avatarUrl = defaultAvatar;
                    await db.collection("users").doc(uid).set(state);
                }
            } else {
                // Initialize new user with appropriate environment template state
                state = getInitialTemplateState();
                state.isLoggedIn = true;
                state.user.name = auth.currentUser.displayName || "Usuario Nuevo";
                state.user.alias = auth.currentUser.email ? auth.currentUser.email.split('@')[0] + ".wallet" : "usuario.wallet";
                state.user.email = auth.currentUser.email || "";
                state.user.gender = detectGender(state.user.name);
                state.user.avatarUrl = defaultAvatar;
                await db.collection("users").doc(uid).set(state);
            }
        } catch (e) {
            console.error("Error reading Firestore:", e);
        }
    }

    async function saveState() {
        const user = auth.currentUser;
        if (user) {
            try {
                await db.collection("users").doc(user.uid).set(state);
            } catch (e) {
                console.error("Error writing to Firestore:", e);
                showToast("Error al guardar en la nube", "error");
            }
        }
    }

    // --- Currency Formatter ---
    function formatMoney(amount, isUSD = false) {
        return (isUSD ? 'u$s ' : '$ ') + amount.toLocaleString('es-AR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // --- Dynamic Render Functions ---

    // 1. Render Wallet Balances & Consolidated Total
    function renderBalances() {
        // Calculate consolidated total in ARS
        const totalARS = state.wallets.Galicia + state.wallets.MercadoPago + state.wallets.Prex;
        // Total including PayPal converted to ARS
        const totalCombined = totalARS + (state.wallets.PayPal * state.exchangeRate);

        // Update Consolidated balance labels
        document.getElementById('dash-total-balance').textContent = formatMoney(totalCombined);
        document.getElementById('acc-total-balance').textContent = formatMoney(totalCombined);

        // Update individual wallet displays
        document.getElementById('dash-galicia-balance').textContent = formatMoney(state.wallets.Galicia);
        document.getElementById('dash-mp-balance').textContent = formatMoney(state.wallets.MercadoPago);

        document.getElementById('acc-galicia-balance').textContent = formatMoney(state.wallets.Galicia);
        document.getElementById('acc-mp-balance').textContent = formatMoney(state.wallets.MercadoPago);
        document.getElementById('acc-paypal-balance').textContent = formatMoney(state.wallets.PayPal, true);
        document.getElementById('acc-prex-balance').textContent = formatMoney(state.wallets.Prex);

        // Check low balance warnings
        const prexStatus = document.getElementById('acc-prex-status');
        if (state.wallets.Prex < 5000) {
            prexStatus.textContent = 'Saldo Bajo';
            prexStatus.className = 'px-xs py-base bg-error-container text-on-error-container rounded-full font-label-md text-label-md';
        } else {
            prexStatus.textContent = 'Activa';
            prexStatus.className = 'px-xs py-base bg-secondary-container/20 text-on-secondary-container rounded-full font-label-md text-label-md';
        }

        const mpStatus = document.getElementById('acc-mp-status');
        if (state.wallets.MercadoPago < 5000) {
            mpStatus.textContent = 'Saldo Bajo';
            mpStatus.className = 'px-xs py-base bg-error-container text-on-error-container rounded-full font-label-md text-label-md';
        } else {
            mpStatus.textContent = 'Activa';
            mpStatus.className = 'px-xs py-base bg-secondary-container/20 text-on-secondary-container rounded-full font-label-md text-label-md';
        }

        // Cálculo dinámico de Ingresos Mensuales y Gastos Estimados según transacciones y estado reseteado:
        let monthlyIncome = 0;
        let monthlyExpenses = 0;
        (state.transactions || []).forEach(tx => {
            const amount = tx.isUSD ? tx.amount * state.exchangeRate : tx.amount;
            if (tx.type === 'incoming') monthlyIncome += amount;
            else if (tx.type === 'outgoing') monthlyExpenses += amount;
        });
        const incomeEl = document.getElementById('dash-monthly-income');
        const expEl = document.getElementById('dash-monthly-expenses');
        if (incomeEl) incomeEl.textContent = formatMoney(monthlyIncome);
        if (expEl) expEl.textContent = formatMoney(monthlyExpenses);

        renderSavingsGoals();
    }

    function renderSavingsGoals() {
        const container = document.getElementById('dash-savings-goals-list');
        if (!container) return;
        container.innerHTML = '';
        const goals = state.savingsGoals || [];
        if (goals.length === 0) {
            container.innerHTML = `<p class="text-xs text-on-surface-variant text-center py-4 italic">No hay objetivos activos. Tu cuenta está en $0,00.</p>`;
            return;
        }
        goals.forEach(goal => {
            const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
            container.innerHTML += `
                <div>
                    <div class="flex justify-between font-label-md mb-xs">
                        <span class="text-on-surface font-bold">${goal.title}</span>
                        <span class="text-on-surface-variant">${pct}% — ${formatMoney(goal.current)} / ${formatMoney(goal.target)}</span>
                    </div>
                    <div class="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div class="h-full ${goal.color || 'bg-primary'} w-[${pct}%] transition-all duration-1000" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        });
    }

    // 2. Render Transactions
    function renderTransactions() {
        const dashContainer = document.getElementById('dash-recent-transactions');
        const accContainer = document.getElementById('acc-transactions-list');

        dashContainer.innerHTML = '';
        accContainer.innerHTML = '';

        if (state.transactions.length === 0) {
            const emptyState = `<p class="p-md text-center text-on-surface-variant font-body-sm">No hay transacciones registradas.</p>`;
            dashContainer.innerHTML = emptyState;
            accContainer.innerHTML = emptyState;
            return;
        }

        // Render Dashboard (limit to first 3)
        state.transactions.slice(0, 3).forEach(tx => {
            const isIncoming = tx.type === 'incoming';
            const icon = tx.category === 'Alimentación' ? 'shopping_cart' : (tx.category === 'Servicios' ? 'receipt' : (tx.category === 'Ocio' ? 'directions_car' : 'work'));
            const colorClass = isIncoming ? 'text-secondary bg-secondary-container/10' : 'text-primary bg-surface-container';

            const item = document.createElement('div');
            item.className = 'p-md flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group';
            item.innerHTML = `
                <div class="flex items-center gap-md">
                    <div class="w-10 h-10 rounded-full ${colorClass} flex items-center justify-center relative overflow-hidden">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <p class="font-body-md text-on-surface font-bold">${tx.title}</p>
                        <div class="flex items-center gap-xs">
                            <p class="font-body-sm text-on-surface-variant">${tx.date}</p>
                            <span class="w-1 h-1 rounded-full bg-outline"></span>
                            <p class="font-body-sm text-on-surface-variant">${tx.wallet}</p>
                        </div>
                    </div>
                </div>
                <p class="font-tabular-nums ${isIncoming ? 'text-secondary' : 'text-tertiary-container'} font-bold">
                    ${isIncoming ? '+' : '-'}${formatMoney(tx.amount, tx.isUSD)}
                </p>
            `;
            dashContainer.appendChild(item);
        });

        // Render Accounts tab (all transactions)
        state.transactions.forEach(tx => {
            const isIncoming = tx.type === 'incoming';
            const icon = tx.category === 'Alimentación' ? 'shopping_bag' : (tx.category === 'Servicios' ? 'cloud_done' : (tx.category === 'Ocio' ? 'restaurant' : 'payments'));
            const colorClass = isIncoming ? 'text-secondary bg-secondary-container/10' : 'text-primary bg-surface-container-high';

            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-sm hover:bg-surface-container-low rounded-lg transition-colors group';
            item.innerHTML = `
                <div class="flex items-center gap-md">
                    <div class="w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center group-hover:bg-white transition-colors">
                        <span class="material-symbols-outlined">${icon}</span>
                    </div>
                    <div>
                        <p class="font-body-md text-body-md font-bold text-on-surface">${tx.title}</p>
                        <p class="font-body-sm text-body-sm text-on-surface-variant">${tx.date} • ${tx.wallet}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-body-md text-body-md font-bold ${isIncoming ? 'text-secondary' : 'text-error'} font-tabular-nums">
                        ${isIncoming ? '+' : '-'}${formatMoney(tx.amount, tx.isUSD)}
                    </p>
                    <p class="font-label-md text-label-md text-outline uppercase tracking-wider">${tx.category}</p>
                </div>
            `;
            accContainer.appendChild(item);
        });
    }

    // 2.b. Render Module Transactions (Pestaña Movimientos: Gastos, Pagos, Fondos)
    let currentTxFilter = 'all';
    function renderModuleTransactions(filter = currentTxFilter) {
        currentTxFilter = filter;
        const container = document.getElementById('module-tx-list');
        if (!container) return;
        container.innerHTML = '';

        document.querySelectorAll('.tx-filter-btn').forEach(btn => {
            if (btn.getAttribute('data-filter') === filter) {
                btn.className = 'tx-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-primary shadow-sm transition-all';
            } else {
                btn.className = 'tx-filter-btn px-3 py-1.5 rounded-lg text-xs font-bold text-on-surface-variant hover:text-on-surface transition-all';
            }
        });

        let totalIn = 0;
        let totalOut = 0;
        state.transactions.forEach(tx => {
            if (tx.type === 'incoming') totalIn += tx.amount;
            else totalOut += tx.amount;
        });
        const statInEl = document.getElementById('tx-stat-in');
        const statOutEl = document.getElementById('tx-stat-out');
        const statNetEl = document.getElementById('tx-stat-net');
        if (statInEl) statInEl.textContent = formatMoney(totalIn);
        if (statOutEl) statOutEl.textContent = formatMoney(totalOut);
        if (statNetEl) {
            const net = totalIn - totalOut;
            statNetEl.textContent = formatMoney(net);
            statNetEl.className = `font-bold font-tabular-nums ${net >= 0 ? 'text-secondary' : 'text-error'}`;
        }

        const filtered = state.transactions.filter(tx => {
            if (filter === 'all') return true;
            return tx.type === filter;
        });

        if (filtered.length === 0) {
            container.innerHTML = `<div class="p-lg bg-surface-container-low rounded-xl text-center text-on-surface-variant text-sm">No hay movimientos en esta categoría.</div>`;
        } else {
            filtered.forEach(tx => {
                const isIncoming = tx.type === 'incoming';
                const icon = tx.category === 'Alimentación' ? 'shopping_bag' : (tx.category === 'Servicios' ? 'cloud_done' : (tx.category === 'Ocio' ? 'restaurant' : 'payments'));
                const colorClass = isIncoming ? 'text-secondary bg-secondary-container/10' : 'text-primary bg-surface-container-high';

                const item = document.createElement('div');
                item.className = 'flex items-center justify-between p-md bg-white hover:bg-surface-container-low rounded-xl border border-outline-variant/30 transition-all shadow-sm';
                item.innerHTML = `
                    <div class="flex items-center gap-md">
                        <div class="w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center">
                            <span class="material-symbols-outlined">${icon}</span>
                        </div>
                        <div>
                            <p class="font-bold text-on-surface text-sm">${tx.title}</p>
                            <p class="text-xs text-on-surface-variant">${tx.date} • <span class="font-bold text-primary">${tx.wallet}</span></p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-bold text-sm ${isIncoming ? 'text-secondary' : 'text-error'} font-tabular-nums">
                            ${isIncoming ? '+' : '-'}${formatMoney(tx.amount, tx.isUSD)}
                        </p>
                        <span class="text-[10px] bg-surface-container px-2 py-0.5 rounded uppercase font-bold text-on-surface-variant">${tx.category}</span>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        document.querySelectorAll('.tx-filter-btn').forEach(btn => {
            btn.onclick = () => renderModuleTransactions(btn.getAttribute('data-filter'));
        });
    }

    // 3. Render Bills & Obligations
    function renderBills(filterCategory = 'all') {
        const dashBills = document.getElementById('dash-upcoming-bills');
        const payTodayList = document.getElementById('pay-today-list');
        const listOverdue = document.getElementById('list-overdue');
        const listUpcoming = document.getElementById('list-upcoming');

        if (!dashBills || !payTodayList || !listOverdue || !listUpcoming) return;

        dashBills.innerHTML = '';
        payTodayList.innerHTML = '';
        listOverdue.innerHTML = '';
        listUpcoming.innerHTML = '';

        let filteredBills = state.bills || [];

        if (filterCategory === 'loan') {
            filteredBills = filteredBills.filter(b => b.category === 'loan' || b.category === 'Préstamos' || /préstamo|cuota|crédito|banco|galicia|mp/i.test(b.name));
        } else if (filterCategory === 'service') {
            filteredBills = filteredBills.filter(b => b.category === 'service' || b.category === 'Servicios' || !/préstamo|cuota|crédito/i.test(b.name));
        }

        const overdue = filteredBills.filter(b => b.status === 'overdue');
        const upcoming = filteredBills.filter(b => b.status === 'upcoming');

        // Update counts
        document.getElementById('pay-today-count').textContent = String(overdue.length).padStart(2, '0');
        document.getElementById('count-overdue').textContent = overdue.length;
        document.getElementById('count-upcoming').textContent = upcoming.length;

        // Render Dashboard Upcoming Bills (limit to 2)
        state.bills.slice(0, 2).forEach(bill => {
            const isOverdue = bill.status === 'overdue';
            const item = document.createElement('div');
            item.className = `flex items-center justify-between p-sm rounded-lg ${isOverdue ? 'bg-error-container/20 border border-error/10' : 'bg-surface-container-low border border-outline-variant/30'}`;
            item.innerHTML = `
                <div class="flex items-center gap-sm">
                    <div class="w-8 h-8 rounded-full ${isOverdue ? 'bg-error text-white' : 'bg-outline-variant text-on-surface-variant'} flex items-center justify-center">
                        <span class="material-symbols-outlined text-sm">${isOverdue ? 'priority_high' : 'wifi'}</span>
                    </div>
                    <div>
                        <p class="font-label-md text-on-surface font-bold">${bill.name}</p>
                        <p class="text-[10px] ${isOverdue ? 'text-error font-bold' : 'text-on-surface-variant uppercase'}">${bill.date}</p>
                    </div>
                </div>
                <p class="font-tabular-nums font-bold text-on-surface">${formatMoney(bill.amount, bill.isUSD)}</p>
            `;
            dashBills.appendChild(item);
        });

        // Render "Vence Hoy" list on Payments Tab
        overdue.forEach(bill => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between p-sm bg-surface-container-low rounded-lg border-l-4 border-error';
            item.innerHTML = `
                <div>
                    <p class="text-sm font-bold">${bill.name}</p>
                    <p class="text-xs text-on-surface-variant">${bill.date}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="font-tabular-nums text-headline-sm text-primary mr-1">${formatMoney(bill.amount, bill.isUSD)}</span>
                    <button class="btn-quick-pay text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20" data-id="${bill.id}">PAGAR</button>
                    <button class="btn-delete-bill text-on-surface-variant hover:text-error transition-colors p-1" data-id="${bill.id}" title="Eliminar">
                        <span class="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            `;
            payTodayList.appendChild(item);
        });

        if (overdue.length === 0) {
            payTodayList.innerHTML = `<p class="p-xs text-center text-on-surface-variant text-xs">¡No tienes pagos vencidos para hoy!</p>`;
        }

        // Render Chronological List: Overdue
        overdue.forEach(bill => {
            const item = document.createElement('div');
            item.className = 'bg-surface-container-low/40 rounded-xl border border-error/20 p-sm hover:shadow-md transition-all group cursor-pointer';
            item.innerHTML = `
                <div class="flex items-center gap-md">
                    <div class="w-12 h-12 rounded-xl bg-error-container flex items-center justify-center text-on-error-container">
                        <span class="material-symbols-outlined">wifi</span>
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center justify-between">
                            <p class="font-body-lg font-bold text-on-surface">${bill.name}</p>
                            <p class="font-tabular-nums text-body-lg font-bold text-error">${formatMoney(bill.amount, bill.isUSD)}</p>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-xs text-on-surface-variant">${bill.date}</p>
                            <div class="flex items-center gap-2">
                                <button class="btn-quick-pay text-xs font-bold text-primary group-hover:underline" data-id="${bill.id}">PAGAR AHORA</button>
                                <button class="btn-delete-bill text-on-surface-variant hover:text-error transition-colors ml-1" data-id="${bill.id}" title="Eliminar">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listOverdue.appendChild(item);
        });

        if (overdue.length === 0) {
            listOverdue.innerHTML = `<p class="p-sm text-on-surface-variant font-body-sm text-center">Sin obligaciones vencidas.</p>`;
        }

        // Render Chronological List: Upcoming
        upcoming.forEach(bill => {
            const item = document.createElement('div');
            item.className = 'bg-surface-container-low/40 rounded-xl border border-outline-variant p-sm hover:bg-surface-container-low transition-all cursor-pointer';
            item.innerHTML = `
                <div class="flex items-center gap-md">
                    <div class="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">credit_card</span>
                    </div>
                    <div class="flex-grow">
                        <div class="flex items-center justify-between">
                            <p class="font-body-md font-bold text-on-surface">${bill.name}</p>
                            <p class="font-tabular-nums text-body-md font-bold text-primary">${formatMoney(bill.amount, bill.isUSD)}</p>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <p class="text-xs text-on-surface-variant">${bill.date}</p>
                            <div class="flex items-center gap-xs">
                                <span class="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-bold">MANUAL</span>
                                <button class="btn-quick-pay text-xs font-bold text-primary hover:underline ml-sm" data-id="${bill.id}">PAGAR</button>
                                <button class="btn-delete-bill text-on-surface-variant hover:text-error transition-colors ml-1" data-id="${bill.id}" title="Eliminar">
                                    <span class="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            listUpcoming.appendChild(item);
        });

        if (upcoming.length === 0) {
            listUpcoming.innerHTML = `<p class="p-sm text-on-surface-variant font-body-sm text-center">Sin obligaciones pendientes.</p>`;
        }

        // Render Dedicated Services Grid (for pay-view-services)
        const servicesGrid = document.getElementById('services-dedicated-grid');
        if (servicesGrid) {
            servicesGrid.innerHTML = '';
            const servicesOnly = (state.bills || []).filter(b => b.category === 'service' || b.category === 'Servicios' || !/préstamo|cuota|crédito/i.test(b.name));
            if (servicesOnly.length === 0) {
                servicesGrid.innerHTML = `<div class="col-span-full bg-white p-xl rounded-2xl border border-outline-variant/30 text-center space-y-2"><p class="text-sm font-bold text-on-surface">No hay servicios registrados aún.</p><p class="text-xs text-on-surface-variant">Usa el botón "+ Cargar Nuevo Servicio" arriba para empezar a organizar tu luz, agua, internet, etc.</p></div>`;
            } else {
                servicesOnly.forEach(bill => {
                    const isOverdue = bill.status === 'overdue';
                    const card = document.createElement('div');
                    card.className = `bg-white p-md rounded-2xl border ${isOverdue ? 'border-error/40 shadow-sm' : 'border-outline-variant/30 shadow-sm'} flex flex-col justify-between hover:shadow-md transition-all`;
                    card.innerHTML = `
                        <div>
                            <div class="flex justify-between items-start mb-sm">
                                <div class="w-10 h-10 rounded-xl ${isOverdue ? 'bg-error text-white' : 'bg-primary/10 text-primary'} flex items-center justify-center font-bold">
                                    <span class="material-symbols-outlined text-[20px]">${isOverdue ? 'priority_high' : 'receipt_long'}</span>
                                </div>
                                <span class="text-[11px] font-bold px-2.5 py-1 rounded-full ${isOverdue ? 'bg-error/10 text-error' : 'bg-surface-container text-on-surface-variant'}">${bill.date}</span>
                            </div>
                            <h4 class="font-bold text-base text-on-surface mb-1">${bill.name}</h4>
                            <p class="font-tabular-nums text-xl font-bold ${isOverdue ? 'text-error' : 'text-primary'}">${formatMoney(bill.amount, bill.isUSD)}</p>
                        </div>
                        <div class="flex items-center gap-2 mt-md pt-sm border-t border-outline-variant/30">
                            <button class="btn-quick-pay flex-1 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg hover:opacity-90 transition-all" data-id="${bill.id}">Pagar Ahora</button>
                            <button class="btn-delete-bill p-2 bg-surface-container-low text-on-surface-variant hover:text-error rounded-lg transition-all" data-id="${bill.id}" title="Eliminar">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    `;
                    servicesGrid.appendChild(card);
                });
            }
        }

        // Render Dedicated Loans & Bills List (for pay-view-loans)
        const loansBillsList = document.getElementById('pay-loans-bills-list');
        if (loansBillsList) {
            loansBillsList.innerHTML = '';
            const loansOnly = (state.bills || []).filter(b => b.category === 'loan' || b.category === 'Préstamos' || /préstamo|cuota|crédito|banco|galicia|mp/i.test(b.name));
            if (loansOnly.length === 0) {
                loansBillsList.innerHTML = `<p class="p-lg text-center text-on-surface-variant text-xs bg-surface-container-low/40 rounded-xl border border-outline-variant/30">No tienes cuotas bancarias pendientes registradas.</p>`;
            } else {
                loansOnly.forEach(bill => {
                    const isOverdue = bill.status === 'overdue';
                    const item = document.createElement('div');
                    item.className = `flex items-center justify-between p-md bg-white rounded-xl border ${isOverdue ? 'border-error/40' : 'border-outline-variant/30'} shadow-sm`;
                    item.innerHTML = `
                        <div class="flex items-center gap-md">
                            <div class="w-10 h-10 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                                <span class="material-symbols-outlined">credit_card</span>
                            </div>
                            <div>
                                <p class="font-bold text-sm text-on-surface">${bill.name}</p>
                                <p class="text-xs text-on-surface-variant">Vencimiento: ${bill.date}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="font-tabular-nums font-bold text-base ${isOverdue ? 'text-error' : 'text-on-surface'}">${formatMoney(bill.amount, bill.isUSD)}</span>
                            <button class="btn-quick-pay px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all" data-id="${bill.id}">Pagar</button>
                            <button class="btn-delete-bill text-on-surface-variant hover:text-error p-1" data-id="${bill.id}" title="Eliminar">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    `;
                    loansBillsList.appendChild(item);
                });
            }
        }

        // Bind quick pay triggers
        document.querySelectorAll('.btn-quick-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const billId = btn.getAttribute('data-id');
                openPayBillModal(billId);
            });
        });

        // Bind delete triggers with security warning
        document.querySelectorAll('.btn-delete-bill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const billId = btn.getAttribute('data-id');
                const bill = state.bills.find(b => b.id === billId);
                if (!bill) return;
                if (confirm(`⚠️ Aviso de Seguridad:\n¿Estás seguro de eliminar el vencimiento "${bill.name}" por ${formatMoney(bill.amount)}?`)) {
                    state.bills = state.bills.filter(b => b.id !== billId);
                    saveState().catch(e => console.warn('Firestore sync error:', e));
                    renderAll();
                    showToast(`Vencimiento "${bill.name}" eliminado.`, 'info');
                }
            });
        });
    }

    // 4. Render P2P Loans
    let selectedLoanId = null;

    function openLoanDetailModal(loanId) {
        const loan = state.loans.find(l => l.id === loanId);
        if (!loan) return;
        selectedLoanId = loanId;

        document.getElementById('loan-detail-title').textContent = loan.name;
        document.getElementById('loan-detail-subtitle').textContent = loan.desc || 'Detalles del préstamo';
        
        const typeEl = document.getElementById('loan-detail-type');
        typeEl.textContent = loan.type === 'receivable' ? 'A Cobrar (Préstamo Activo)' : 'Por Pagar (Deuda Activa)';
        
        const amountEl = document.getElementById('loan-detail-amount');
        amountEl.textContent = formatMoney(loan.amount);
        amountEl.className = `text-lg font-bold ${loan.type === 'receivable' ? 'text-secondary' : 'text-on-tertiary-container'}`;

        const statusEl = document.getElementById('loan-detail-status');
        statusEl.textContent = loan.status;
        statusEl.className = `px-xs py-base rounded-full font-label-md font-bold ${
            loan.status === 'PAGADO' ? 'bg-secondary/15 text-secondary' : 'bg-outline-variant/30 text-on-surface-variant'
        }`;

        let paidAmt = 0;
        let remAmt = 0;
        if (loan.quotas && loan.quotas.length > 0) {
            loan.quotas.forEach(q => {
                if (q.status === 'paid') paidAmt += q.amount;
                else remAmt += q.amount;
            });
        } else {
            if (loan.status === 'PAGADO') paidAmt = loan.amount;
            else remAmt = loan.amount;
        }
        const totalCalc = paidAmt + remAmt || loan.amount || 1;
        const progressPct = Math.min(100, Math.round((paidAmt / totalCalc) * 100));

        const paidEl = document.getElementById('loan-detail-paid');
        const remEl = document.getElementById('loan-detail-remaining');
        const progressEl = document.getElementById('loan-detail-progress-bar');
        if (paidEl) paidEl.textContent = formatMoney(paidAmt);
        if (remEl) remEl.textContent = formatMoney(remAmt);
        if (progressEl) progressEl.style.width = `${progressPct}%`;

        // Quotas list rendering
        const quotasContainer = document.getElementById('loan-quotas-list');
        quotasContainer.innerHTML = '';
        
        const paySection = document.getElementById('loan-pay-section');
        paySection.classList.add('hidden');

        let nextPendingQuota = null;

        if (loan.quotas && loan.quotas.length > 0) {
            loan.quotas.forEach(q => {
                const row = document.createElement('div');
                row.className = 'flex items-center justify-between py-xs text-sm border-b border-outline-variant/20';
                const statusLabel = q.status === 'paid' ? '✓ Pagada' : 'Pendiente';
                const statusColor = q.status === 'paid' ? 'text-secondary font-bold' : 'text-on-surface-variant';
                
                row.innerHTML = `
                    <span class="font-bold">Cuota ${q.number}</span>
                    <span class="font-tabular-nums font-bold">${formatMoney(q.amount)}</span>
                    <span class="${statusColor} text-xs">${statusLabel}</span>
                `;
                quotasContainer.appendChild(row);

                if (q.status === 'pending' && !nextPendingQuota) {
                    nextPendingQuota = q;
                }
            });
        } else {
            quotasContainer.innerHTML = '<p class="text-xs text-on-surface-variant py-sm">Sin cuotas registradas.</p>';
        }

        // Show pay section if it's payable and has pending quotas
        if (loan.type === 'payable' && nextPendingQuota) {
            paySection.classList.remove('hidden');
            document.getElementById('loan-next-quota-label').textContent = `Siguiente: Cuota ${nextPendingQuota.number}`;
            document.getElementById('loan-next-quota-amount').textContent = formatMoney(nextPendingQuota.amount);
        }

        openModal('modal-loan-detail');
    }

    function renderLoans() {
        const loanContainer = document.getElementById('pay-p2p-list');
        loanContainer.innerHTML = '';

        if (!state.loans || state.loans.length === 0) {
            loanContainer.innerHTML = '<p class="text-xs text-on-surface-variant py-sm text-center">Sin préstamos activos.</p>';
            return;
        }

        state.loans.forEach(loan => {
            const isReceivable = loan.type === 'receivable';
            const colorClass = isReceivable ? 'bg-secondary-container/20 border border-secondary/15 hover:bg-secondary-container/30' : 'bg-tertiary-fixed/30 border border-tertiary/15 hover:bg-tertiary-fixed/40';
            const icon = isReceivable ? 'north_east' : 'south_west';
            const iconColor = isReceivable ? 'text-secondary' : 'text-on-tertiary-container';
            const avatarColor = isReceivable ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed';
            const textClass = isReceivable ? 'text-secondary' : 'text-on-tertiary-container';
            const avatarInitials = loan.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

            const item = document.createElement('div');
            item.className = `p-sm rounded-lg ${colorClass} cursor-pointer hover:scale-[1.01] transition-all`;
            item.innerHTML = `
                <div class="flex items-center justify-between mb-xs">
                    <span class="text-xs font-bold ${textClass} uppercase">${isReceivable ? 'A Cobrar' : 'Por Pagar'}</span>
                    <span class="material-symbols-outlined text-sm ${iconColor}">${icon}</span>
                </div>
                <div class="flex items-center gap-sm">
                    <div class="w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-bold">${avatarInitials}</div>
                    <div>
                        <p class="font-body-md text-body-md font-bold">${loan.name}</p>
                        <p class="text-xs text-on-surface-variant">${loan.desc}</p>
                    </div>
                    <div class="ml-auto text-right">
                        <p class="font-tabular-nums font-bold ${textClass}">${formatMoney(loan.amount)}</p>
                        <span class="text-[10px] ${isReceivable ? 'bg-secondary/10 text-secondary' : 'bg-on-tertiary-container/10 text-on-tertiary-container'} px-2 py-0.5 rounded-full font-bold">${loan.status}</span>
                    </div>
                </div>
            `;
            item.addEventListener('click', () => openLoanDetailModal(loan.id));
            loanContainer.appendChild(item);
        });
    }

    // 5. Render Expense Analytics Breakdown percentages
    function renderAnalyticsBreakdown() {
        const statsContainer = document.getElementById('acc-categories-stats');
        statsContainer.innerHTML = '';

        // Calculate category spending totals
        const totals = {};
        let totalExpenses = 0;

        state.transactions.forEach(tx => {
            if (tx.type === 'outgoing') {
                const cat = tx.category || 'Otros';
                totals[cat] = (totals[cat] || 0) + tx.amount;
                totalExpenses += tx.amount;
            }
        });

        const categories = Object.keys(totals);
        if (categories.length === 0 || totalExpenses === 0) {
            statsContainer.innerHTML = `<p class="text-on-surface-variant text-xs">Sin registros de gastos.</p>`;
            return;
        }

        const colors = {
            'Alimentación': 'bg-secondary',
            'Servicios': 'bg-primary',
            'Ocio': 'bg-tertiary-container',
            'Otros': 'bg-outline'
        };

        categories.sort((a,b) => totals[b] - totals[a]).forEach(cat => {
            const percent = Math.round((totals[cat] / totalExpenses) * 100);
            const color = colors[cat] || 'bg-outline';

            const item = document.createElement('div');
            item.className = 'flex items-center gap-sm';
            item.innerHTML = `
                <div class="w-2 h-2 rounded-full ${color}"></div>
                <span class="flex-1 font-body-sm text-body-sm text-on-surface">${cat}</span>
                <span class="font-tabular-nums font-body-sm text-body-sm text-on-surface-variant">${percent}%</span>
            `;
            statsContainer.appendChild(item);
        });
    }

    // --- Tab Switcher Logic ---
    function switchTab(tabName) {
        localStorage.setItem('wealthflow_last_tab', tabName);
        // Show/Hide Tab divs
        document.querySelectorAll('.tab-view').forEach(view => {
            if (view.id === `tab-${tabName}`) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });

        // Set Tab button Active class (Desktop sidebar)
        document.querySelectorAll('.nav-btn').forEach(btn => {
            const isTarget = btn.getAttribute('data-tab') === tabName;
            if (isTarget) {
                btn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold', 'active');
                btn.classList.remove('text-on-surface-variant', 'hover:bg-surface-container-high');
            } else {
                btn.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold', 'active');
                btn.classList.add('text-on-surface-variant', 'hover:bg-surface-container-high');
            }
        });

        // Set Tab button Active class (Mobile bottom bar)
        document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            const isTarget = btn.getAttribute('data-tab') === tabName;
            if (isTarget) {
                btn.classList.add('bg-secondary-container', 'text-on-secondary-container', 'active-mobile');
                btn.classList.remove('text-on-surface-variant', 'hover:bg-surface-variant');
            } else {
                btn.classList.remove('bg-secondary-container', 'text-on-secondary-container', 'active-mobile');
                btn.classList.add('text-on-surface-variant', 'hover:bg-surface-variant');
            }
        });

        const titles = {
            'dashboard': 'Resumen General',
            'accounts': 'Mis Billeteras',
            'payments': 'Vencimientos y Servicios',
            'transactions': 'Historial y Movimientos',
            'integrations': 'Integraciones y APIs',
            'settings': 'Configuración de Cuenta',
            'admin': 'Consola de Administración'
        };
        document.getElementById('view-title').textContent = titles[tabName] || 'WealthFlow';

        const targetView = document.getElementById(`tab-${tabName}`);
        if (targetView && window.Motion) {
            Motion.animate(targetView, { opacity: [0, 1], y: [16, 0] }, { duration: 0.35 });
        }

        if (tabName === 'admin') {
            renderAdminPanel();
        } else if (tabName === 'transactions') {
            renderModuleTransactions('all');
        }

        // Render charts when entering dashboard or analytics/integrations
        if (tabName === 'dashboard' || tabName === 'integrations') {
            setTimeout(() => renderPremiumCharts(), 50);
        }
    }

    // --- Toast System ---
    function showToast(text, type = 'success') {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toast-text');
        const toastIcon = document.getElementById('toast-icon');

        toastText.textContent = text;
        if (type === 'success') {
            toastIcon.textContent = 'check_circle';
            toastIcon.className = 'material-symbols-outlined text-secondary-fixed';
        } else if (type === 'error') {
            toastIcon.textContent = 'error';
            toastIcon.className = 'material-symbols-outlined text-error';
        } else {
            toastIcon.textContent = 'info';
            toastIcon.className = 'material-symbols-outlined text-primary';
        }

        toast.classList.remove('translate-y-24', 'opacity-0');
        if (window.Motion) {
            Motion.animate(toast, { opacity: [0, 1], y: [50, 0] }, { duration: 0.3 });
        }
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3500);
    }

    // --- Modal Controls (Framer Motion spring effect) ---
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        const content = modal.querySelector('.bg-white');
        if (content && window.Motion) {
            Motion.animate(content, { opacity: [0, 1], scale: [0.92, 1], y: [20, 0] }, { duration: 0.28 });
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    // Pay Bill Modal Trigger
    function openPayBillModal(billId) {
        const bill = state.bills.find(b => b.id === billId);
        if (!bill) return;

        document.getElementById('pay-bill-id').value = billId;
        document.getElementById('pay-bill-name').textContent = bill.name;
        document.getElementById('pay-bill-amount').textContent = formatMoney(bill.amount, bill.isUSD);

        openModal('modal-pay-bill');
    }

    // --- Process Transactions (Add / Send / Pay) ---

    // Add Funds Submit
    document.getElementById('form-add-funds').addEventListener('submit', async (e) => {
        e.preventDefault();
        const dest = document.getElementById('add-destination').value;
        const amount = parseFloat(document.getElementById('add-amount').value);

        if (isNaN(amount) || amount <= 0) return;

        // Update Wallet
        state.wallets[dest] += amount;

        const isUSD = dest === 'PayPal';

        // Add Transaction record
        state.transactions.unshift({
            id: Date.now(),
            type: 'incoming',
            title: `Carga de fondos (${dest})`,
            amount: amount,
            wallet: dest === 'Galicia' ? 'Banco Galicia' : dest,
            date: 'Hoy • Reciente',
            category: 'Ingreso',
            isUSD: isUSD
        });

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        closeModal('modal-add');
        showToast(`Cargaste ${formatMoney(amount, isUSD)} con éxito en ${dest}.`, 'success');
    });

    // Send Money / Cargar Gasto o Pago Submit
    document.getElementById('form-send-money').addEventListener('submit', async (e) => {
        e.preventDefault();
        const origin = document.getElementById('send-origin').value;
        const recipient = document.getElementById('send-recipient').value.trim();
        const amount = parseFloat(document.getElementById('send-amount').value);
        const concept = document.getElementById('send-concept').value.trim();
        const category = document.getElementById('send-category').value;

        if (isNaN(amount) || amount <= 0) return;

        // Check funds
        const currentBalance = state.wallets[origin];
        if (amount > currentBalance) {
            showToast(`Saldo insuficiente en ${origin} para este gasto/pago.`, 'error');
            return;
        }

        // Subtract funds
        state.wallets[origin] -= amount;

        const isUSD = origin === 'PayPal';

        // Add Transaction record
        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: recipient || 'Gasto registrado',
            amount: amount,
            wallet: origin === 'Galicia' ? 'Banco Galicia' : origin,
            date: 'Hoy • Reciente',
            category: category,
            note: concept || 'Gasto manual',
            isUSD: isUSD
        });

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        closeModal('modal-send');
        document.getElementById('form-send-money').reset();
        showToast(`Registraste el gasto "${recipient}" por ${formatMoney(amount, isUSD)}.`, 'success');
    });

    // Pay Bill Submit
    document.getElementById('form-pay-bill').addEventListener('submit', async (e) => {
        e.preventDefault();
        const billId = document.getElementById('pay-bill-id').value;
        const wallet = document.getElementById('pay-bill-source').value;

        const bill = state.bills.find(b => b.id === billId);
        if (!bill) return;

        const balance = state.wallets[wallet];
        if (bill.amount > balance) {
            showToast(`Saldo insuficiente en ${wallet} para pagar este servicio.`, 'error');
            return;
        }

        // Subtract funds & delete bill obligation
        state.wallets[wallet] -= bill.amount;
        state.bills = state.bills.filter(b => b.id !== billId);

        // Add transaction
        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: `Pago: ${bill.name}`,
            amount: bill.amount,
            wallet: wallet === 'Galicia' ? 'Banco Galicia' : wallet,
            date: 'Hoy • Reciente',
            category: 'Servicios'
        });

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        closeModal('modal-pay-bill');
        showToast(`Pagaste ${bill.name} de ${formatMoney(bill.amount)} exitosamente.`, 'success');
    });

    // Pay all overdue bills today
    document.getElementById('btn-pay-all-today').addEventListener('click', async () => {
        const overdue = state.bills.filter(b => b.status === 'overdue');
        if (overdue.length === 0) return;

        // Compute total overdue
        const total = overdue.reduce((sum, b) => sum + b.amount, 0);
        // Deduct from Galicia by default or MercadoPago
        const wallet = state.wallets.Galicia >= total ? 'Galicia' : 'MercadoPago';
        const balance = state.wallets[wallet];

        if (total > balance) {
            showToast(`Saldo insuficiente en ${wallet} para liquidar todos los vencimientos de hoy.`, 'error');
            return;
        }

        // Deduct all
        state.wallets[wallet] -= total;
        state.bills = state.bills.filter(b => b.status !== 'overdue');

        // Add log
        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: `Pago: Vencimientos Consolidados`,
            amount: total,
            wallet: wallet === 'Galicia' ? 'Banco Galicia' : wallet,
            date: 'Hoy • Reciente',
            category: 'Servicios'
        });

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        showToast(`Liquidaste todos los vencimientos de hoy (${formatMoney(total)}) desde ${wallet}.`, 'success');
    });

    // --- API Configuration & Copy-paste Actions ---

    // Submit Webhook Config URL
    document.getElementById('api-config-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        state.webhookUrl = document.getElementById('api-webhook-url').value.trim();
        saveState().catch(e => console.warn('Firestore sync error:', e));
        showToast('Configuración guardada exitosamente.', 'success');
    });

    // Test webhook button click
    document.getElementById('btn-test-webhook').addEventListener('click', () => {
        openModal('modal-webhook-test');
    });

    document.getElementById('btn-close-webhook-test').addEventListener('click', () => {
        closeModal('modal-webhook-test');
    });

    // Reveal secret key toggling
    let secretHidden = true;
    document.getElementById('btn-reveal-secret').addEventListener('click', () => {
        const input = document.getElementById('api-client-secret');
        const icon = document.getElementById('btn-reveal-secret');
        if (secretHidden) {
            input.value = 'secret_dennis_wallet_key_value';
            input.type = 'text';
            icon.textContent = 'visibility_off';
        } else {
            input.value = '••••••••••••••••';
            input.type = 'password';
            icon.textContent = 'visibility';
        }
        secretHidden = !secretHidden;
    });

    // Copy Client ID click
    document.getElementById('btn-copy-client-id').addEventListener('click', () => {
        const val = document.getElementById('api-client-id').value;
        navigator.clipboard.writeText(val)
            .then(() => showToast('Copiado al portapapeles', 'success'))
            .catch(() => showToast('No se pudo copiar', 'error'));
    });

    // Sync MercadoPago
    document.getElementById('btn-sync-mp').addEventListener('click', async () => {
        const btn = document.getElementById('btn-sync-mp');
        btn.disabled = true;
        btn.textContent = 'Sincronizando...';
        showToast('Conectando con la API de MercadoPago...', 'info');

        setTimeout(async () => {
            const extra = Math.floor(Math.random() * 15000) + 1000;
            state.wallets.MercadoPago += extra;
            state.transactions.unshift({
                id: Date.now(),
                type: 'incoming',
                title: 'Venta Sincronizada MP',
                amount: extra,
                wallet: 'MercadoPago',
                date: 'Hoy • Reciente',
                category: 'Ingreso'
            });
            const timeLabel = document.getElementById('sync-time-mp');
            if (timeLabel) timeLabel.textContent = 'Última sync: Recién';
            saveState().catch(e => console.warn('Firestore sync error:', e));
            renderAll();
            btn.disabled = false;
            btn.textContent = 'Sincronizar';
            showToast(`Sincronización completa. Se acreditaron ${formatMoney(extra)}.`, 'success');
        }, 1500);
    });

    // Sync Galicia
    document.getElementById('btn-sync-galicia').addEventListener('click', async () => {
        const btn = document.getElementById('btn-sync-galicia');
        btn.disabled = true;
        btn.textContent = 'Sincronizando...';
        showToast('Verificando API Galicia Office...', 'info');

        setTimeout(async () => {
            const timeLabel = document.getElementById('sync-time-galicia');
            if (timeLabel) timeLabel.textContent = 'Última sync: Recién';
            btn.disabled = false;
            btn.textContent = 'Sincronizar';
            showToast('Banco Galicia sincronizado (sin movimientos nuevos).', 'success');
        }, 1500);
    });

    // --- Gender Detection Helper ---
    function detectGender(name) {
        if (!name) return 'male';
        const firstName = name.trim().split(' ')[0].toLowerCase();
        
        const femaleEnds = ['a', 'gail', 'luz', 'ruth'];
        const femaleNames = ['maria', 'maría', 'sol', 'belen', 'belén', 'inés', 'ines', 'carmen', 'mercedes', 'raquel', 'isabel', 'irene', 'beatriz', 'ester', 'pilar'];
        const maleNames = ['andrea', 'ariel', 'bautista'];
        
        if (maleNames.includes(firstName)) return 'male';
        if (femaleNames.includes(firstName)) return 'female';
        
        const lastChar = firstName.slice(-1);
        const lastTwo = firstName.slice(-2);
        
        if (femaleEnds.includes(lastChar) || lastTwo === 'is' || lastTwo === 'es') {
            if (['luis', 'carlos', 'marcos', 'andres', 'andrés', 'tomas', 'tomás'].includes(firstName)) {
                return 'male';
            }
            return 'female';
        }
        return 'male';
    }

    // Auto-detect gender on fullname input typing
    document.getElementById('settings-fullname').addEventListener('input', (e) => {
        const nameVal = e.target.value.trim();
        if (nameVal.length > 2) {
            const detected = detectGender(nameVal);
            document.getElementById('settings-gender').value = detected;
        }
    });

    // Generate random avatar seed
    function generateRandomAvatar(gender) {
        const seedPrefix = gender === 'female' ? 'female' : gender === 'male' ? 'male' : 'other';
        const randomSeed = seedPrefix + '_' + Math.floor(Math.random() * 100000);
        const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
        
        document.getElementById('settings-avatar-preview').src = newUrl;
        state.user.avatarUrl = newUrl;
        updateAvatarsUI(newUrl);
    }

    // Update all avatar imgs in page
    function updateAvatarsUI(url) {
        if (!url) return;
        const sidebarAvatar = document.querySelector('aside .w-10.h-10 img');
        if (sidebarAvatar) sidebarAvatar.src = url;
        const mobileAvatar = document.querySelector('header .w-8.h-8 img');
        if (mobileAvatar) mobileAvatar.src = url;
        const settingsPreview = document.getElementById('settings-avatar-preview');
        if (settingsPreview) settingsPreview.src = url;
    }

    // Random avatar button click
    document.getElementById('btn-settings-random-avatar').addEventListener('click', () => {
        const gender = document.getElementById('settings-gender').value;
        generateRandomAvatar(gender);
        showToast('¡Nueva caricatura generada!', 'success');
    });

    // Clicking avatar/profile area on Sidenav redirects to Settings
    const profileSidebarBlock = document.querySelector('aside .mt-auto');
    if (profileSidebarBlock) {
        profileSidebarBlock.classList.add('cursor-pointer', 'hover:bg-surface-container-high', 'rounded-lg', 'transition-all', 'p-xs');
        profileSidebarBlock.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn')) return;
            switchTab('settings');
        });
    }

    // Mobile header avatar wrapper click redirects to Settings
    const profileHeaderBlock = document.querySelector('header .w-8.h-8');
    if (profileHeaderBlock) {
        profileHeaderBlock.classList.add('cursor-pointer', 'hover:opacity-80', 'transition-opacity');
        profileHeaderBlock.addEventListener('click', () => {
            switchTab('settings');
        });
    }

    // Color Palette Switcher handler
    function applyColorPalette(palette) {
        const html = document.documentElement;
        if (palette && palette !== 'indigo') {
            html.setAttribute('data-theme-palette', palette);
        } else {
            html.removeAttribute('data-theme-palette');
        }
        state.themePalette = palette || 'indigo';

        document.querySelectorAll('.theme-palette-btn').forEach(btn => {
            if (btn.getAttribute('data-palette') === state.themePalette) {
                btn.className = 'theme-palette-btn p-xs border-2 border-primary rounded-lg flex flex-col items-center gap-xs hover:border-primary transition-all text-xs font-bold bg-surface-container-low';
            } else {
                btn.className = 'theme-palette-btn p-xs border border-outline-variant rounded-lg flex flex-col items-center gap-xs hover:border-primary transition-all text-xs font-bold';
            }
        });
    }

    // Register Palette button clicks
    document.querySelectorAll('.theme-palette-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const palette = btn.getAttribute('data-palette');
            applyColorPalette(palette);
            saveState().catch(e => console.warn('Firestore sync error:', e));
            showToast(`Paleta de color actualizada.`, 'success');
        });
    });

    // --- Onboarding Profile and Settings form ---
    document.getElementById('settings-profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullname = document.getElementById('settings-fullname').value.trim();
        const gender = document.getElementById('settings-gender').value;

        state.user.name = fullname;
        state.user.gender = gender;
        
        const previewEl = document.getElementById('settings-avatar-preview');
        if (previewEl) {
            state.user.avatarUrl = previewEl.src;
        }

        saveState().catch(e => console.warn('Firestore sync error:', e));

        document.querySelector('aside .font-bold.truncate').textContent = fullname;
        updateAvatarsUI(state.user.avatarUrl);
        showToast('Perfil actualizado con éxito.', 'success');
    });

    // --- Theme Switcher Logic ---
    function toggleTheme() {
        const html = document.documentElement;
        const icon = document.getElementById('theme-icon');

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            html.classList.add('light');
            icon.textContent = 'light_mode';
            state.theme = 'light';
            showToast('Tema claro activado', 'info');
        } else {
            html.classList.remove('light');
            html.classList.add('dark');
            icon.textContent = 'dark_mode';
            state.theme = 'dark';
            showToast('Tema oscuro activado', 'info');
        }
        saveState(); // intentionally not awaited - fire and forget for theme
    }

    let chartNetWorthInstance = null;
    let chartApiTrafficInstance = null;

    function renderPremiumCharts() {
        if (!window.ApexCharts) return;

        // 1. Dashboard Net Worth Area Chart
        const netWorthEl = document.querySelector("#chart-dashboard-networth");
        if (netWorthEl && netWorthEl.offsetParent !== null) {
            const optionsNetWorth = {
                chart: {
                    type: 'area',
                    height: 220,
                    toolbar: { show: false },
                    animations: {
                        enabled: true,
                        easing: 'easeinout',
                        speed: 800
                    },
                    fontFamily: 'Inter, sans-serif'
                },
                series: [{
                    name: 'Patrimonio Total ($)',
                    data: [2850000, 3100000, 3420000, 3650000, 3890000, state.totalARS || 4092400]
                }],
                xaxis: {
                    categories: ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul (Actual)'],
                    labels: { style: { colors: '#767683', fontSize: '12px', fontWeight: 600 } },
                    axisBorder: { show: false },
                    axisTicks: { show: false }
                },
                yaxis: {
                    labels: {
                        formatter: val => '$ ' + (val / 1000000).toFixed(2) + 'M',
                        style: { colors: '#767683', fontSize: '11px', fontWeight: 600 }
                    }
                },
                colors: ['#3f51b5'],
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.45,
                        opacityTo: 0.05,
                        stops: [0, 90, 100]
                    }
                },
                dataLabels: { enabled: false },
                stroke: { curve: 'smooth', width: 3 },
                grid: {
                    borderColor: '#f1f1f4',
                    strokeDashArray: 4
                },
                tooltip: {
                    theme: 'light',
                    y: { formatter: val => formatMoney(val) }
                }
            };

            if (chartNetWorthInstance) {
                chartNetWorthInstance.destroy();
            }
            netWorthEl.innerHTML = "";
            chartNetWorthInstance = new ApexCharts(netWorthEl, optionsNetWorth);
            chartNetWorthInstance.render();
        }

        // 2. Financial Performance / Traffic Chart
        const trafficEl = document.querySelector("#chart-api-traffic");
        if (trafficEl && trafficEl.offsetParent !== null) {
            const optionsTraffic = {
                chart: {
                    type: 'bar',
                    height: 200,
                    toolbar: { show: false },
                    animations: { enabled: true, speed: 600 },
                    fontFamily: 'Inter, sans-serif'
                },
                series: [{
                    name: 'Ingresos Mensuales',
                    data: [95000, 105000, 110000, 115000, 120000, 120000]
                }, {
                    name: 'Gastos Ejecutados',
                    data: [65000, 72000, 68000, 74000, 71000, 78400]
                }],
                colors: ['#00796b', '#ba1a1a'],
                plotOptions: {
                    bar: {
                        borderRadius: 6,
                        columnWidth: '45%'
                    }
                },
                dataLabels: { enabled: false },
                xaxis: {
                    categories: ['Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul']
                },
                grid: { borderColor: '#f1f1f4', strokeDashArray: 3 },
                legend: { position: 'top', horizontalAlign: 'right' },
                tooltip: { y: { formatter: val => formatMoney(val) } }
            };

            if (chartApiTrafficInstance) {
                chartApiTrafficInstance.destroy();
            }
            trafficEl.innerHTML = "";
            chartApiTrafficInstance = new ApexCharts(trafficEl, optionsTraffic);
            chartApiTrafficInstance.render();
        }
    }

    // --- General Render Wrapper ---
    function renderAll() {
        renderBalances();
        renderTransactions();
        renderBills();
        renderLoans();
        renderAnalyticsBreakdown();
        setTimeout(() => renderPremiumCharts(), 100);
    }

    // --- Wire-up Event Listeners ---

    // Sidebar navigation clicks (Desktop)
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Sidenav links triggers on widgets (Accounts / Payments / etc)
    document.querySelectorAll('.card-nav').forEach(link => {
        link.addEventListener('click', () => {
            const tabName = link.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Mobile bottom navigation bar clicks
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    // Mobile settings click
    document.querySelector('.mobile-settings-btn').addEventListener('click', () => {
        switchTab('settings');
    });

    // Action button clicks inside tab views
    document.getElementById('acc-btn-add-funds').addEventListener('click', () => openModal('modal-add'));
    document.getElementById('acc-btn-transfer').addEventListener('click', () => openModal('modal-send'));
    document.getElementById('acc-btn-connect-wallet').addEventListener('click', () => {
        showToast('Esta característica es un demo del diseño.', 'info');
    });

    // Floating action button trigger
    document.getElementById('main-fab').addEventListener('click', () => {
        openModal('modal-quick-actions');
    });

    // Quick Actions buttons
    document.getElementById('btn-close-quick-actions').addEventListener('click', () => closeModal('modal-quick-actions'));
    
    document.getElementById('qa-btn-expense').addEventListener('click', () => {
        closeModal('modal-quick-actions');
        openModal('modal-send');
    });
    
    document.getElementById('qa-btn-income').addEventListener('click', () => {
        closeModal('modal-quick-actions');
        openModal('modal-add');
    });
    
    document.getElementById('qa-btn-loan').addEventListener('click', () => {
        closeModal('modal-quick-actions');
        openLoanModal();
    });

    // Close Modals
    document.getElementById('btn-close-send').addEventListener('click', () => closeModal('modal-send'));
    document.getElementById('btn-close-add').addEventListener('click', () => closeModal('modal-add'));
    document.getElementById('btn-close-pay-bill').addEventListener('click', () => closeModal('modal-pay-bill'));

    // Clear history in Accounts tab
    document.getElementById('btn-clear-history').addEventListener('click', async () => {
        state.transactions = [];
        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderTransactions();
        renderAnalyticsBreakdown();
        renderMonthlyBalance();
        showToast('Historial vaciado.', 'info');
    });

    // Budget Save Handler
    document.getElementById('btn-save-budget').addEventListener('click', async () => {
        const val = parseFloat(document.getElementById('settings-budget').value);
        if (!isNaN(val) && val >= 0) {
            state.monthlyBudget = val;
            saveState().catch(e => console.warn('Firestore sync error:', e));
            renderMonthlyBalance();
            const lbl = document.getElementById('budget-saved-label');
            lbl.classList.remove('hidden');
            setTimeout(() => lbl.classList.add('hidden'), 3000);
            showToast(`Presupuesto mensual guardado: ${formatMoney(val)}`, 'success');
        }
    });

    // --- Auth Error Message Mapper ---
    function getAuthErrorMessage(err) {
        const code = err.code || '';
        const messages = {
            'auth/invalid-credential':        '❌ Correo o contraseña incorrectos. Verificá tus datos.',
            'auth/wrong-password':            '❌ Contraseña incorrecta. Intentá de nuevo.',
            'auth/user-not-found':            '❌ No existe una cuenta con ese correo. ¿Querés registrarte?',
            'auth/invalid-email':             '❌ El correo electrónico ingresado no es válido.',
            'auth/email-already-in-use':      '❌ Ese correo ya está registrado. Iniciá sesión en su lugar.',
            'auth/weak-password':             '❌ La contraseña es muy débil. Usá al menos 6 caracteres.',
            'auth/too-many-requests':         '⏳ Demasiados intentos fallidos. Esperá unos minutos e intentá de nuevo.',
            'auth/network-request-failed':    '🌐 Sin conexión. Verificá tu internet e intentá de nuevo.',
            'auth/popup-closed-by-user':      '❌ Cerraste el popup de Google antes de completar el inicio de sesión.',
            'auth/cancelled-popup-request':   '❌ El inicio de sesión con Google fue cancelado.',
            'auth/user-disabled':             '❌ Esta cuenta fue deshabilitada. Contactá al administrador.',
            'auth/operation-not-allowed':     '❌ Este método de inicio de sesión no está habilitado. Contactá al administrador.',
        };
        return messages[code] || '❌ Ocurrió un error inesperado. Intentá de nuevo.';
    }

    // --- Authentication Form Logic (Toggle Login/Register) ---
    let isRegisterMode = false;
    const btnToggleAuth = document.getElementById('btn-toggle-auth');
    const registerFields = document.getElementById('register-fields');
    const loginTitle = document.getElementById('login-title');
    const loginSubtitle = document.getElementById('login-subtitle');
    const btnLoginSubmit = document.getElementById('btn-login-submit');
    const authErrorMsg = document.getElementById('auth-error-msg');

    btnToggleAuth.addEventListener('click', () => {
        isRegisterMode = !isRegisterMode;
        authErrorMsg.classList.add('hidden');
        if (isRegisterMode) {
            registerFields.classList.remove('hidden');
            loginTitle.textContent = 'Registrarse';
            loginSubtitle.textContent = 'Crea tu cuenta de WealthFlow';
            btnLoginSubmit.textContent = 'Registrarse';
            btnToggleAuth.textContent = '¿Ya tienes cuenta? Inicia sesión';
            
            // Make name field required in register mode
            document.getElementById('register-name').required = true;
        } else {
            registerFields.classList.add('hidden');
            loginTitle.textContent = 'Iniciar Sesión';
            loginSubtitle.textContent = 'Ingresa a tu cuenta de WealthFlow';
            btnLoginSubmit.textContent = 'Ingresar de forma segura';
            btnToggleAuth.textContent = '¿No tienes cuenta? Regístrate gratis';
            
            document.getElementById('register-name').required = false;
        }
    });

    // Login/Register Form Submission
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        authErrorMsg.classList.add('hidden');
        btnLoginSubmit.disabled = true;
        btnLoginSubmit.textContent = isRegisterMode ? 'Registrando...' : 'Ingresando...';

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            if (isRegisterMode) {
                const name = document.getElementById('register-name').value;
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // Update Firebase Auth profile
                await userCredential.user.updateProfile({
                    displayName: name
                });

                // Create initial user document in Firestore
                state = getInitialTemplateState();
                state.isLoggedIn = true;
                state.user.name = name;
                state.user.email = email;
                
                await db.collection("users").doc(userCredential.user.uid).set(state);
                showToast(`Cuenta creada. ¡Bienvenido, ${name}!`, 'success');
            } else {
                await auth.signInWithEmailAndPassword(email, password);
                showToast('Sesión iniciada.', 'success');
            }
        } catch (err) {
            console.error("Auth error:", err);
            authErrorMsg.textContent = getAuthErrorMessage(err);
            authErrorMsg.classList.remove('hidden');
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.textContent = isRegisterMode ? 'Registrarse' : 'Ingresar de forma segura';
        }
    });

    // Sidenav Logout button
    document.getElementById('logout-btn').addEventListener('click', async () => {
        try {
            await auth.signOut();
            showToast('Sesión cerrada de forma segura.', 'info');
        } catch (e) {
            console.error("Logout error:", e);
        }
    });

    // Theme toggle button click
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

    // --- Google Sign-in ---
    document.getElementById('btn-google-signin').addEventListener('click', async () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
            showToast('Sesión iniciada con Google', 'success');
        } catch (err) {
            console.error("Google Auth error:", err);
            const authErrorMsg = document.getElementById('auth-error-msg');
            authErrorMsg.textContent = getAuthErrorMessage(err);
            authErrorMsg.classList.remove('hidden');
        }
    });

    // --- Loan Modal Logic ---
    function openLoanModal() {
        const modal = document.getElementById('modal-loan');
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        // Reset form
        document.getElementById('form-new-loan').reset();
        document.getElementById('loan-quotas-editor').classList.add('hidden');
        document.getElementById('loan-quotas-inputs').innerHTML = '';
        document.getElementById('loan-error-msg').classList.add('hidden');
        // Default type: payable
        setLoanType('payable');
    }

    function closeLoanModal() {
        const modal = document.getElementById('modal-loan');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    document.getElementById('btn-open-loan-modal').addEventListener('click', openLoanModal);
    document.getElementById('btn-close-loan-modal').addEventListener('click', closeLoanModal);
    document.getElementById('btn-cancel-loan').addEventListener('click', closeLoanModal);

    // Loan type toggle buttons
    let currentLoanType = 'payable';
    function setLoanType(type) {
        currentLoanType = type;
        const payableBtn = document.getElementById('loan-type-payable');
        const receivableBtn = document.getElementById('loan-type-receivable');
        if (type === 'payable') {
            payableBtn.className = 'loan-type-btn flex-1 py-sm rounded-lg border-2 border-primary bg-primary text-on-primary font-bold text-sm transition-all';
            receivableBtn.className = 'loan-type-btn flex-1 py-sm rounded-lg border-2 border-outline-variant text-on-surface-variant font-bold text-sm transition-all';
        } else {
            receivableBtn.className = 'loan-type-btn flex-1 py-sm rounded-lg border-2 border-secondary bg-secondary text-on-secondary font-bold text-sm transition-all';
            payableBtn.className = 'loan-type-btn flex-1 py-sm rounded-lg border-2 border-outline-variant text-on-surface-variant font-bold text-sm transition-all';
        }
    }

    document.querySelectorAll('.loan-type-btn').forEach(btn => {
        btn.addEventListener('click', () => setLoanType(btn.getAttribute('data-loantype')));
    });

    // Dynamic quota inputs generator
    function generateQuotaInputs() {
        const total = parseFloat(document.getElementById('loan-total').value) || 0;
        const count = parseInt(document.getElementById('loan-quotas').value) || 0;
        const type = document.getElementById('loan-quota-type').value;
        const editor = document.getElementById('loan-quotas-editor');
        const inputsContainer = document.getElementById('loan-quotas-inputs');

        if (type === 'variable' && count > 0) {
            editor.classList.remove('hidden');
            inputsContainer.innerHTML = '';
            const equalAmount = count > 0 ? (total / count).toFixed(2) : 0;
            for (let i = 1; i <= count; i++) {
                const row = document.createElement('div');
                row.className = 'flex items-center gap-sm';
                row.innerHTML = `
                    <span class="text-xs text-on-surface-variant w-16 shrink-0 font-bold">Cuota ${i}</span>
                    <input type="number" class="quota-input flex-1 bg-background border border-outline-variant rounded-lg px-sm py-xs text-sm font-tabular-nums focus:border-primary outline-none transition-all" data-quota="${i}" value="${equalAmount}" min="0" step="0.01"/>
                `;
                inputsContainer.appendChild(row);
            }
            // Attach listeners to update running total
            inputsContainer.querySelectorAll('.quota-input').forEach(inp => {
                inp.addEventListener('input', updateVariableTotal);
            });
            updateVariableTotal();
        } else {
            editor.classList.add('hidden');
        }
    }

    function updateVariableTotal() {
        let sum = 0;
        document.querySelectorAll('.quota-input').forEach(inp => { sum += parseFloat(inp.value) || 0; });
        document.getElementById('loan-variable-total').textContent = formatMoney(sum);
    }

    document.getElementById('loan-total').addEventListener('input', generateQuotaInputs);
    document.getElementById('loan-quotas').addEventListener('input', generateQuotaInputs);
    document.getElementById('loan-quota-type').addEventListener('change', generateQuotaInputs);

    // Save new loan (click handler - more reliable than form submit)
    document.getElementById('btn-save-loan').addEventListener('click', async () => {
        console.log('[Loan] Save button clicked');
        const errorEl = document.getElementById('loan-error-msg');
        errorEl.classList.add('hidden');

        const name = document.getElementById('loan-name').value.trim();
        const total = parseFloat(document.getElementById('loan-total').value);
        const quotaCount = parseInt(document.getElementById('loan-quotas').value);
        const quotaType = document.getElementById('loan-quota-type').value;
        const desc = document.getElementById('loan-desc').value.trim();

        console.log('[Loan] Values:', { name, total, quotaCount, quotaType, currentLoanType });

        if (!name || isNaN(total) || total <= 0 || isNaN(quotaCount) || quotaCount < 1) {
            errorEl.textContent = 'Completa todos los campos correctamente.';
            errorEl.classList.remove('hidden');
            console.warn('[Loan] Validation failed:', { name, total, quotaCount });
            return;
        }

        // Build quotas array
        let quotas = [];
        if (quotaType === 'variable') {
            const inputs = document.querySelectorAll('.quota-input');
            inputs.forEach((inp, idx) => {
                quotas.push({ number: idx + 1, amount: parseFloat(inp.value) || 0, status: 'pending' });
            });
        } else {
            const equalAmt = parseFloat((total / quotaCount).toFixed(2));
            for (let i = 1; i <= quotaCount; i++) {
                quotas.push({ number: i, amount: equalAmt, status: 'pending' });
            }
        }

        const newLoan = {
            id: 'loan-' + Date.now(),
            type: currentLoanType,
            name,
            amount: total,
            desc: desc || `${quotaCount} cuota${quotaCount > 1 ? 's' : ''}`,
            status: 'PENDIENTE',
            quotas
        };

        console.log('[Loan] Creating loan:', newLoan);

        if (!state.loans) state.loans = [];
        state.loans.push(newLoan);
        
        // Update UI immediately (don't wait for Firestore)
        renderLoans();
        renderMonthlyBalance();
        closeLoanModal();
        showToast(`Préstamo de ${name} guardado.`, 'success');
        console.log('[Loan] Loan saved successfully (local)');

        // Save to Firestore in background (non-blocking)
        saveState().catch(err => {
            console.warn('[Loan] Firestore save failed (local state preserved):', err);
        });
    });

    // --- Monthly Budget Calculation & Render ---
    function renderMonthlyBalance() {
        if (!document.getElementById('total-fixed-expenses')) return;

        const budget = state.monthlyBudget || 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Fixed: sum of all bills + current month loan quotas (payable type)
        let fixedTotal = 0;
        (state.bills || []).forEach(b => { fixedTotal += b.amount || 0; });
        (state.loans || []).filter(l => l.type === 'payable' && l.quotas).forEach(loan => {
            // Count how many quotas are pending (first unpaid = current month)
            const nextPending = loan.quotas.find(q => q.status === 'pending');
            if (nextPending) fixedTotal += nextPending.amount;
        });

        // Extraordinary: outgoing transactions this month
        let extraTotal = 0;
        (state.transactions || []).filter(tx => tx.type === 'outgoing').forEach(tx => {
            // Try to parse date; if not, count all as current period
            extraTotal += tx.amount || 0;
        });

        const totalSpent = fixedTotal + extraTotal;
        const percent = budget > 0 ? Math.min(Math.round((totalSpent / budget) * 100), 100) : 0;
        const remaining = budget - totalSpent;

        document.getElementById('total-fixed-expenses').textContent = formatMoney(fixedTotal);
        document.getElementById('total-extraordinary-expenses').textContent = formatMoney(extraTotal);
        document.getElementById('budget-percentage').textContent = `${percent}%`;
        document.getElementById('budget-spent-ratio').textContent = `${formatMoney(totalSpent)} / ${formatMoney(budget)}`;
        document.getElementById('budget-progress-bar').style.width = `${percent}%`;
        document.getElementById('budget-progress-bar').className = `h-full transition-all duration-300 ${percent >= 90 ? 'bg-error' : percent >= 70 ? 'bg-tertiary-container' : 'bg-primary'}`;

        const statusEl = document.getElementById('budget-status-text');
        if (budget === 0) {
            statusEl.textContent = 'Configura tu presupuesto en Ajustes.';
        } else if (remaining >= 0) {
            statusEl.textContent = `Te quedan ${formatMoney(remaining)} disponibles este mes.`;
        } else {
            statusEl.textContent = `Excediste el presupuesto en ${formatMoney(Math.abs(remaining))}.`;
        }
    }

    // --- Admin Console Logic ---
    const ADMIN_EMAILS = ["contacto@kofmanstudio.com", "airesestudio@gmail.com"];
    let adminUsersList = [];

    async function renderAdminPanel() {
        const totalUsersEl = document.getElementById('admin-total-users');
        const totalTxsEl = document.getElementById('admin-total-txs');
        const alertEl = document.getElementById('admin-permission-alert');
        const tableBody = document.getElementById('admin-user-table-body');

        if (!tableBody) return;

        alertEl.classList.add('hidden');
        tableBody.innerHTML = '';

        try {
            const querySnapshot = await db.collection("users").get();
            adminUsersList = [];
            let totalUsers = 0;
            let totalTransactions = 0;

            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                userData.uid = doc.id;
                adminUsersList.push(userData);
                totalUsers++;

                if (userData.transactions) {
                    totalTransactions += userData.transactions.length;
                }

                const name = userData.user ? userData.user.name : "Sin Nombre";
                const email = userData.user ? (userData.user.email || doc.id) : doc.id;
                const role = (userData.user && userData.user.role) === 'admin' ? 'Admin' : 'Usuario';
                const roleClass = role === 'Admin' ? 'bg-primary/10 text-primary font-bold' : 'bg-surface-variant text-on-surface-variant';

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/30';
                tr.innerHTML = `
                    <td class="p-md font-bold text-on-surface">${name}</td>
                    <td class="p-md text-on-surface-variant font-tabular-nums text-xs">${email}</td>
                    <td class="p-md">
                        <span class="px-xs py-base rounded-full font-label-md ${roleClass}">${role}</span>
                    </td>
                    <td class="p-md text-center">
                        <button class="btn-admin-manage text-primary font-bold font-label-md hover:underline" data-uid="${doc.id}">Gestionar</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            totalUsersEl.textContent = totalUsers;
            totalTxsEl.textContent = totalTransactions;

            tableBody.querySelectorAll('.btn-admin-manage').forEach(btn => {
                btn.addEventListener('click', () => {
                    const uid = btn.getAttribute('data-uid');
                    openAdminEditModal(uid);
                });
            });

        } catch (error) {
            console.error("Admin panel error querying Firestore:", error);
            if (error.code === 'permission-denied') {
                alertEl.classList.remove('hidden');
            } else {
                showToast("Error al cargar panel de administración", "error");
            }
        }
    }

    let adminSelectedUid = null;

    function openAdminEditModal(uid) {
        const user = adminUsersList.find(u => u.uid === uid);
        if (!user) return;
        adminSelectedUid = uid;

        document.getElementById('admin-edit-uid').value = uid;
        document.getElementById('admin-edit-name').value = user.user ? user.user.name : '';
        document.getElementById('admin-edit-role').value = (user.user && user.user.role) === 'admin' ? 'admin' : 'user';
        
        document.getElementById('admin-adj-amount').value = '';
        document.getElementById('admin-edit-user-title').textContent = `Gestionar cuenta de ${user.user ? user.user.name : 'Usuario'}`;

        openModal('modal-admin-edit');
    }

    // Admin user details form submit
    document.getElementById('form-admin-edit-user').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!adminSelectedUid) return;

        const user = adminUsersList.find(u => u.uid === adminSelectedUid);
        if (!user) return;

        const newName = document.getElementById('admin-edit-name').value.trim();
        const newRole = document.getElementById('admin-edit-role').value;
        const adjWallet = document.getElementById('admin-adj-wallet').value;
        const adjAmount = parseFloat(document.getElementById('admin-adj-amount').value);

        if (!user.user) user.user = {};
        user.user.name = newName;
        user.user.role = newRole;

        if (!isNaN(adjAmount) && adjAmount !== 0) {
            if (!user.wallets) user.wallets = {};
            user.wallets[adjWallet] = (user.wallets[adjWallet] || 0) + adjAmount;

            if (!user.transactions) user.transactions = [];
            user.transactions.unshift({
                id: Date.now(),
                type: adjAmount > 0 ? 'incoming' : 'outgoing',
                title: 'Ajuste de Administrador',
                amount: Math.abs(adjAmount),
                wallet: adjWallet === 'Galicia' ? 'Banco Galicia' : adjWallet,
                date: 'Hoy • Ajuste',
                category: adjAmount > 0 ? 'Ingreso' : 'Otros',
                isUSD: adjWallet === 'PayPal'
            });
        }

        try {
            await db.collection("users").doc(adminSelectedUid).set(user);
            showToast("Cambios guardados con éxito en Firestore.", "success");
            closeModal('modal-admin-edit');
            renderAdminPanel();
        } catch (error) {
            console.error("Error saving admin adjustments:", error);
            showToast("No se pudo actualizar el usuario.", "error");
        }
    });

    // Reset user to defaults
    document.getElementById('btn-admin-reset-user').addEventListener('click', async () => {
        if (!adminSelectedUid) return;
        const user = adminUsersList.find(u => u.uid === adminSelectedUid);
        if (!user) return;

        if (confirm(`¿Estás seguro de que deseas resetear los datos de ${user.user ? user.user.name : 'este usuario'}? Se volverá al saldo de fábrica.`)) {
            const template = getInitialTemplateState();
            template.isLoggedIn = true;
            template.user.name = user.user ? user.user.name : "Usuario Nuevo";
            template.user.alias = user.user ? user.user.alias : "usuario.wallet";
            template.user.role = (user.user && user.user.role) === 'admin' ? 'admin' : 'user';

            try {
                await db.collection("users").doc(adminSelectedUid).set(template);
                showToast("Datos de usuario reseteados con éxito.", "success");
                closeModal('modal-admin-edit');
                renderAdminPanel();
            } catch (error) {
                console.error("Error resetting user:", error);
                showToast("Error al resetear usuario.", "error");
            }
        }
    });

    // Delete user document
    document.getElementById('btn-admin-delete-user').addEventListener('click', async () => {
        if (!adminSelectedUid) return;
        const user = adminUsersList.find(u => u.uid === adminSelectedUid);
        if (!user) return;

        if (confirm(`⚠ ATENCIÓN: ¿Deseas eliminar permanentemente la cuenta de ${user.user ? user.user.name : 'este usuario'}? Esta acción no se puede deshacer.`)) {
            try {
                await db.collection("users").doc(adminSelectedUid).delete();
                showToast("Usuario eliminado correctamente.", "success");
                closeModal('modal-admin-edit');
                renderAdminPanel();
            } catch (error) {
                console.error("Error deleting user:", error);
                showToast("Error al eliminar usuario.", "error");
            }
        }
    });

    // Refresh Admin Panel
    document.getElementById('btn-admin-refresh').addEventListener('click', () => {
        renderAdminPanel();
        showToast("Panel administrativo actualizado.", "info");
    });

    // Close Modals for Admin and Loan Detail
    document.getElementById('btn-close-admin-edit').addEventListener('click', () => closeModal('modal-admin-edit'));
    document.getElementById('btn-close-loan-detail').addEventListener('click', () => closeModal('modal-loan-detail'));

    // Pay Next Quota of Loan listener
    document.getElementById('btn-pay-next-quota').addEventListener('click', async () => {
        if (!selectedLoanId) return;
        const loan = state.loans.find(l => l.id === selectedLoanId);
        if (!loan) return;

        const nextPendingIndex = loan.quotas.findIndex(q => q.status === 'pending');
        if (nextPendingIndex === -1) return;
        const quota = loan.quotas[nextPendingIndex];

        const sourceWallet = document.getElementById('loan-pay-source').value;
        const balance = state.wallets[sourceWallet];

        if (quota.amount > balance) {
            showToast(`Saldo insuficiente en ${sourceWallet} para pagar la cuota.`, 'error');
            return;
        }

        state.wallets[sourceWallet] -= quota.amount;
        quota.status = 'paid';

        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: `Cuota ${quota.number} - Préstamo ${loan.name}`,
            amount: quota.amount,
            wallet: sourceWallet === 'Galicia' ? 'Banco Galicia' : sourceWallet,
            date: 'Hoy • Reciente',
            category: 'Servicios',
            isUSD: sourceWallet === 'PayPal'
        });

        const allPaid = loan.quotas.every(q => q.status === 'paid');
        const anyPaid = loan.quotas.some(q => q.status === 'paid');
        if (allPaid) {
            loan.status = 'PAGADO';
        } else if (anyPaid) {
            loan.status = 'PARCIAL';
        } else {
            loan.status = 'PENDIENTE';
        }

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        renderMonthlyBalance();
        closeModal('modal-loan-detail');
        showToast(`Pagaste la cuota ${quota.number} de ${loan.name} con éxito.`, 'success');
    });

    // Pagar Todo el Préstamo (Saldo Restante)
    document.getElementById('btn-pay-all-loan').addEventListener('click', async () => {
        if (!selectedLoanId) return;
        const loan = state.loans.find(l => l.id === selectedLoanId);
        if (!loan) return;

        let remAmt = 0;
        if (loan.quotas && loan.quotas.length > 0) {
            loan.quotas.forEach(q => { if (q.status !== 'paid') remAmt += q.amount; });
        } else if (loan.status !== 'PAGADO') {
            remAmt = loan.amount;
        }

        if (remAmt <= 0) {
            showToast('Este préstamo ya se encuentra pagado en su totalidad.', 'info');
            return;
        }

        const sourceWallet = document.getElementById('loan-pay-source').value;
        const balance = state.wallets[sourceWallet];

        if (remAmt > balance) {
            showToast(`Saldo insuficiente en ${sourceWallet} para liquidar el saldo total de ${formatMoney(remAmt)}.`, 'error');
            return;
        }

        state.wallets[sourceWallet] -= remAmt;
        if (loan.quotas && loan.quotas.length > 0) {
            loan.quotas.forEach(q => q.status = 'paid');
        }
        loan.status = 'PAGADO';

        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: `Liquidación total - Préstamo ${loan.name}`,
            amount: remAmt,
            wallet: sourceWallet === 'Galicia' ? 'Banco Galicia' : sourceWallet,
            date: 'Hoy • Reciente',
            category: 'Servicios',
            isUSD: sourceWallet === 'PayPal'
        });

        saveState().catch(e => console.warn('Firestore sync error:', e));
        renderAll();
        renderMonthlyBalance();
        closeModal('modal-loan-detail');
        showToast(`¡Liquidaste el préstamo ${loan.name} por ${formatMoney(remAmt)} exitosamente!`, 'success');
    });

    // Eliminar Préstamo con Aviso de Seguridad
    document.getElementById('btn-delete-loan').addEventListener('click', async () => {
        if (!selectedLoanId) return;
        const loan = state.loans.find(l => l.id === selectedLoanId);
        if (!loan) return;

        if (confirm(`⚠️ Aviso de Seguridad:\n¿Estás seguro de que deseas eliminar el préstamo "${loan.name}"?\nEsta acción borrará este préstamo y su cronograma de forma permanente.`)) {
            state.loans = state.loans.filter(l => l.id !== selectedLoanId);
            saveState().catch(e => console.warn('Firestore sync error:', e));
            renderAll();
            renderMonthlyBalance();
            closeModal('modal-loan-detail');
            showToast(`Préstamo "${loan.name}" eliminado correctamente.`, 'info');
        }
    });

    // Modal Nuevo Vencimiento / Servicio
    const btnOpenSvc = document.getElementById('btn-open-service-modal');
    if (btnOpenSvc) {
        btnOpenSvc.addEventListener('click', () => {
            document.getElementById('service-date').value = new Date().toISOString().split('T')[0];
            openModal('modal-add-service');
        });
    }
    const btnCloseSvc = document.getElementById('btn-close-service-modal');
    if (btnCloseSvc) {
        btnCloseSvc.addEventListener('click', () => closeModal('modal-add-service'));
    }

    // Formulario Guardar Vencimiento
    const formAddSvc = document.getElementById('form-add-service');
    if (formAddSvc) {
        formAddSvc.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('service-name').value.trim();
            const amount = parseFloat(document.getElementById('service-amount').value);
            const dateVal = document.getElementById('service-date').value;

            if (!name || isNaN(amount) || amount <= 0 || !dateVal) return;

            const dateObj = new Date(dateVal + 'T00:00:00');
            const today = new Date();
            today.setHours(0,0,0,0);

            const isOverdue = dateObj <= today;
            const status = isOverdue ? 'overdue' : 'upcoming';

            const options = { day: '2-digit', month: 'short' };
            const dateFormatted = isOverdue && dateObj.getTime() === today.getTime() ? 'Vence Hoy' : dateObj.toLocaleDateString('es-AR', options);

            if (!state.bills) state.bills = [];
            state.bills.push({
                id: 'bill_' + Date.now(),
                name: name,
                amount: amount,
                date: dateFormatted,
                status: status,
                isUSD: false
            });

            saveState().catch(e => console.warn('Firestore sync error:', e));
            renderAll();
            closeModal('modal-add-service');
            formAddSvc.reset();
            showToast(`Agregaste el servicio "${name}" por ${formatMoney(amount)}.`, 'success');
        });
    }

    // Filtros de sub-pestaña en Vencimientos y Servicios (Resumen / Servicios / Préstamos)
    document.querySelectorAll('.pay-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-category');
            document.querySelectorAll('.pay-filter-btn').forEach(b => {
                if (b.getAttribute('data-category') === cat) {
                    b.className = 'pay-filter-btn flex-1 md:flex-none font-body-md text-sm font-bold bg-white text-primary py-2 px-5 rounded-xl shadow-sm ring-1 ring-black/5 transition-all duration-300 active';
                } else {
                    b.className = 'pay-filter-btn flex-1 md:flex-none font-body-md text-sm font-bold text-on-surface-variant hover:text-on-surface hover:bg-white/50 py-2 px-5 rounded-xl transition-all duration-300';
                }
            });

            document.querySelectorAll('.pay-subview').forEach(view => {
                view.classList.add('hidden');
            });

            const targetId = cat === 'service' ? 'pay-view-services' : (cat === 'loan' ? 'pay-view-loans' : 'pay-view-all');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.classList.remove('hidden');
                if (window.Motion) {
                    Motion.animate(targetEl, { opacity: [0, 1], y: [15, 0] }, { duration: 0.35 });
                }
            }

            renderBills(cat);
        });
    });

    ['btn-open-service-modal-all', 'btn-open-service-modal-dedicated'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', () => openModal('modal-add-service'));
    });

    // --- Firebase Auth State Listener (Unified Init) ---
    auth.onAuthStateChanged(async (user) => {
        const viewLogin = document.getElementById('view-login');
        const appTabsContainer = document.getElementById('app-tabs-container');
        const adminBtn = document.getElementById('nav-btn-admin');
        const mobileAdminBtn = document.getElementById('mobile-nav-btn-admin');
        
        const appLoader = document.getElementById('app-loader');

        if (user) {
            viewLogin.classList.add('hidden');
            appTabsContainer.classList.remove('hidden');
            
            await loadState(user.uid);
            
            if (appLoader) {
                appLoader.style.opacity = '0';
                setTimeout(() => appLoader.classList.add('hidden'), 300);
            }
            
            // Set user role to Admin if their email matches (bootstrap admin)
            if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
                if (!state.user) state.user = {};
                if (state.user.role !== 'admin') {
                    state.user.role = 'admin';
                    saveState().catch(e => console.warn('Firestore sync error:', e));
                }
            }

            // Hide/Show Admin tab buttons based on role
            if (state.user && state.user.role === 'admin') {
                if (adminBtn) adminBtn.classList.remove('hidden');
                if (mobileAdminBtn) mobileAdminBtn.classList.remove('hidden');
            } else {
                if (adminBtn) adminBtn.classList.add('hidden');
                if (mobileAdminBtn) mobileAdminBtn.classList.add('hidden');
            }
            
            document.querySelector('aside .font-bold.truncate').textContent = state.user ? state.user.name : "Usuario";
            
            // Populate settings page fields from loaded state
            if (state.user) {
                document.getElementById('settings-fullname').value = state.user.name || '';
                document.getElementById('settings-gender').value = state.user.gender || 'male';
                if (state.user.avatarUrl) {
                    updateAvatarsUI(state.user.avatarUrl);
                }
            }
            
            // Apply loaded color palette
            applyColorPalette(state.themePalette || 'indigo');

            const html = document.documentElement;
            html.className = state.theme || 'light';
            document.getElementById('theme-icon').textContent = state.theme === 'dark' ? 'dark_mode' : 'light_mode';
            
            renderAll();
            renderMonthlyBalance();
            const lastTab = localStorage.getItem('wealthflow_last_tab') || 'dashboard';
            switchTab(lastTab);
            if (window.Motion && lastTab === 'dashboard') {
                Motion.animate(document.querySelectorAll('#tab-dashboard > div > section, #tab-dashboard > div > div'), { opacity: [0, 1], y: [25, 0] }, { duration: 0.5, delay: Motion.stagger(0.1) });
            }
        } else {
            state = getInitialTemplateState();
            
            viewLogin.classList.remove('hidden');
            appTabsContainer.classList.add('hidden');
            
            if (appLoader) {
                appLoader.style.opacity = '0';
                setTimeout(() => appLoader.classList.add('hidden'), 300);
            }
            
            if (adminBtn) adminBtn.classList.add('hidden');
            if (mobileAdminBtn) mobileAdminBtn.classList.add('hidden');
            
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.textContent = isRegisterMode ? 'Registrarse' : 'Ingresar de forma segura';
            
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            if (document.getElementById('register-name')) document.getElementById('register-name').value = '';
        }
    });
});
