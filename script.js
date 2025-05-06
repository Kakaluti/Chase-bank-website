// --- User Data ---
const user = {
  email: 'raymondmorgan859@gmail.com',
  password: 'raymondmorgan80!',
  name: 'Raymond Morgan',
  age: 44,
  address: '1200 Chase Ave, Dallas, TX 75201',
  phone: '+1 (214) 555-0198',
  balance: 3129445.66,
  transactions: [
    { date: '2025-04-18', desc: 'Direct Deposit - Employer', type: 'Credit', amount: 12000.00 },
    { date: '2025-04-16', desc: 'Online Transfer to Savings', type: 'Debit', amount: 5000.00 },
    { date: '2025-04-15', desc: 'Amazon.com Purchase', type: 'Debit', amount: 249.99 },
    { date: '2025-04-14', desc: 'Starbucks', type: 'Debit', amount: 6.45 },
    { date: '2025-04-13', desc: 'ATM Withdrawal', type: 'Debit', amount: 400.00 },
    { date: '2025-04-12', desc: 'Zelle: John Smith', type: 'Debit', amount: 1500.00 },
    { date: '2025-04-10', desc: 'Chase Credit Card Payment', type: 'Debit', amount: 3200.00 },
    { date: '2025-04-09', desc: 'Uber Ride', type: 'Debit', amount: 23.80 },
    { date: '2025-04-08', desc: 'Interest Payment', type: 'Credit', amount: 45.66 },
    { date: '2025-04-07', desc: 'Whole Foods', type: 'Debit', amount: 187.34 },
    { date: '2025-04-06', desc: 'Netflix', type: 'Debit', amount: 19.99 },
    { date: '2025-04-05', desc: 'Apple Store', type: 'Debit', amount: 999.00 },
    { date: '2025-04-04', desc: 'Direct Deposit - Employer', type: 'Credit', amount: 12000.00 },
    { date: '2025-04-03', desc: 'Transfer from Brokerage', type: 'Credit', amount: 25000.00 },
    { date: '2025-04-02', desc: 'Southwest Airlines', type: 'Debit', amount: 420.00 },
    { date: '2025-04-01', desc: 'Shell Gas', type: 'Debit', amount: 62.50 },
  ],
  notifications: [
    'Your statement for April 2025 is now available.',
    'A new device was used to sign in.',
    'Your bill pay for $3200.00 was successful.',
    'You received a direct deposit of $12,000.00.',
    'Scheduled transfer to savings completed.'
  ]
};

// --- Login Logic ---
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    if (email === user.email && password === user.password) {
      localStorage.setItem('chase_logged_in', '1');
      window.location.href = 'dashboard.html';
    } else {
      errorDiv.textContent = 'Invalid email or password.';
    }
  });
}

// --- Dashboard Logic ---
if (window.location.pathname.endsWith('dashboard.html')) {
  // Auth check
  if (localStorage.getItem('chase_logged_in') !== '1') {
    window.location.href = 'index.html';
  }

  // Balance
  document.getElementById('balance').textContent = `$${user.balance.toLocaleString('en-US', {minimumFractionDigits:2})}`;

  // Transactions
  const tbody = document.querySelector('#transactionsTable tbody');
  let runningBalance = user.balance;
  const txs = user.transactions.map(tx => ({...tx})).sort((a, b) => b.date.localeCompare(a.date));
  txs.forEach(tx => {
    const tr = document.createElement('tr');
    let amountClass = tx.type === 'Credit' ? 'credit' : 'debit';
    let sign = tx.type === 'Credit' ? '+' : '-';
    // For running balance, subtract debits, add credits (reverse order)
    tr.innerHTML = `
      <td>${tx.date}</td>
      <td>${tx.desc}</td>
      <td>${tx.type}</td>
      <td class="${amountClass}">${sign}$${tx.amount.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
      <td>$${runningBalance.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
    `;
    tbody.appendChild(tr);
    runningBalance -= tx.type === 'Debit' ? tx.amount : -tx.amount;
  });

  // Notifications
  const notifList = document.getElementById('notificationsList');
  user.notifications.forEach(msg => {
    const li = document.createElement('li');
    li.textContent = msg;
    notifList.appendChild(li);
  });

  // Currency Converter Widget
  const currencyWidget = document.getElementById('currencyWidget');
  currencyWidget.innerHTML = `
    <input type="number" id="usdAmount" placeholder="USD" min="0" step="0.01" style="width:90px;"> 
    <select id="currencySelect">
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
      <option value="JPY">JPY</option>
      <option value="CAD">CAD</option>
    </select>
    <button id="convertBtn">Convert</button>
    <div id="conversionResult" style="margin-top:0.7rem;font-weight:500;"></div>
  `;
  document.getElementById('convertBtn').onclick = function() {
    const rates = { EUR: 0.93, GBP: 0.8, JPY: 155.2, CAD: 1.36 };
    const amt = parseFloat(document.getElementById('usdAmount').value);
    const cur = document.getElementById('currencySelect').value;
    if (!isNaN(amt) && amt > 0) {
      const res = amt * rates[cur];
      document.getElementById('conversionResult').textContent = `${amt.toLocaleString('en-US', {minimumFractionDigits:2})} USD = ${res.toLocaleString('en-US', {minimumFractionDigits:2})} ${cur}`;
    } else {
      document.getElementById('conversionResult').textContent = '';
    }
  };

  // Live Chat Widget (stub)
  const chatWidget = document.getElementById('chatWidget');
  chatWidget.innerHTML = `
    <div style="color:#888;">Live chat is available 24/7.<br>How can we help you today?</div>
    <input type="text" id="chatInput" placeholder="Type your message..." style="width:90%;margin-top:0.5rem;">
    <button id="chatSendBtn" style="margin-top:0.5rem;">Send</button>
    <div id="chatHistory" style="margin-top:0.7rem;"></div>
  `;
  let chatHistory = [];
  document.getElementById('chatSendBtn').onclick = function() {
    const input = document.getElementById('chatInput');
    if (input.value.trim()) {
      chatHistory.push({user: true, msg: input.value});
      chatHistory.push({user: false, msg: 'Thank you for contacting Chase. A representative will be with you shortly.'});
      renderChat();
      input.value = '';
    }
  };
  function renderChat() {
    const div = document.getElementById('chatHistory');
    div.innerHTML = chatHistory.map(c => `<div style="margin-bottom:0.3rem;color:${c.user ? '#117aca' : '#333'};">${c.user ? 'You: ' : 'Chase: '}${c.msg}</div>`).join('');
  }

  // Sidebar navigation (stub)
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.onclick = function() {
      document.querySelectorAll('.sidebar li').forEach(x => x.classList.remove('active'));
      this.classList.add('active');
      // Optionally, show/hide sections based on nav (not implemented for brevity)
    };
  });

  // Logout
  document.querySelector('.logout-link').onclick = function(e) {
    e.preventDefault();
    localStorage.removeItem('chase_logged_in');
    window.location.href = 'index.html';
  };
} 