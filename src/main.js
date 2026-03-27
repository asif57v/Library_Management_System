import './style.css';
import { getCurrentUser } from './services/db.js';
import { renderLogin } from './modules/auth.js';
import { renderDashboard } from './modules/dashboard.js';

const app = document.getElementById('app');

const initApp = () => {
  const user = getCurrentUser();
  if (user) {
    renderDashboard();
  } else {
    renderLogin();
  }
};

initApp();
