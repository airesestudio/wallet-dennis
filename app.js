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

// --- Default Template State ---
const DEFAULT_STATE = {
    isLoggedIn: false,
    user: {
        name: "Dennis A.",
        alias: "dennis.wallet"
    },
    wallets: {
        Galicia: 2850400.42,
        MercadoPago: 1240500.00,
        PayPal: 450.00, // USD
        Prex: 1500.00
    },
    exchangeRate: 1000, // ARS per USD for consolidated totals
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
    webhookUrl: 'https://dennis.wallet.com/webhooks',
    theme: 'light',
    monthlyBudget: 0
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Initial State ---
    let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

    // --- Firebase Integration ---
    async function loadState(uid) {
        try {
            const doc = await db.collection("users").doc(uid).get();
            if (doc.exists) {
                state = doc.data();
            } else {
                // Initialize new user with default template state
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
                state.isLoggedIn = true;
                state.user.name = auth.currentUser.displayName || "Usuario Nuevo";
                state.user.alias = auth.currentUser.email.split('@')[0] + ".wallet";
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

    // 3. Render Bills & Obligations
    function renderBills() {
        const dashBills = document.getElementById('dash-upcoming-bills');
        const payTodayList = document.getElementById('pay-today-list');
        const listOverdue = document.getElementById('list-overdue');
        const listUpcoming = document.getElementById('list-upcoming');

        dashBills.innerHTML = '';
        payTodayList.innerHTML = '';
        listOverdue.innerHTML = '';
        listUpcoming.innerHTML = '';

        const overdue = state.bills.filter(b => b.status === 'overdue');
        const upcoming = state.bills.filter(b => b.status === 'upcoming');

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
                <div class="flex flex-col items-end">
                    <span class="font-tabular-nums text-headline-sm text-primary">${formatMoney(bill.amount, bill.isUSD)}</span>
                    <button class="btn-quick-pay text-xs font-bold text-primary hover:underline" data-id="${bill.id}">PAGAR</button>
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
                            <button class="btn-quick-pay text-xs font-bold text-primary group-hover:underline" data-id="${bill.id}">PAGAR AHORA</button>
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

        // Bind quick pay triggers
        document.querySelectorAll('.btn-quick-pay').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const billId = btn.getAttribute('data-id');
                openPayBillModal(billId);
            });
        });
    }

    // 4. Render P2P Loans
    function renderLoans() {
        const loanContainer = document.getElementById('pay-p2p-list');
        loanContainer.innerHTML = '';

        state.loans.forEach(loan => {
            const isReceivable = loan.type === 'receivable';
            const colorClass = isReceivable ? 'bg-secondary-container/20 border border-secondary/15' : 'bg-tertiary-fixed/30 border border-tertiary/15';
            const icon = isReceivable ? 'north_east' : 'south_west';
            const iconColor = isReceivable ? 'text-secondary' : 'text-on-tertiary-container';
            const avatarColor = isReceivable ? 'bg-secondary-container text-on-secondary-container' : 'bg-tertiary-fixed text-on-tertiary-fixed';
            const textClass = isReceivable ? 'text-secondary' : 'text-on-tertiary-container';
            const avatarInitials = loan.name.split(' ').map(n => n[0]).join('');

            const item = document.createElement('div');
            item.className = `p-sm rounded-lg ${colorClass}`;
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
            btn.className = isTarget 
                ? 'nav-btn w-full flex items-center gap-sm px-md py-sm bg-primary-container text-on-primary-container rounded-lg font-bold transition-all text-left active'
                : 'nav-btn w-full flex items-center gap-sm px-md py-sm text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg text-left';
        });

        // Set Tab button Active class (Mobile bottom bar)
        document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            const isTarget = btn.getAttribute('data-tab') === tabName;
            if (isTarget) {
                btn.className = 'mobile-nav-btn flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 active-mobile transition-all duration-150';
            } else {
                btn.className = 'mobile-nav-btn flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant transition-all rounded-lg';
            }
        });

        // Update Title Header
        const titles = {
            'dashboard': 'Resumen General',
            'accounts': 'Mis Billeteras',
            'payments': 'Vencimientos y Servicios',
            'integrations': 'Integraciones y APIs',
            'settings': 'Configuración de Cuenta'
        };
        document.getElementById('view-title').textContent = titles[tabName] || 'WealthFlow';
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

        // Show toast animation
        toast.classList.remove('translate-y-24', 'opacity-0');

        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-y-24', 'opacity-0');
        }, 3000);
    }

    // --- Modal Controls ---
    function openModal(modalId) {
        document.getElementById(modalId).classList.remove('hidden');
    }

    function closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
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
    document.getElementById('form-add-funds').addEventListener('submit', (e) => {
        e.preventDefault();
        const dest = document.getElementById('add-destination').value;
        const amount = parseFloat(document.getElementById('add-amount').value);

        if (isNaN(amount) || amount <= 0) return;

        // Update Wallet
        state.wallets[dest] += amount;

        // Add Transaction record
        state.transactions.unshift({
            id: Date.now(),
            type: 'incoming',
            title: `Carga de fondos (${dest})`,
            amount: amount,
            wallet: dest === 'Galicia' ? 'Banco Galicia' : dest,
            date: 'Hoy • Reciente',
            category: 'Ingreso'
        });

        saveState();
        renderAll();
        closeModal('modal-add');
        showToast(`Cargaste ${formatMoney(amount)} con éxito en ${dest}.`, 'success');
    });

    // Send Money Submit
    document.getElementById('form-send-money').addEventListener('submit', (e) => {
        e.preventDefault();
        const origin = document.getElementById('send-origin').value;
        const recipient = document.getElementById('send-recipient').value.trim();
        const amount = parseFloat(document.getElementById('send-amount').value);
        const concept = document.getElementById('send-concept').value.trim();

        if (isNaN(amount) || amount <= 0) return;

        // Check funds
        const currentBalance = state.wallets[origin];
        if (amount > currentBalance) {
            showToast(`Saldo insuficiente en ${origin} para transferir.`, 'error');
            return;
        }

        // Subtract funds
        state.wallets[origin] -= amount;

        // Add Transaction record
        state.transactions.unshift({
            id: Date.now(),
            type: 'outgoing',
            title: `Transferencia a ${recipient}`,
            amount: amount,
            wallet: origin === 'Galicia' ? 'Banco Galicia' : origin,
            date: 'Hoy • Reciente',
            category: 'Otros',
            note: concept || 'Envío de dinero'
        });

        saveState();
        renderAll();
        closeModal('modal-send');
        showToast(`Enviaste ${formatMoney(amount)} a ${recipient}.`, 'success');
    });

    // Pay Bill Submit
    document.getElementById('form-pay-bill').addEventListener('submit', (e) => {
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

        saveState();
        renderAll();
        closeModal('modal-pay-bill');
        showToast(`Pagaste ${bill.name} de ${formatMoney(bill.amount)} exitosamente.`, 'success');
    });

    // Pay all overdue bills today
    document.getElementById('btn-pay-all-today').addEventListener('click', () => {
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

        saveState();
        renderAll();
        showToast(`Liquidaste todos los vencimientos de hoy (${formatMoney(total)}) desde ${wallet}.`, 'success');
    });

    // --- API Configuration & Copy-paste Actions ---

    // Submit Webhook Config URL
    document.getElementById('api-config-form').addEventListener('submit', (e) => {
        e.preventDefault();
        state.webhookUrl = document.getElementById('api-webhook-url').value.trim();
        saveState();
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

    // --- Onboarding Profile and Settings form ---
    document.getElementById('settings-profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fullname = document.getElementById('settings-fullname').value.trim();
        const alias = document.getElementById('settings-alias').value.trim();

        state.user.name = fullname;
        state.user.alias = alias;
        saveState();

        // Update avatar label text on Sidenav drawer
        document.querySelector('aside .font-bold.truncate').textContent = fullname;
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
        saveState();
    }

    // --- General Render Wrapper ---
    function renderAll() {
        renderBalances();
        renderTransactions();
        renderBills();
        renderLoans();
        renderAnalyticsBreakdown();
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
        openModal('modal-loan');
    });

    // Close Modals
    document.getElementById('btn-close-send').addEventListener('click', () => closeModal('modal-send'));
    document.getElementById('btn-close-add').addEventListener('click', () => closeModal('modal-add'));
    document.getElementById('btn-close-pay-bill').addEventListener('click', () => closeModal('modal-pay-bill'));

    // Clear history in Accounts tab
    document.getElementById('btn-clear-history').addEventListener('click', async () => {
        state.transactions = [];
        await saveState();
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
            await saveState();
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
            
            // Make name/alias fields required in register mode
            document.getElementById('register-name').required = true;
            document.getElementById('register-alias').required = true;
        } else {
            registerFields.classList.add('hidden');
            loginTitle.textContent = 'Iniciar Sesión';
            loginSubtitle.textContent = 'Ingresa a tu cuenta de WealthFlow';
            btnLoginSubmit.textContent = 'Ingresar de forma segura';
            btnToggleAuth.textContent = '¿No tienes cuenta? Regístrate gratis';
            
            document.getElementById('register-name').required = false;
            document.getElementById('register-alias').required = false;
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
                const alias = document.getElementById('register-alias').value;
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // Update Firebase Auth profile
                await userCredential.user.updateProfile({
                    displayName: name
                });

                // Create initial user document in Firestore
                state = JSON.parse(JSON.stringify(DEFAULT_STATE));
                state.isLoggedIn = true;
                state.user.name = name;
                state.user.alias = alias || email.split('@')[0] + ".wallet";
                
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

    // Save new loan
    document.getElementById('form-new-loan').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = document.getElementById('loan-error-msg');
        errorEl.classList.add('hidden');

        const name = document.getElementById('loan-name').value.trim();
        const total = parseFloat(document.getElementById('loan-total').value);
        const quotaCount = parseInt(document.getElementById('loan-quotas').value);
        const quotaType = document.getElementById('loan-quota-type').value;
        const desc = document.getElementById('loan-desc').value.trim();

        if (!name || isNaN(total) || total <= 0 || isNaN(quotaCount) || quotaCount < 1) {
            errorEl.textContent = 'Completa todos los campos correctamente.';
            errorEl.classList.remove('hidden');
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

        if (!state.loans) state.loans = [];
        state.loans.push(newLoan);
        await saveState();
        renderLoans();
        renderMonthlyBalance();
        closeLoanModal();
        showToast(`Préstamo de ${name} guardado.`, 'success');
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

    // Override renderAll to also render monthly balance
    const _originalRenderAll = renderAll;

    // --- Firebase Auth State Listener (Unified Init) ---
    auth.onAuthStateChanged(async (user) => {
        const viewLogin = document.getElementById('view-login');
        const appTabsContainer = document.getElementById('app-tabs-container');
        
        if (user) {
            viewLogin.classList.add('hidden');
            appTabsContainer.classList.remove('hidden');
            
            // Load state from Firestore
            await loadState(user.uid);
            
            // Set user labels on drawer
            document.querySelector('aside .font-bold.truncate').textContent = state.user.name;
            
            // Apply saved theme class to document
            const html = document.documentElement;
            html.className = state.theme || 'light';
            document.getElementById('theme-icon').textContent = state.theme === 'dark' ? 'dark_mode' : 'light_mode';
            
            renderAll();
            renderMonthlyBalance();
            switchTab('dashboard');
        } else {
            // Reset to defaults
            state = JSON.parse(JSON.stringify(DEFAULT_STATE));
            
            viewLogin.classList.remove('hidden');
            appTabsContainer.classList.add('hidden');
            
            // Reset submit button state
            btnLoginSubmit.disabled = false;
            btnLoginSubmit.textContent = isRegisterMode ? 'Registrarse' : 'Ingresar de forma segura';
            
            // Clear input fields
            document.getElementById('login-email').value = '';
            document.getElementById('login-password').value = '';
            if (document.getElementById('register-name')) document.getElementById('register-name').value = '';
            if (document.getElementById('register-alias')) document.getElementById('register-alias').value = '';
        }
    });
});
