// --- User Data ---
const user = {
  email: 'raymondmorgan859@gmail.com',
  password: 'raymondmorgan859',
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

// --- 2FA (TOTP) Setup and Verification ---
// Lightweight TOTP and QR code generator (for demo)
function base32encode(input) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '', output = '';
  for (let i = 0; i < input.length; i++) bits += input[i].toString(2).padStart(8, '0');
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substr(i, 5);
    if (chunk.length < 5) output += alphabet[parseInt(chunk.padEnd(5, '0'), 2)];
    else output += alphabet[parseInt(chunk, 2)];
  }
  return output;
}
function randomSecret(len = 10) {
  let arr = new Uint8Array(len);
  window.crypto.getRandomValues(arr);
  return base32encode(arr);
}
function leftpad(str, len, pad) { str = String(str); while (str.length < len) str = pad + str; return str; }
function dec2hex(s) { return (s < 15.5 ? '0' : '') + Math.round(s).toString(16); }
function hex2dec(s) { return parseInt(s, 16); }
function base32tohex(base32) {
  let base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567", bits = "", hex = "";
  for (let i = 0; i < base32.length; i++) {
    let val = base32chars.indexOf(base32.charAt(i).toUpperCase());
    bits += leftpad(val.toString(2), 5, '0');
  }
  for (let i = 0; i + 4 <= bits.length; i += 4) {
    let chunk = bits.substr(i, 4);
    hex = hex + parseInt(chunk, 2).toString(16);
  }
  return hex;
}
function getTOTP(secret) {
  let epoch = Math.round(new Date().getTime() / 1000.0);
  let time = leftpad(dec2hex(Math.floor(epoch / 30)), 16, '0');
  let key = base32tohex(secret);
  let hmacObj = new jsSHA('SHA-1', 'HEX');
  hmacObj.setHMACKey(key, 'HEX');
  hmacObj.update(time);
  let hmac = hmacObj.getHMAC('HEX');
  let offset = hex2dec(hmac.substring(hmac.length - 1));
  let otp = (hex2dec(hmac.substr(offset * 2, 8)) & hex2dec('7fffffff')) + '';
  otp = otp.substr(otp.length - 6, 6);
  return otp;
}
// Minimal QR code generator (using Google Charts API for demo)
function renderQRCode(data, el) {
  el.innerHTML = `<img src="https://chart.googleapis.com/chart?cht=qr&chs=180x180&chl=${encodeURIComponent(data)}" alt="QR Code">`;
}

// --- Login Logic ---
if (document.getElementById('loginForm')) {
  document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    const storedPass = localStorage.getItem('chase_user_password') || user.password;
    if (email === user.email && password === storedPass) {
      // 2FA check
      if (localStorage.getItem('chase_2fa_enabled') === '1') {
        // Show 2FA prompt
        show2FAPrompt(() => {
          localStorage.setItem('chase_logged_in', '1');
          recordLoginEvent();
          window.location.href = 'dashboard.html';
        }, errorDiv);
      } else {
        localStorage.setItem('chase_logged_in', '1');
        recordLoginEvent();
        window.location.href = 'dashboard.html';
      }
    } else {
      errorDiv.textContent = 'Invalid email or password.';
    }
  });
}

