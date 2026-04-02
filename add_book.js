// Add Book Logic
document.addEventListener('DOMContentLoaded', () => {
  if (!requireAdmin()) return;
});

function doLogout() {
  clearSession();
  window.location.href = 'index.html';
}

function showFileName(input) {
  const name = input.files[0]?.name || '';
  document.getElementById('file-name').textContent = name ? '✅ ' + name : '';
}

function doAddBook() {
  const code    = document.getElementById('code').value.trim();
  const title   = document.getElementById('title').value.trim();
  const author1 = document.getElementById('author1').value.trim();
  const author2 = document.getElementById('author2').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const tags    = document.getElementById('tags').value.trim();

  if (!code)    return toast('Book code is required', '⚠️');
  if (!title)   return toast('Book title is required', '⚠️');
  if (!author1) return toast('Author name is required', '⚠️');
  if (!subject) return toast('Subject is required', '⚠️');

  addBook({ code: parseInt(code), title, author1, author2, subject, tags });
  toast('Book added successfully!', '📚');

  // Clear form
  ['code','title','author1','author2','subject','tags'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('file-name').textContent = '';

  setTimeout(() => window.location.href = 'admin_portal.html', 1000);
}
