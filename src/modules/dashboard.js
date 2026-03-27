import { getCurrentUser, logoutUser } from '../services/db.js';
import { renderLogin } from './auth.js';
import { renderMaintenance } from './maintenance.js';
import { renderTransactions } from './transactions.js';
import { renderReports } from './reports.js';

export const renderDashboard = () => {
  const user = getCurrentUser();
  if (!user) {
    renderLogin();
    return;
  }

  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="app-layout">
      <div class="sidebar">
        <h2>Library System</h2>
        <div class="text-muted mb-3" style="font-size: 0.875rem">
          Logged in as: <span class="text-main" style="color:white; font-weight:600">${user.name}</span><br>
          Role: ${user.role}
        </div>
        <nav class="sidebar-nav" id="sidebar-nav">
          ${user.role === 'admin' ? '<button class="nav-link" data-module="maintenance">Maintenance</button>' : ''}
          <button class="nav-link" data-module="transactions">Transactions</button>
          <button class="nav-link" data-module="reports">Reports</button>
        </nav>
        
        <div class="footer-nav">
          <button class="nav-link" id="nav-chart" style="color: var(--primary-color)">View Flow Chart</button>
          <button class="nav-link" id="nav-logout" style="color: var(--danger-color)">Logout</button>
        </div>
      </div>
      <div class="main-content" id="main-content">
        <!-- Module content injected here -->
      </div>
    </div>
  `;

  document.getElementById('nav-logout').addEventListener('click', () => {
    logoutUser();
    renderLogin();
  });

  document.getElementById('nav-chart').addEventListener('click', () => {
     alert("Navigation to Chart flow - Mock feature");
  });

  const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(n => n.classList.remove('active'));
      e.target.classList.add('active');
      const module = e.target.getAttribute('data-module');
      loadModule(module);
    });
  });

  // Load default module
  if (user.role === 'admin') {
    navLinks[0].classList.add('active');
    loadModule('maintenance');
  } else {
    navLinks[0].classList.add('active');
    loadModule('transactions');
  }
};

const loadModule = (moduleName) => {
  const container = document.getElementById('main-content');
  if (moduleName === 'maintenance') {
    renderMaintenance(container);
  } else if (moduleName === 'transactions') {
    renderTransactions(container);
  } else if (moduleName === 'reports') {
    renderReports(container);
  }
};
