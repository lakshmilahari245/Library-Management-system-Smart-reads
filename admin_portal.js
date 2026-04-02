// Admin Portal Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAdmin()) return;
  loadAll();

  // close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(el => {
    el.addEventListener('click', e => { if (e.target === el) el.classList.remove('open'); });
  });
});

function loadAll() {
  renderStats();
  renderBooks();
  renderUsers();
}

function doLogout() {
  clearSession();
  window.location.href = 'index.html';
}

// ── STATS ──
function renderStats() {
  const books = getBooks();
  const users = getUsers();
  const borrowed = books.filter(b => !b.available).length;
  const stats = [
    { icon: '📚', label: 'Total Books',    value: books.length },
    { icon: '👥', label: 'Students',       value: users.length },
    { icon: '📤', label: 'Borrowed',        value: borrowed },
    { icon: '✅', label: 'Available',       value: books.length - borrowed },
  ];
  document.getElementById('stats-row').innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-icon">${s.icon}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
    </div>
  `).join('');
}

// ── BOOKS TABLE ──
function renderBooks() {
  const q = document.getElementById('book-search').value.toLowerCase();
  const books = getBooks().filter(b =>
    !q || [b.title, b.author1, b.subject, b.tags].join(' ').toLowerCase().includes(q)
  );
  const tbody = document.getElementById('books-tbody');
  if (!books.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📭</div><p>No books found</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = books.map(b => `
    <tr>
      <td style="color:var(--text-dim)">${b.code}</td>
      <td><strong>${b.title}</strong>${b.tags ? `<br><span style="font-size:.72rem;color:var(--text-dim)">${b.tags}</span>` : ''}</td>
      <td style="color:var(--text-muted)">${b.author1}${b.author2 ? '<br>' + b.author2 : ''}</td>
      <td><span class="pill pill-blue">${b.subject}</span></td>
      <td><span class="pill ${b.available ? 'pill-green' : 'pill-red'}">${b.available ? 'Available' : 'Borrowed'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="openEdit('${b.id}')">✏️ Edit</button>
          <button class="btn btn-danger btn-sm" onclick="doDeleteBook('${b.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── USERS TABLE ──
function renderUsers() {
  const q = document.getElementById('user-search').value.toLowerCase();
  const users = getUsers().filter(u =>
    !q || [u.name, u.email, u.roll].join(' ').toLowerCase().includes(q)
  );
  const tbody = document.getElementById('users-tbody');
  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">👥</div><p>No students registered yet</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td style="color:var(--text-muted)">${u.email}</td>
      <td><span class="pill pill-gold">${u.roll}</span></td>
      <td>${u.borrowedBooks?.length || 0} book(s)</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="viewUser('${u.id}')">👁️ View</button>
          <button class="btn btn-danger btn-sm" onclick="doDeleteUser('${u.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ── EDIT BOOK ──
function openEdit(id) {
  const b = getBookById(id);
  document.getElementById('edit-id').value = b.id;
  document.getElementById('edit-code').value = b.code;
  document.getElementById('edit-title').value = b.title;
  document.getElementById('edit-author1').value = b.author1;
  document.getElementById('edit-author2').value = b.author2 || '';
  document.getElementById('edit-subject').value = b.subject;
  document.getElementById('edit-tags').value = b.tags || '';
  openModal('edit-modal');
}

function saveEdit() {
  const id = document.getElementById('edit-id').value;
  const title   = document.getElementById('edit-title').value.trim();
  const code    = document.getElementById('edit-code').value.trim();
  const author1 = document.getElementById('edit-author1').value.trim();
  const subject = document.getElementById('edit-subject').value.trim();
  if (!title || !code || !author1 || !subject) return toast('Please fill required fields', '⚠️');
  updateBook(id, {
    code: parseInt(code), title, author1,
    author2: document.getElementById('edit-author2').value.trim(),
    subject, tags: document.getElementById('edit-tags').value.trim()
  });
  closeModal('edit-modal');
  toast('Book updated!', '✅');
  loadAll();
}

// ── DELETE BOOK ──
function doDeleteBook(id) {
  showConfirm('Delete Book?', 'This will permanently remove this book from the catalog.', () => {
    deleteBook(id);
    toast('Book deleted', '🗑️');
    loadAll();
  });
}

// ── VIEW / DELETE USER ──
function viewUser(id) {
  const u = getUserById(id);
  const books = getBooks();
  const borrowed = (u.borrowedBooks || []).map(bid => {
    const b = books.find(x => x.id === bid);
    return b ? `<span class="pill pill-gold" style="margin:2px">${b.title}</span>` : '';
  }).join('');

  document.getElementById('user-modal-body').innerHTML = `
    <div style="text-align:center;margin-bottom:1.5rem">
      <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--gold-dim),var(--gold));display:flex;align-items:center;justify-content:center;font-size:1.8rem;margin:0 auto 1rem">👤</div>
      <div style="font-size:1.1rem;font-weight:600">${u.name}</div>
      <div style="color:var(--text-muted);font-size:.85rem">${u.email}</div>
    </div>
    <hr class="divider">
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;font-size:.85rem"><span style="color:var(--text-muted)">Roll Number</span><span style="color:var(--gold);font-weight:600">${u.roll}</span></div>
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;font-size:.85rem"><span style="color:var(--text-muted)">Date of Birth</span><span style="color:var(--gold);font-weight:600">${u.dob || '—'}</span></div>
    <div style="display:flex;justify-content:space-between;padding:.5rem 0;font-size:.85rem"><span style="color:var(--text-muted)">Books Borrowed</span><span style="color:var(--gold);font-weight:600">${u.borrowedBooks?.length || 0}</span></div>
    ${borrowed ? `<hr class="divider"><div style="font-size:.75rem;color:var(--text-dim);margin-bottom:.5rem;text-transform:uppercase;letter-spacing:.08em">Currently Borrowed</div><div>${borrowed}</div>` : ''}
  `;
  openModal('user-modal');
}

function doDeleteUser(id) {
  showConfirm('Remove Student?', 'This will delete the student account and return all their books.', () => {
    deleteUser(id);
    toast('Student removed', '🗑️');
    loadAll();
  });
}
