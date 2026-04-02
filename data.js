// ── SmartReads Data Layer (localStorage) ──

const BOOKS_KEY   = 'lms_books';
const USERS_KEY   = 'lms_users';
const SESSION_KEY = 'lms_session';

// ── BOOKS ──
function getBooks() {
  const d = localStorage.getItem(BOOKS_KEY);
  if (d) return JSON.parse(d);
  const seed = [
    { id: '1', code: 1001, title: 'Introduction to Algorithms', author1: 'Thomas H. Cormen', author2: 'Charles Leiserson', subject: 'Computer Science', tags: 'algorithms,data structures,programming', available: true, borrowedBy: null },
    { id: '2', code: 1002, title: 'Clean Code', author1: 'Robert C. Martin', author2: '', subject: 'Software Engineering', tags: 'coding,best practices,software', available: true, borrowedBy: null },
    { id: '3', code: 1003, title: 'The Great Gatsby', author1: 'F. Scott Fitzgerald', author2: '', subject: 'Literature', tags: 'novel,classic,american literature', available: true, borrowedBy: null },
    { id: '4', code: 1004, title: 'Calculus: Early Transcendentals', author1: 'James Stewart', author2: '', subject: 'Mathematics', tags: 'calculus,math,analysis', available: true, borrowedBy: null },
    { id: '5', code: 1005, title: 'Organic Chemistry', author1: 'Paula Y. Bruice', author2: '', subject: 'Chemistry', tags: 'chemistry,organic,reactions', available: true, borrowedBy: null },
    { id: '6', code: 1006, title: 'Physics for Scientists & Engineers', author1: 'Raymond Serway', author2: 'John Jewett', subject: 'Physics', tags: 'physics,mechanics,electricity', available: true, borrowedBy: null },
  ];
  localStorage.setItem(BOOKS_KEY, JSON.stringify(seed));
  return seed;
}

function saveBooks(books) { localStorage.setItem(BOOKS_KEY, JSON.stringify(books)); }

function addBook(book) {
  const books = getBooks();
  book.id = Date.now().toString();
  book.available = true;
  book.borrowedBy = null;
  books.push(book);
  saveBooks(books);
  return book;
}

function updateBook(id, data) {
  let books = getBooks();
  books = books.map(b => b.id === id ? { ...b, ...data } : b);
  saveBooks(books);
}

function deleteBook(id) {
  // return book to any user who borrowed it
  let users = getUsers();
  users = users.map(u => ({ ...u, borrowedBooks: (u.borrowedBooks || []).filter(bid => bid !== id) }));
  saveUsers(users);
  saveBooks(getBooks().filter(b => b.id !== id));
}

function getBookById(id) { return getBooks().find(b => b.id === id); }

// ── USERS ──
function getUsers() { const d = localStorage.getItem(USERS_KEY); return d ? JSON.parse(d) : []; }
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function registerUser(data) {
  const users = getUsers();
  if (users.find(u => u.email === data.email)) return { error: 'Email already registered' };
  const user = { ...data, id: Date.now().toString(), borrowedBooks: [] };
  users.push(user);
  saveUsers(users);
  return { user };
}

function loginUser(email, password) {
  const users = getUsers();
  return users.find(u => u.email === email && u.password === password) || null;
}

function getUserById(id) { return getUsers().find(u => u.id === id); }

function deleteUser(id) {
  const user = getUserById(id);
  if (user?.borrowedBooks?.length) {
    let books = getBooks();
    books = books.map(b => user.borrowedBooks.includes(b.id) ? { ...b, available: true, borrowedBy: null } : b);
    saveBooks(books);
  }
  saveUsers(getUsers().filter(u => u.id !== id));
}

function borrowBook(bookId, userId) {
  updateBook(bookId, { available: false, borrowedBy: userId });
  let users = getUsers();
  users = users.map(u => u.id === userId ? { ...u, borrowedBooks: [...(u.borrowedBooks || []), bookId] } : u);
  saveUsers(users);
}

function returnBook(bookId, userId) {
  updateBook(bookId, { available: true, borrowedBy: null });
  let users = getUsers();
  users = users.map(u => u.id === userId ? { ...u, borrowedBooks: (u.borrowedBooks || []).filter(id => id !== bookId) } : u);
  saveUsers(users);
}

// ── SESSION ──
function getSession() { const d = localStorage.getItem(SESSION_KEY); return d ? JSON.parse(d) : null; }
function setSession(s) { localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

function requireAdmin() {
  const s = getSession();
  if (!s || s.role !== 'admin') { window.location.href = 'admin_login.html'; return false; }
  return true;
}

function requireUser() {
  const s = getSession();
  if (!s || s.role !== 'user') { window.location.href = 'usr_login.html'; return false; }
  return getUserById(s.id);
}

// ── UI HELPERS ──
function toast(msg, icon = '✅') {
  const el = document.getElementById('toast');
  if (!el) return;
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  el.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

let _confirmCb = null;
function showConfirm(title, msg, cb) {
  _confirmCb = cb;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent = msg;
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('confirm-ok').onclick = () => { closeConfirm(); _confirmCb && _confirmCb(); };
}
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('open'); }

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
