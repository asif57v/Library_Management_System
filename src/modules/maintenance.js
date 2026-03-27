import { addBook } from '../services/db.js';

export const renderMaintenance = (container) => {
  container.innerHTML = `
    <h1>Maintenance</h1>
    <div class="tabs mt-4" id="main-tabs">
      <button class="tab-btn active" data-tab="add-membership">Add Membership</button>
      <button class="tab-btn" data-tab="update-membership">Update Membership</button>
      <button class="tab-btn" data-tab="add-book">Add Book/Movie</button>
      <button class="tab-btn" data-tab="update-book">Update Book/Movie</button>
      <button class="tab-btn" data-tab="user-mgmt">User Management</button>
    </div>
    <div id="maintenance-content" class="glass-card"></div>
  `;

  const tabs = document.querySelectorAll('#main-tabs .tab-btn');
  const content = document.getElementById('maintenance-content');

  const loadTab = (tabId) => {
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    if (tabId === 'add-membership') {
      content.innerHTML = renderAddMembership();
      bindAddMembership();
    } else if (tabId === 'update-membership') {
      content.innerHTML = renderUpdateMembership();
      bindUpdateMembership();
    } else if (tabId === 'add-book') {
      content.innerHTML = renderAddBook();
      bindAddBook();
    } else if (tabId === 'update-book') {
      content.innerHTML = renderUpdateBook();
      bindUpdateBook();
    } else if (tabId === 'user-mgmt') {
      content.innerHTML = renderUserMgmt();
      bindUserMgmt();
    }
  };

  tabs.forEach(btn => btn.addEventListener('click', (e) => loadTab(e.target.dataset.tab)));
  loadTab('add-membership');
};

const renderAddMembership = () => `
  <h3>Add Membership</h3>
  <form id="add-member-form">
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="mem-name" class="form-control" required placeholder="User Name">
    </div>
    <div class="form-group">
      <label>Duration Option</label>
      <div class="radio-group mt-4 mb-4">
        <label><input type="radio" name="duration" value="6" checked> 6 Months</label>
        <label><input type="radio" name="duration" value="12"> 1 Year</label>
        <label><input type="radio" name="duration" value="24"> 2 Years</label>
      </div>
    </div>
    <div id="add-mem-error" class="error-text">Please fill all fields</div>
    <div id="add-mem-success" class="alert alert-success d-none">Membership added successfully!</div>
    <button type="submit" class="btn btn-primary">Add Membership</button>
  </form>
`;

const bindAddMembership = () => {
  document.getElementById('add-member-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('mem-name').value;
    if (!name.trim()) {
      document.getElementById('add-mem-error').classList.add('show');
      return;
    }
    document.getElementById('add-mem-error').classList.remove('show');
    document.getElementById('add-mem-success').classList.remove('d-none');
    e.target.reset();
  });
};

const renderUpdateMembership = () => `
  <h3>Update/Cancel Membership</h3>
  <form id="update-member-form">
    <div class="form-group">
      <label>Membership Number</label>
      <input type="text" id="mem-number" class="form-control" required placeholder="Enter ID to auto-populate">
    </div>
    <div class="form-group">
      <label>Name (Auto-populated)</label>
      <input type="text" id="upd-mem-name" class="form-control" readonly>
    </div>
    <div class="form-group">
      <label>Action</label>
      <div class="radio-group mt-4 mb-4">
        <label><input type="radio" name="mem-action" value="extend" checked> Extend 6 Months</label>
        <label><input type="radio" name="mem-action" value="cancel"> Cancel Membership</label>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Confirm</button>
  </form>
`;

const bindUpdateMembership = () => {
  document.getElementById('mem-number').addEventListener('input', (e) => {
    // mock population
    if (e.target.value.length > 2) {
      document.getElementById('upd-mem-name').value = "Mock Member Name";
    } else {
      document.getElementById('upd-mem-name').value = "";
    }
  });
  document.getElementById('update-member-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert("Membership Updated!");
    e.target.reset();
  });
};

const renderAddBook = () => `
  <h3>Add Book/Movie</h3>
  <form id="add-book-form">
    <div class="form-group">
      <label>Item Type</label>
      <div class="radio-group mt-4 mb-4">
        <label><input type="radio" name="item-type" value="book" checked> Book</label>
        <label><input type="radio" name="item-type" value="movie"> Movie</label>
      </div>
    </div>
    <div class="form-group">
      <label>Title</label>
      <input type="text" id="add-title" class="form-control" placeholder="Title">
    </div>
    <div class="form-group">
      <label>Author / Director</label>
      <input type="text" id="add-author" class="form-control" placeholder="Author/Director">
    </div>
    <div id="add-bk-error" class="error-text">All fields are mandatory. Please complete the form.</div>
    <button type="submit" class="btn btn-primary">Add Item</button>
  </form>
`;

const bindAddBook = () => {
  document.getElementById('add-book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const typeObj = document.querySelector('input[name="item-type"]:checked');
    const type = typeObj ? typeObj.value : 'book';
    const title = document.getElementById('add-title').value;
    const author = document.getElementById('add-author').value;
    if (!title || !author) {
      document.getElementById('add-bk-error').classList.add('show');
      return;
    }
    
    addBook(title, author, type);
    
    document.getElementById('add-bk-error').classList.remove('show');
    alert("Item successfully added");
    e.target.reset();
  });
};

const renderUpdateBook = () => `
  <h3>Update Book/Movie</h3>
  <form id="update-book-form">
    <div class="form-group">
      <label>Item Type</label>
      <div class="radio-group mt-4 mb-4">
        <label><input type="radio" name="upd-item-type" value="book" checked> Book</label>
        <label><input type="radio" name="upd-item-type" value="movie"> Movie</label>
      </div>
    </div>
    <div class="form-group">
      <label>Serial No/ID to Update</label>
      <input type="text" id="upd-item-id" class="form-control" placeholder="Item ID" required>
    </div>
    <div class="form-group">
      <label>New Title</label>
      <input type="text" id="upd-title" class="form-control" placeholder="Leave empty to keep current">
    </div>
    <button type="submit" class="btn btn-primary">Update Item</button>
  </form>
`;

const bindUpdateBook = () => {
  document.getElementById('update-book-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('upd-item-id').value;
    if (!id) {
      alert("Missing ID");
      return;
    }
    alert("Item updated!");
  });
};

const renderUserMgmt = () => `
  <h3>User Management</h3>
  <form id="user-mgmt-form">
    <div class="form-group">
      <label>User Status</label>
      <div class="radio-group mt-4 mb-4">
        <label><input type="radio" name="user-status" value="new" checked> New User</label>
        <label><input type="radio" name="user-status" value="existing"> Existing User</label>
      </div>
    </div>
    <div class="form-group">
      <label>Name (Mandatory)</label>
      <input type="text" id="um-name" class="form-control" required placeholder="User Name">
    </div>
    <div class="form-group">
      <label>Role</label>
      <select id="um-role" class="form-control">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="um-pass" class="form-control" placeholder="Set Password" required>
    </div>
    <button type="submit" class="btn btn-primary">Save User</button>
  </form>
`;

const bindUserMgmt = () => {
  document.getElementById('user-mgmt-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('um-name').value;
    if (!name) {
      alert("Name is mandatory!");
      return;
    }
    alert("User managed successfully");
    e.target.reset();
  });
};
