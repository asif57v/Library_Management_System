import { getDb } from '../services/db.js';

export const renderTransactions = (container) => {
  container.innerHTML = `
    <h1>Transactions</h1>
    <div class="tabs mt-4" id="txn-tabs">
      <button class="tab-btn active" data-tab="check-availability">Check Availability</button>
      <button class="tab-btn" data-tab="issue-book">Issue Book</button>
      <button class="tab-btn" data-tab="return-book">Return Book</button>
      <button class="tab-btn" data-tab="pay-fine">Pay Fine</button>
    </div>
    <div id="txn-content" class="glass-card"></div>
  `;

  const tabs = document.querySelectorAll('#txn-tabs .tab-btn');
  const content = document.getElementById('txn-content');

  const loadTab = (tabId) => {
    tabs.forEach(t => t.classList.remove('active'));
    // In case tabId is pay-fine, also highlight it
    const activeTabObj = document.querySelector(`[data-tab="${tabId}"]`);
    if(activeTabObj) activeTabObj.classList.add('active');

    if (tabId === 'check-availability') {
      content.innerHTML = renderCheckAvailability();
      bindCheckAvailability();
    } else if (tabId === 'issue-book') {
      content.innerHTML = renderIssueBook();
      bindIssueBook();
    } else if (tabId === 'return-book') {
      content.innerHTML = renderReturnBook(loadTab);
      bindReturnBook(loadTab);
    } else if (tabId === 'pay-fine') {
      content.innerHTML = renderPayFine();
      bindPayFine();
    }
  };

  tabs.forEach(btn => btn.addEventListener('click', (e) => loadTab(e.target.dataset.tab)));
  loadTab('check-availability');
};

const renderCheckAvailability = () => `
  <h3>Check Book Availability</h3>
  <form id="check-avail-form" class="mb-4">
    <div class="form-group">
      <label>Search by Book Name</label>
      <input type="text" id="search-name" class="form-control" placeholder="Book Name">
    </div>
    <div class="form-group">
      <label>Or Select Category</label>
      <select id="search-category" class="form-control">
        <option value="">-- Select Category --</option>
        <option value="fiction">Fiction</option>
        <option value="non-fiction">Non-Fiction</option>
        <option value="science">Science</option>
      </select>
    </div>
    <div id="search-error" class="error-text">Please enter a book name or select a category.</div>
    <button type="submit" class="btn btn-primary">Search</button>
  </form>
  <div id="search-results-container">
    <h4>Search Results</h4>
    <table>
      <thead>
        <tr>
          <th>Book Name</th>
          <th>Author Name</th>
          <th>Status</th>
          <th>Select</th>
        </tr>
      </thead>
      <tbody id="search-results-body">
      </tbody>
    </table>
    <button id="proceed-issue-btn" class="btn btn-secondary mt-4 d-none">Proceed to Issue Book</button>
  </div>
`;

const bindCheckAvailability = () => {
  const tbody = document.getElementById('search-results-body');
  const errorEl = document.getElementById('search-error');
  const proceedBtn = document.getElementById('proceed-issue-btn');

  const renderTable = (books) => {
    tbody.innerHTML = books.map(b => `
      <tr>
        <td>${b.title}</td>
        <td>${b.author}</td>
        <td>${b.status}</td>
        <td>
          <input type="radio" name="select-book" value="${b.id}" ${b.status !== 'available' ? 'disabled' : ''}>
        </td>
      </tr>
    `).join('');

    const radios = document.querySelectorAll('input[name="select-book"]');
    radios.forEach(r => r.addEventListener('change', () => {
      proceedBtn.classList.remove('d-none');
    }));
  };

  // Show all books on initial load
  renderTable(getDb().books);

  document.getElementById('check-avail-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('search-name').value;
    const cat = document.getElementById('search-category').value;
    
    if (!name.trim() && !cat) {
      // If user submitted an empty search, we can reset to show all books instead of throwing error if desired by instructions,
      // but instruction says "message on same page to make valid selection". So we show error.
      errorEl.classList.add('show');
      return;
    }
    errorEl.classList.remove('show');
    
    // Process Search Results
    const db = getDb();
    let results = db.books;
    
    if (name.trim()) {
      const query = name.toLowerCase().trim();
      results = results.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query));
    }
    
    renderTable(results);
    proceedBtn.classList.add('d-none'); // Hide proceed button until a new selection is made
  });

  const btn = document.getElementById('proceed-issue-btn');
  if(btn) {
    btn.addEventListener('click', () => {
      alert("Book selected! Switch to Issue Book tab to proceed.");
    });
  }
};

