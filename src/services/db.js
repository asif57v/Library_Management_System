const API_URL = 'http://localhost:3000/api';

export const getDb = async () => {
  const [usersRes, booksRes, transactionsRes] = await Promise.all([
    fetch(`${API_URL}/users`),
    fetch(`${API_URL}/books`),
    fetch(`${API_URL}/transactions`)
  ]);
  
  const users = await usersRes.json();
  const books = await booksRes.json();
  const transactions = await transactionsRes.json();
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  return { users, books, transactions, currentUser };
};

export const authUser = async (id, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password })
    });
    
    if (res.ok) {
      const user = await res.json();
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
  } catch (err) {
    console.error(err);
  }
  return null;
};

export const registerUser = async (id, name, password) => {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      return { success: true, user: data };
    }
    return { success: false, message: data.error };
  } catch (err) {
    return { success: false, message: 'Server error' };
  }
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const addBook = async (title, author, type) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const res = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, author, type })
  });
  return await res.json();
};

export const updateBook = async (id, title, type) => {
  const res = await fetch(`${API_URL}/books/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, title, type })
  });
  return await res.json();
};

export const updateUser = async (id, name, role, password, isNew) => {
  const res = await fetch(`${API_URL}/users/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, role, password, isNew })
  });
  return await res.json();
};

export const addMembership = async (userId, duration, startDate) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const res = await fetch(`${API_URL}/memberships`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId, duration, startDate })
  });
  return await res.json();
};

export const issueBook = async (bookId, userId, issueDate, returnDate, remarks) => {
  const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
  const res = await fetch(`${API_URL}/transactions/issue`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, bookId, userId, issueDate, returnDate, remarks })
  });
  return await res.json();
};
