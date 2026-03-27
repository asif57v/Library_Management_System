import { getDb } from '../services/db.js';

export const renderReports = (container) => {
  const db = getDb();
  container.innerHTML = `
    <h1>Reports</h1>
    <div class="glass-card mt-4">
      <h3 class="mb-3">Books & Movies Register</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Title</th>
            <th>Author / Director</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${db.books.map(b => `
            <tr>
              <td>${b.id}</td>
              <td>${b.type}</td>
              <td>${b.title}</td>
              <td>${b.author}</td>
              <td><span class="${b.status === 'available' ? 'text-success' : 'text-danger'}">${b.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="glass-card mt-4">
      <h3 class="mb-3">User Directory</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${db.users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${u.name}</td>
              <td>${u.role}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
};