const renderIssueBook = () => `
  <h3>Issue Book</h3>
  <form id="issue-book-form">
    <div class="form-group">
      <label>Book Name <span class="text-danger">*</span></label>
      <select id="iss-book-id" class="form-control" required>
        <option value="">-- Select Book --</option>
        ${getDb().books.map(b => `<option value="${b.id}">${b.title}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Author Name</label>
      <input type="text" id="iss-author" class="form-control" readonly>
    </div>
    <div class="form-group">
      <label>Issue Date</label>
      <input type="date" id="iss-date" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Return Date (Max 15 days)</label>
      <input type="date" id="iss-return-date" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Remarks</label>
      <textarea id="iss-remarks" class="form-control"></textarea>
    </div>
    <div id="iss-error" class="error-text">Please make a valid selection and complete all mandatory fields. Ensure issue date >= today.</div>
    <button type="submit" class="btn btn-primary">Submit Issue</button>
  </form>
`;

const bindIssueBook = () => {
  const books = getDb().books;
  const bookSelect = document.getElementById('iss-book-id');
  const authorInput = document.getElementById('iss-author');
  const issueDateInput = document.getElementById('iss-date');
  const returnDateInput = document.getElementById('iss-return-date');
  
  const today = new Date().toISOString().split('T')[0];
  issueDateInput.min = today;
  issueDateInput.value = today;
  
  const updateReturnDate = () => {
    if(issueDateInput.value) {
      const issueD = new Date(issueDateInput.value);
      const returnD = new Date(issueD);
      returnD.setDate(issueD.getDate() + 15);
      
      const retString = returnD.toISOString().split('T')[0];
      returnDateInput.value = retString;
      returnDateInput.max = retString;
      returnDateInput.min = issueDateInput.value;
    }
  };
  updateReturnDate();

  issueDateInput.addEventListener('change', updateReturnDate);

  bookSelect.addEventListener('change', (e) => {
    const selected = books.find(b => b.id === e.target.value);
    authorInput.value = selected ? selected.author : '';
  });

  document.getElementById('issue-book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const bId = bookSelect.value;
    const iDate = issueDateInput.value;
    const rDate = returnDateInput.value;

    if (!bId || !iDate || !rDate || iDate < today) {
      document.getElementById('iss-error').classList.add('show');
      return;
    }
    
    const iD = new Date(iDate);
    const rD = new Date(rDate);
    const diffTime = Math.abs(rD - iD);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    if (diffDays > 15 || rD < iD) {
      document.getElementById('iss-error').classList.add('show');
      return;
    }

    document.getElementById('iss-error').classList.remove('show');
    alert("Book issued successfully!");
    e.target.reset();
    issueDateInput.value = today;
    updateReturnDate();
  });
};

const renderReturnBook = () => `
  <h3>Return Book</h3>
  <form id="return-book-form">
    <div class="form-group">
      <label>Book Name <span class="text-danger">*</span></label>
      <select id="ret-book-id" class="form-control" required>
        <option value="">-- Select Book --</option>
        ${getDb().books.map(b => `<option value="${b.id}">${b.title}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Author Name</label>
      <input type="text" id="ret-author" class="form-control" readonly>
    </div>
    <div class="form-group">
      <label>Serial No. <span class="text-danger">*</span></label>
      <input type="text" id="ret-serial" class="form-control" required>
    </div>
    <div class="form-group">
      <label>Issue Date</label>
      <input type="date" id="ret-issue-date" class="form-control" readonly>
    </div>
    <div class="form-group">
      <label>Return Date</label>
      <input type="date" id="ret-return-date" class="form-control" required>
    </div>
    <div id="ret-error" class="error-text">Please make a valid selection and fill all mandatory fields.</div>
    <button type="submit" class="btn btn-primary">Confirm Return</button>
  </form>
`;

const bindReturnBook = (loadTab) => {
  const books = getDb().books;
  const bookSelect = document.getElementById('ret-book-id');
  const authorInput = document.getElementById('ret-author');
  const issueDateInput = document.getElementById('ret-issue-date');
  const returnDateInput = document.getElementById('ret-return-date');
  const serialInput = document.getElementById('ret-serial');

  bookSelect.addEventListener('change', (e) => {
    const selected = books.find(b => b.id === e.target.value);
    if (selected) {
      authorInput.value = selected.author;
      // Mock values for a past issued transaction
      const pastIssueDate = new Date();
      pastIssueDate.setDate(pastIssueDate.getDate() - 10);
      issueDateInput.value = pastIssueDate.toISOString().split('T')[0];
      
      const expectedRetDate = new Date(pastIssueDate);
      expectedRetDate.setDate(expectedRetDate.getDate() + 15);
      returnDateInput.value = expectedRetDate.toISOString().split('T')[0];
      
      serialInput.value = "SN-" + selected.id;
    } else {
      authorInput.value = '';
      issueDateInput.value = '';
      returnDateInput.value = '';
      serialInput.value = '';
    }
  });

  document.getElementById('return-book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bookSelect.value || !serialInput.value || !returnDateInput.value) {
      document.getElementById('ret-error').classList.add('show');
      return;
    }
    document.getElementById('ret-error').classList.remove('show');
    
    // As per instruction: "With the confirm option used the user is taken to the Pay Fine page, irrespective of whether fine is there or not."
    loadTab('pay-fine');
  });
};

