import { getDb, issueBook } from '../services/db.js';

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

  const loadTab = async (tabId) => {
    tabs.forEach(t => t.classList.remove('active'));
    const activeTabObj = document.querySelector(`[data-tab="${tabId}"]`);
    if(activeTabObj) activeTabObj.classList.add('active');

    content.innerHTML = `<div class="text-center mt-4"><p>Loading data...</p></div>`;

    try {
      if (tabId === 'check-availability') {
        content.innerHTML = renderCheckAvailabilityHtml();
        await bindCheckAvailability();
      } else if (tabId === 'issue-book') {
        const db = await getDb();
        content.innerHTML = renderIssueBookHtml(db.books);
        bindIssueBook(db.books);
      } else if (tabId === 'return-book') {
        const db = await getDb();
        content.innerHTML = renderReturnBookHtml(db.books);
        bindReturnBook(loadTab, db.books);
      } else if (tabId === 'pay-fine') {
        content.innerHTML = renderPayFineHtml();
        bindPayFine();
      }
    } catch (err) {
      content.innerHTML = `<div class="error-text text-center mt-4">Failed to load data. Is the backend running?</div>`;
    }
  };

  tabs.forEach(btn => btn.addEventListener('click', (e) => loadTab(e.target.dataset.tab)));
  loadTab('check-availability');
};

const renderCheckAvailabilityHtml = () => `
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

const bindCheckAvailability = async () => {
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

  const dbInit = await getDb();
  renderTable(dbInit.books);

  document.getElementById('check-avail-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('search-name').value;
    const cat = document.getElementById('search-category').value;
    
    if (!name.trim() && !cat) {
      errorEl.classList.add('show');
      return;
    }
    errorEl.classList.remove('show');
    
    const db = await getDb();
    let results = db.books;
    
    if (name.trim()) {
      const query = name.toLowerCase().trim();
      results = results.filter(b => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query));
    }
    
    renderTable(results);
    proceedBtn.classList.add('d-none');
  });

  if(proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      alert("Book selected! Switch to Issue Book tab to proceed.");
    });
  }
};

const renderIssueBookHtml = (books) => `
  <h3>Issue Book</h3>
  <form id="issue-book-form">
    <div class="form-group">
      <label>Book Name <span class="text-danger">*</span></label>
      <select id="iss-book-id" class="form-control" required>
        <option value="">-- Select Book --</option>
        ${books.map(b => `<option value="${b.id}" ${b.status !== 'available' ? 'disabled' : ''}>${b.title} ${b.status !== 'available' ? '(Issued)' : ''}</option>`).join('')}
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
    <div id="iss-success" class="alert alert-success d-none mt-2">Book issued successfully!</div>
    <button type="submit" class="btn btn-primary mt-4">Submit Issue</button>
  </form>
`;

const bindIssueBook = (books) => {
  const bookSelect = document.getElementById('iss-book-id');
  const authorInput = document.getElementById('iss-author');
  const issueDateInput = document.getElementById('iss-date');
  const returnDateInput = document.getElementById('iss-return-date');
  const remarksInput = document.getElementById('iss-remarks');
  
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

  document.getElementById('issue-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const bId = bookSelect.value;
    const iDate = issueDateInput.value;
    const rDate = returnDateInput.value;
    const remarks = remarksInput.value;

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
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    await issueBook(bId, currentUser.id, iDate, rDate, remarks);

    document.getElementById('iss-success').classList.remove('d-none');
    e.target.reset();
    issueDateInput.value = today;
    updateReturnDate();
  });
};

const renderReturnBookHtml = (books) => `
  <h3>Return Book</h3>
  <form id="return-book-form">
    <div class="form-group">
      <label>Book Name <span class="text-danger">*</span></label>
      <select id="ret-book-id" class="form-control" required>
        <option value="">-- Select Book --</option>
        ${books.map(b => `<option value="${b.id}">${b.title}</option>`).join('')}
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

const bindReturnBook = (loadTab, books) => {
  const bookSelect = document.getElementById('ret-book-id');
  const authorInput = document.getElementById('ret-author');
  const issueDateInput = document.getElementById('ret-issue-date');
  const returnDateInput = document.getElementById('ret-return-date');
  const serialInput = document.getElementById('ret-serial');

  bookSelect.addEventListener('change', (e) => {
    const selected = books.find(b => b.id === e.target.value);
    if (selected) {
      authorInput.value = selected.author;
      // Mock past issued transaction
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
    loadTab('pay-fine');
  });
};

const renderPayFineHtml = () => `
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
      <label>Fine Calculated (Rs)</label>
      <input type="number" id="pf-amount" class="form-control" value="50" readonly>
    </div>
    <div class="form-group checkbox-group mb-4">
      <input type="checkbox" id="pf-paid-check">
      <label for="pf-paid-check">Fine Paid</label>
    </div>
    <div id="pf-error" class="error-text">Please ensure fine is paid before confirming.</div>
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
  });
};