// Record login event
function recordLoginEvent() {
  const now = new Date();
  const date = now.toLocaleDateString();
  const time = now.toLocaleTimeString();
  // Device info
  const device = navigator.userAgent;
  // Simulated location/IP (for demo)
  const location = 'Los Angeles, USA';
  const ip = '192.0.2.' + Math.floor(Math.random() * 100 + 10); // random demo IP
  const entry = { date, time, device, location, ip };
  let history = JSON.parse(localStorage.getItem('chase_login_history') || '[]');
  history.unshift(entry);
  if (history.length > 10) history = history.slice(0, 10); // keep last 10
  localStorage.setItem('chase_login_history', JSON.stringify(history));
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
  const profilePhotoPreview = document.getElementById('profilePhotoPreview');
  const profilePhotoInput = document.getElementById('profilePhoto');
  const changePhotoBtn = document.getElementById('changePhotoBtn');

  // Load photo from localStorage if available
  const savedPhoto = localStorage.getItem('chase_profile_photo');
  if (savedPhoto) {
    profilePhotoPreview.src = savedPhoto;
  }

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
    changePhotoBtn.style.display = 'inline-block';
  });

  // Change photo button
  changePhotoBtn.addEventListener('click', () => {
    profilePhotoInput.click();
  });

  // Preview selected photo
  profilePhotoInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profilePhotoPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Cancel Edit Button Click
  cancelEditBtn.addEventListener('click', () => {
    formInputs.forEach(input => {
      input.setAttribute('readonly', true);
      input.value = user[input.name];
    });
    formActions.style.display = 'none';
    editProfileBtn.style.display = 'block';
    changePhotoBtn.style.display = 'none';
    // Reset photo preview
    if (savedPhoto) {
      profilePhotoPreview.src = savedPhoto;
    } else {
      profilePhotoPreview.src = 'https://ui-avatars.com/api/?name=Raymond+Morgan&background=117aca&color=fff&size=128';
    }
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
    // Save photo if changed
    if (profilePhotoInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        localStorage.setItem('chase_profile_photo', e.target.result);
        profilePhotoPreview.src = e.target.result;
      };
      reader.readAsDataURL(profilePhotoInput.files[0]);
    }
    // Update welcome message
    document.querySelector('.balance-section h2').textContent = `Welcome, ${user.name}`;
    // Reset form to readonly
    formInputs.forEach(input => input.setAttribute('readonly', true));
    formActions.style.display = 'none';
    editProfileBtn.style.display = 'block';
    changePhotoBtn.style.display = 'none';
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

  // Security Section: Password Change
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const current = document.getElementById('currentPassword').value;
      const newPass = document.getElementById('newPassword').value;
      const confirm = document.getElementById('confirmNewPassword').value;
      const msgDiv = document.getElementById('passwordChangeMsg');
      msgDiv.textContent = '';
      // Validate current password
      const storedPass = localStorage.getItem('chase_user_password') || user.password;
      if (current !== storedPass) {
        msgDiv.textContent = 'Current password is incorrect.';
        return;
      }
      // Validate new password match
      if (newPass !== confirm) {
        msgDiv.textContent = 'New passwords do not match.';
        return;
      }
      // Validate new password length
      if (newPass.length < 8) {
        msgDiv.textContent = 'New password must be at least 8 characters.';
        return;
      }
      // Update password
      user.password = newPass;
      localStorage.setItem('chase_user_password', newPass);
      msgDiv.style.color = 'var(--chase-green)';
      msgDiv.textContent = 'Password changed successfully!';
      changePasswordForm.reset();
      setTimeout(() => { msgDiv.textContent = ''; msgDiv.style.color = ''; }, 3000);
    });
  }

  // Security Section: Login History
  const loginHistoryTableBody = document.getElementById('loginHistoryTableBody');
  if (loginHistoryTableBody) {
    const history = JSON.parse(localStorage.getItem('chase_login_history') || '[]');
    loginHistoryTableBody.innerHTML = history.map(entry => `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.time}</td>
        <td>${entry.device.split(') ')[0]})</td>
        <td>${entry.location}</td>
        <td>${entry.ip}</td>
      </tr>
    `).join('');
  }

  // 2FA Setup UI Logic
  const twofaStatus = document.getElementById('twofa-status');
  const twofaSetup = document.getElementById('twofa-setup');
  const twofaSecretSpan = document.getElementById('twofa-secret');
  const twofaEnableBtn = document.getElementById('twofa-enable-btn');
  const twofaDisableArea = document.getElementById('twofa-disable-area');
  const twofaDisableBtn = document.getElementById('twofa-disable-btn');
  const twofaQRCode = document.getElementById('twofa-qrcode');

  function show2FAStatus() {
    const enabled = localStorage.getItem('chase_2fa_enabled') === '1';
    if (enabled) {
      twofaStatus.innerHTML = '<span style="color:var(--chase-green);font-weight:600;">2FA is enabled on your account.</span>';
      twofaSetup.style.display = 'none';
      twofaDisableArea.style.display = 'block';
    } else {
      twofaStatus.innerHTML = '<span style="color:var(--chase-red);font-weight:600;">2FA is not enabled.</span>';
      twofaSetup.style.display = 'block';
      twofaDisableArea.style.display = 'none';
    }
  }

  // Generate or load secret
  let secret = localStorage.getItem('chase_2fa_secret');
  if (!secret) {
    secret = randomSecret(10);
    localStorage.setItem('chase_2fa_secret', secret);
  }
  twofaSecretSpan.textContent = secret;
  // otpauth URL for QR code
  const otpauth = `otpauth://totp/Chase:RaymondMorgan?secret=${secret}&issuer=Chase`;
  renderQRCode(otpauth, twofaQRCode);

  show2FAStatus();

  twofaEnableBtn.onclick = function() {
    localStorage.setItem('chase_2fa_enabled', '1');
    show2FAStatus();
    alert('2FA enabled! Please use your authenticator app to get your code when logging in.');
  };
  twofaDisableBtn.onclick = function() {
    localStorage.setItem('chase_2fa_enabled', '0');
    show2FAStatus();
    alert('2FA disabled.');
  };

  // Support Form Submission
  const supportForm = document.getElementById('supportForm');
  const supportFormMsg = document.getElementById('supportFormMsg');
  const supportTicketsTableBody = document.getElementById('supportTicketsTableBody');
  if (supportForm) {
    supportForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('supportName').value.trim();
      const email = document.getElementById('supportEmail').value.trim();
      const subject = document.getElementById('supportSubject').value.trim();
      const message = document.getElementById('supportMessage').value.trim();
      const fileInput = document.getElementById('supportFile');
      let fileName = '';
      if (fileInput.files[0]) fileName = fileInput.files[0].name;
      if (!name || !email || !subject || !message) {
        supportFormMsg.textContent = 'Please fill in all required fields.';
        return;
      }
      // Store ticket in localStorage
      let tickets = JSON.parse(localStorage.getItem('chase_support_tickets') || '[]');
      tickets.unshift({
        date: new Date().toLocaleDateString(),
        subject,
        status: 'Open',
        name,
        email,
        message,
        file: fileName
      });
      if (tickets.length > 10) tickets = tickets.slice(0, 10);
      localStorage.setItem('chase_support_tickets', JSON.stringify(tickets));
      supportForm.reset();
      supportFormMsg.style.color = 'var(--chase-green)';
      supportFormMsg.textContent = 'Support request submitted! Our team will contact you soon.';
      renderSupportTickets();
      setTimeout(() => { supportFormMsg.textContent = ''; supportFormMsg.style.color = ''; }, 3000);
    });
  }
  function renderSupportTickets() {
    if (!supportTicketsTableBody) return;
    const tickets = JSON.parse(localStorage.getItem('chase_support_tickets') || '[]');
    supportTicketsTableBody.innerHTML = tickets.map(t => `
      <tr>
        <td>${t.date}</td>
        <td>${t.subject}</td>
        <td>${t.status}</td>
      </tr>
    `).join('');
  }
  renderSupportTickets();
  // Support Live Chat
  const supportChatWidget = document.getElementById('supportChatWidget');
  if (supportChatWidget) {
    supportChatWidget.innerHTML = `
      <div style="color:#888;">Live chat is available 24/7.<br>How can we help you?</div>
      <input type="text" id="supportChatInput" placeholder="Type your message..." style="width:90%;margin-top:0.5rem;">
      <button id="supportChatSendBtn" style="margin-top:0.5rem;">Send</button>
      <div id="supportChatHistory" style="margin-top:0.7rem;"></div>
    `;
    let supportChatHistory = JSON.parse(localStorage.getItem('chase_support_chat') || '[]');
    document.getElementById('supportChatSendBtn').onclick = function() {
      const input = document.getElementById('supportChatInput');
      if (input.value.trim()) {
        supportChatHistory.push({user: true, msg: input.value});
        supportChatHistory.push({user: false, msg: 'Thank you for contacting support. A representative will be with you shortly.'});
        localStorage.setItem('chase_support_chat', JSON.stringify(supportChatHistory));
        renderSupportChat();
        input.value = '';
      }
    };
    function renderSupportChat() {
      const div = document.getElementById('supportChatHistory');
      div.innerHTML = supportChatHistory.map(c => `<div style="margin-bottom:0.3rem;color:${c.user ? '#117aca' : '#333'};">${c.user ? 'You: ' : 'Support: '}${c.msg}</div>`).join('');
    }
    renderSupportChat();
  }
}