const renderPayFine = () => `
  <h3>Pay Fine</h3>
  <form id="pay-fine-form">
    <div class="form-group">
      <label>Book Name</label>
      <input type="text" id="pf-book" class="form-control" value="Mock Returned Book" readonly>
    </div>
    <div class="form-group">
      <label>Author Name</label>
      <input type="text" id="pf-author" class="form-control" value="Mock Author" readonly>
    </div>
    <div class="form-group">
      <label>Serial No.</label>
      <input type="text" id="pf-serial" class="form-control" value="SN-MOCK" readonly>
    </div>
    <div class="form-group">
      <label>Issue Date</label>
      <input type="date" id="pf-issue-date" class="form-control" value="2023-01-01" readonly>
    </div>
    <div class="form-group">
      <label>Return Date</label>
      <input type="date" id="pf-return-date" class="form-control" value="2023-01-16" readonly>
    </div>
    <div class="form-group">
      <label>Actual Return Date</label>
      <input type="date" id="pf-actual-date" class="form-control" value="2023-01-20" readonly>
    </div>
    <div class="form-group">
      <label>Fine Calculated (Rs)</label>
      <!-- Change this value to 0 to simulate NO fine. Leaving it at 50 to simulate PENDING fine. -->
      <input type="number" id="pf-amount" class="form-control" value="50" readonly>
    </div>
    <div class="form-group checkbox-group mb-4">
      <input type="checkbox" id="pf-paid-check">
      <label for="pf-paid-check">Fine Paid</label>
    </div>
    <div class="form-group">
      <label>Remarks</label>
      <textarea id="pf-remarks" class="form-control"></textarea>
    </div>
    <div id="pf-error" class="error-text">Please ensure fine is paid before confirming to complete the transaction.</div>
    <button type="submit" class="btn btn-primary">Confirm</button>
  </form>
`;

const bindPayFine = () => {
  document.getElementById('pay-fine-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('pf-amount').value || "0");
    const isPaid = document.getElementById('pf-paid-check').checked;

    if (amount > 0 && !isPaid) {
      document.getElementById('pf-error').classList.add('show');
      return;
    }
    
    document.getElementById('pf-error').classList.remove('show');
    alert("Transaction successfully completed!");
    // Go to default transactions state or reset
  });
};
