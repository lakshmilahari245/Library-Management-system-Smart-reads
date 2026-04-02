// User Portal Logic
const COLORS = ['#c9a84c','#27ae60','#2980b9','#8e44ad','#e67e22','#e74c3c'];
const EMOJIS = ['📗','📘','📕','📙','📓','📒','📔'];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
  currentUser = requireUser();
  if (!currentUser) return;
  loadProfile();
  renderBooks();
});

function doLogout() {
  clearSession();
  window.location.href = 'index.html';
}

function loadProfile() {
  document.getElementById('greeting').textContent = `Hello, ${currentUser.name.split(' ')[0]}! 👋`;
  document.getElementById('p-name').textContent  = currentUser.name;
  document.getElementById('p-email').textContent = currentUser.email;
  document.getElementById('p-roll').textContent  = currentUser.roll;
  document.getElementById('p-dob').textContent   = currentUser.dob || '—';
  renderMyBooks();
}

function renderMyBooks() {
  const freshUser = getUserById(currentUser.id);
  currentUser = freshUser;
  const borrowed = (currentUser.borrowedBooks || []).length;
  document.getElementById('p-count').textContent = borrowed;

  const allBooks = getBooks();
  const myBooks = (currentUser.borrowedBooks || []).map(id => allBooks.find(b => b.id === id)).filter(Boolean);

  const el = document.getElementById('my-books');
  if (!myBooks.length) {
    el.innerHTML = '<span style="font-size:.82rem;color:var(--text-dim)">No borrowed books.</span>';
    return;
  }
  el.innerHTML = myBooks.map(b => `
    <div class="borrow-item">
      <span style="color:var(--text);font-size:.82rem">${b.title}</span>
      <button class="btn btn-ghost" style="padding:2px 8px;font-size:.7rem" onclick="doReturn('${b.id}')">Return</button>
    </div>
  `).join('');
}

function renderBooks() {
  const q = (document.getElementById('search')?.value || '').toLowerCase();
  const books = getBooks().filter(b =>
    !q || [b.title, b.author1, b.subject, b.tags].join(' ').toLowerCase().includes(q)
  );
  const grid = document.getElementById('books-grid');

  if (!books.length) {
    grid.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No books found</p></div>`;
    return;
  }

  grid.innerHTML = books.map((b, i) => {
    const isMyBook = (currentUser.borrowedBooks || []).includes(b.id);
    const color = COLORS[i % COLORS.length];
    const emoji = EMOJIS[i % EMOJIS.length];
    let actionBtn = '';
    if (isMyBook) {
      actionBtn = `<button class="btn btn-success btn-sm btn-full" onclick="doReturn('${b.id}')">↩️ Return Book</button>`;
    } else if (b.available) {
      actionBtn = `<button class="btn btn-gold btn-sm btn-full" onclick="doBorrow('${b.id}')">📤 Borrow</button>`;
    } else {
      actionBtn = `<button class="btn btn-ghost btn-sm btn-full" disabled>Unavailable</button>`;
    }
    return `
      <div class="book-card">
        <div class="book-card-header">
          <div class="book-cover" style="background:${color}22;color:${color}">${emoji}</div>
          <div class="book-info">
            <h4>${b.title}</h4>
            <div class="author">${b.author1}${b.author2 ? ', ' + b.author2 : ''}</div>
          </div>
        </div>
        <div class="book-pills">
          <span class="pill pill-blue">${b.subject}</span>
          <span class="pill ${b.available ? 'pill-green' : 'pill-red'}">${b.available ? 'Available' : 'Borrowed'}</span>
        </div>
        <div class="book-actions">${actionBtn}</div>
      </div>
    `;
  }).join('');
}

function doBorrow(bookId) {
  const book = getBookById(bookId);
  if (!book || !book.available) return toast('Book is not available', '⚠️');
  borrowBook(bookId, currentUser.id);
  toast(`"${book.title}" borrowed!`, '📚');
  renderMyBooks();
  renderBooks();
}

function doReturn(bookId) {
  const book = getBookById(bookId);
  returnBook(bookId, currentUser.id);
  toast(`"${book.title}" returned!`, '✅');
  renderMyBooks();
  renderBooks();
}