// 2FA Prompt
function show2FAPrompt(onSuccess, errorDiv) {
  let code = prompt('Enter the 6-digit code from your authenticator app:');
  if (!code) {
    errorDiv.textContent = '2FA code required.';
    return;
  }
  const secret = localStorage.getItem('chase_2fa_secret');
  // Use jsSHA for HMAC (must be loaded in HTML)
  try {
    if (getTOTP(secret) === code) {
      onSuccess();
    } else {
      errorDiv.textContent = 'Invalid 2FA code.';
    }
  } catch {
    errorDiv.textContent = '2FA verification error.';
  }
}

// --- International Transfer Logic ---
const transferType = document.getElementById('transferType');
const internationalFields = document.getElementById('internationalFields');
const recipientCountry = document.getElementById('recipientCountry');
const foreignCurrency = document.getElementById('foreignCurrency');
const exchangeRateInput = document.getElementById('exchangeRate');
const currencyMap = {
  GB: { currency: 'GBP', rate: 0.8 },
  EU: { currency: 'EUR', rate: 0.93 },
  JP: { currency: 'JPY', rate: 155.2 },
  CA: { currency: 'CAD', rate: 1.36 },
  NG: { currency: 'NGN', rate: 1450 },
  IN: { currency: 'INR', rate: 83.5 },
  CN: { currency: 'CNY', rate: 7.2 },
  MX: { currency: 'MXN', rate: 17.1 }
};
if (transferType) {
  transferType.addEventListener('change', function() {
    if (this.value === 'international') {
      internationalFields.style.display = 'block';
      setInternationalFields();
    } else {
      internationalFields.style.display = 'none';
    }
  });
}
if (recipientCountry) {
  recipientCountry.addEventListener('change', setInternationalFields);
}
function setInternationalFields() {
  const val = recipientCountry.value;
  if (currencyMap[val]) {
    foreignCurrency.value = currencyMap[val].currency;
    exchangeRateInput.value = `1 USD = ${currencyMap[val].rate} ${currencyMap[val].currency}`;
  } else {
    foreignCurrency.value = '';
    exchangeRateInput.value = '';
  }
}
// Set initial values
if (transferType && transferType.value === 'international') setInternationalFields();

// --- Update Transfer Submission ---
function handleTransfer(event) {
  event.preventDefault();
  const type = transferType.value;
  const fromAccount = document.getElementById('fromAccount').value;
  const toAccount = document.getElementById('toAccount').value;
  const amount = parseFloat(document.getElementById('transferAmount').value);
  const note = document.getElementById('transferNote').value;
  let currency = 'USD';
  let rate = '';
  let country = '';
  if (type === 'international') {
    country = recipientCountry.options[recipientCountry.selectedIndex].text;
    currency = foreignCurrency.value;
    rate = exchangeRateInput.value;
  }
  if (fromAccount === toAccount && type === 'domestic') {
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
    <td>${type === 'international' ? 'International' : 'Domestic'}</td>
    <td>${fromAccount}</td>
    <td>${type === 'international' ? country : toAccount}</td>
    <td>$${amount.toFixed(2)}</td>
    <td>${currency}</td>
    <td>${rate}</td>
    <td class="status-pending">Pending</td>
  `;
  transfersTable.insertBefore(newRow, transfersTable.firstChild);
  // Update balance
  updateBalance(fromAccount, -amount);
  showNotification('Transfer initiated successfully', 'success');
  event.target.reset();
  internationalFields.style.display = 'none';
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