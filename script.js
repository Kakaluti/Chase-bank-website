// --- User Data ---
const user = {
  email: 'raymondmorgan859@gmail.com',
  password: 'raymondmorgan80!',
  name: 'Raymond Morgan',
  dob: '10/02/1983',
  phone: '+1 601 301 4011',
  address: '3006 5th Ave, Los Angeles, CA 90018',
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

  // Profile Section Management
  const profileForm = document.getElementById('profileForm');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const formActions = document.querySelector('.form-actions');
  const formInputs = profileForm.querySelectorAll('input, textarea');

  // Populate profile form
  document.getElementById('profileName').value = user.name;
  document.getElementById('profileDob').value = user.dob;
  document.getElementById('profilePhone').value = user.phone;
  document.getElementById('profileEmail').value = user.email;
  document.getElementById('profileAddress').value = user.address;

  // Edit Profile Button Click
  editProfileBtn.addEventListener('click', () => {
    formInputs.forEach(input => input.removeAttribute('readonly'));
    formActions.style.display = 'flex';
    editProfileBtn.style.display = 'none';
  });

  // Cancel Edit Button Click
  cancelEditBtn.addEventListener('click', () => {
    formInputs.forEach(input => {
      input.setAttribute('readonly', true);
      // Reset values
      input.value = user[input.name];
    });
    formActions.style.display = 'none';
    editProfileBtn.style.display = 'block';
  });

  // Save Profile Changes
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(profileForm);
    
    // Update user object
    user.name = formData.get('name');
    user.dob = formData.get('dob');
    user.phone = formData.get('phone');
    user.email = formData.get('email');
    user.address = formData.get('address');

    // Update welcome message
    document.querySelector('.balance-section h2').textContent = `Welcome, ${user.name}`;

    // Reset form to readonly
    formInputs.forEach(input => input.setAttribute('readonly', true));
    formActions.style.display = 'none';
    editProfileBtn.style.display = 'block';

    // Show success message
    alert('Profile updated successfully!');
  });

  // Sidebar Navigation
  document.querySelectorAll('.sidebar li').forEach(li => {
    li.addEventListener('click', function() {
      // Update active state
      document.querySelectorAll('.sidebar li').forEach(x => x.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding section
      const sectionId = this.getAttribute('data-section');
      document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
      });
      document.getElementById(`${sectionId}-section`).classList.add('active');
    });
  });

  // Logout
  document.querySelector('.logout-link').onclick = function(e) {
    e.preventDefault();
    localStorage.removeItem('chase_logged_in');
    window.location.href = 'index.html';
  };
}

// Transfer functionality
function handleTransfer(event) {
    event.preventDefault();
    const fromAccount = document.getElementById('fromAccount').value;
    const toAccount = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const note = document.getElementById('transferNote').value;

    if (fromAccount === toAccount) {
        showNotification('Cannot transfer to the same account', 'error');
        return;
    }

    if (amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    // Add to recent transfers
    const transfersTable = document.querySelector('.transfers-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td>${fromAccount}</td>
        <td>${toAccount}</td>
        <td>$${amount.toFixed(2)}</td>
        <td>${note || '-'}</td>
        <td class="status-pending">Pending</td>
    `;
    transfersTable.insertBefore(newRow, transfersTable.firstChild);

    // Update balance
    updateBalance(fromAccount, -amount);
    updateBalance(toAccount, amount);

    showNotification('Transfer initiated successfully', 'success');
    event.target.reset();
}

// Bill Pay functionality
function handleBillPay(event) {
    event.preventDefault();
    const payeeName = document.getElementById('payeeName').value;
    const accountNumber = document.getElementById('accountNumber').value;
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentDate = document.getElementById('paymentDate').value;
    const frequency = document.getElementById('paymentFrequency').value;

    if (amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    // Add to scheduled payments
    const paymentsTable = document.querySelector('.payments-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${payeeName}</td>
        <td>${accountNumber}</td>
        <td>$${amount.toFixed(2)}</td>
        <td>${paymentDate}</td>
        <td>${frequency}</td>
        <td class="status-pending">Scheduled</td>
    `;
    paymentsTable.insertBefore(newRow, paymentsTable.firstChild);

    showNotification('Payment scheduled successfully', 'success');
    event.target.reset();
}

// Deposit functionality
function handleDeposit(event) {
    event.preventDefault();
    const account = document.getElementById('depositAccount').value;
    const amount = parseFloat(document.getElementById('checkAmount').value);
    const frontImage = document.getElementById('checkFront').files[0];
    const backImage = document.getElementById('checkBack').files[0];

    if (!frontImage || !backImage) {
        showNotification('Please upload both sides of the check', 'error');
        return;
    }

    if (amount <= 0) {
        showNotification('Please enter a valid amount', 'error');
        return;
    }

    // Add to recent deposits
    const depositsTable = document.querySelector('.deposits-table tbody');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td>${account}</td>
        <td>$${amount.toFixed(2)}</td>
        <td class="status-pending">Processing</td>
    `;
    depositsTable.insertBefore(newRow, depositsTable.firstChild);

    // Update balance after processing
    setTimeout(() => {
        updateBalance(account, amount);
        newRow.querySelector('td:last-child').className = 'status-completed';
        newRow.querySelector('td:last-child').textContent = 'Completed';
        showNotification('Deposit processed successfully', 'success');
    }, 2000);

    event.target.reset();
}

// Helper function to update account balance
function updateBalance(account, amount) {
    const balanceElement = document.querySelector(`[data-account="${account}"] .account-balance`);
    if (balanceElement) {
        const currentBalance = parseFloat(balanceElement.textContent.replace(/[^0-9.-]+/g, ''));
        const newBalance = currentBalance + amount;
        balanceElement.textContent = `$${newBalance.toFixed(2)}`;
    }
}

// File upload preview
function handleFileUpload(input, previewId) {
    const preview = document.getElementById(previewId);
    const file = input.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.style.display = 'block';
        }
        reader.readAsDataURL(file);
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const transferForm = document.getElementById('transferForm');
    const billPayForm = document.getElementById('billPayForm');
    const depositForm = document.getElementById('depositForm');

    if (transferForm) {
        transferForm.addEventListener('submit', handleTransfer);
    }
    if (billPayForm) {
        billPayForm.addEventListener('submit', handleBillPay);
    }
    if (depositForm) {
        depositForm.addEventListener('submit', handleDeposit);
    }

    // File upload preview handlers
    const checkFront = document.getElementById('checkFront');
    const checkBack = document.getElementById('checkBack');

    if (checkFront) {
        checkFront.addEventListener('change', () => handleFileUpload(checkFront, 'frontPreview'));
    }
    if (checkBack) {
        checkBack.addEventListener('change', () => handleFileUpload(checkBack, 'backPreview'));
    }
}); 