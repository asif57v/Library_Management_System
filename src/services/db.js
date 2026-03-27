const DB_KEY = 'library_db';

const defaultData = {
  users: [
    { id: 'admin', name: 'Admin User', role: 'admin', password: 'adminpassword' },
    { id: 'user', name: 'Regular User', role: 'user', password: 'userpassword' }
  ],
  memberships: [],
  books: [
    { id: '1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', type: 'book', status: 'available' },
    { id: '2', title: 'Inception', author: 'Christopher Nolan', type: 'movie', status: 'available' },
    { id: '3', title: 'To Kill a Mockingbird', author: 'Harper Lee', type: 'book', status: 'available' }
  ],
  transactions: [],
  currentUser: null
};

export const getDb = () => {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(data);
};

export const saveDb = (data) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const authUser = (id, password) => {
  const db = getDb();
  const user = db.users.find(u => u.id === id && u.password === password);
  if (user) {
    db.currentUser = user;
    saveDb(db);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  const db = getDb();
  db.currentUser = null;
  saveDb(db);
};

export const getCurrentUser = () => {
  return getDb().currentUser;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const registerUser = (id, name, password) => {
  const db = getDb();
  if (db.users.find(u => u.id === id)) {
    return { success: false, message: 'User ID already exists' };
  }
  const newUser = { id, name, role: 'user', password };
  db.users.push(newUser);
  saveDb(db);
  return { success: true, user: newUser };
};

export const addBook = (title, author, type) => {
  const db = getDb();
  const newBook = {
    id: generateId(),
    title,
    author,
    type,
    status: 'available'
  };
  db.books.push(newBook);
  saveDb(db);
  return newBook;
};
