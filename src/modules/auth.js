import { authUser, registerUser } from '../services/db.js';
import { renderDashboard } from './dashboard.js';

export const renderLogin = () => {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="auth-container">
      <div class="glass-card" style="width: 400px; max-width: 90%;">
        <div id="auth-header" class="text-center mb-4">
          <h1 style="color: var(--primary-color)">Library System</h1>
          <p class="text-muted" id="auth-subtitle">Sign in to your account</p>
        </div>
        
        <!-- Login Form -->
        <form id="login-form">
          <div class="form-group">
            <label>User ID</label>
            <input type="text" id="userid" class="form-control" placeholder="Enter User ID (admin or user)" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="password" class="form-control" placeholder="Enter Password" required>
          </div>
          <div id="login-error" class="error-text text-center">Invalid ID or password</div>
          <button type="submit" class="btn btn-primary mt-4">Login</button>
          <div class="text-center mt-4">
            <span class="text-muted" style="font-size: 0.875rem">Don't have an account? <a href="#" id="show-signup" style="color: var(--primary-color); text-decoration: none;">Sign up</a></span>
          </div>
        </form>

        <!-- Signup Form -->
        <form id="signup-form" class="d-none">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="reg-name" class="form-control" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label>Choose a User ID</label>
            <input type="text" id="reg-userid" class="form-control" placeholder="Choose a unique ID" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" id="reg-password" class="form-control" placeholder="Create a Password" required>
          </div>
          <div id="signup-error" class="error-text text-center">User ID already exists</div>
          <div id="signup-success" class="alert alert-success d-none text-center" style="margin-top: 1rem">Account created successfully!</div>
          <button type="submit" class="btn btn-primary mt-4">Create Account</button>
          <div class="text-center mt-4">
            <span class="text-muted" style="font-size: 0.875rem">Already have an account? <a href="#" id="show-login" style="color: var(--primary-color); text-decoration: none;">Log in</a></span>
          </div>
        </form>
      </div>
    </div>
  `;

  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const subtitle = document.getElementById('auth-subtitle');

  document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.add('d-none');
    signupForm.classList.remove('d-none');
    subtitle.innerText = "Create a new account";
  });

  document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.add('d-none');
    loginForm.classList.remove('d-none');
    subtitle.innerText = "Sign in to your account";
  });

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('userid').value;
    const pass = document.getElementById('password').value;
    
    const user = authUser(id, pass);
    if (user) {
      renderDashboard();
    } else {
      document.getElementById('login-error').classList.add('show');
    }
  });

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const id = document.getElementById('reg-userid').value;
    const pass = document.getElementById('reg-password').value;
    
    const res = registerUser(id, name, pass);
    if (res.success) {
      document.getElementById('signup-error').classList.remove('show');
      document.getElementById('signup-success').classList.remove('d-none');
      setTimeout(() => {
        // Auto login
        authUser(id, pass);
        renderDashboard();
      }, 1500);
    } else {
      document.getElementById('signup-error').classList.add('show');
      document.getElementById('signup-error').innerText = res.message;
    }
  });
};
