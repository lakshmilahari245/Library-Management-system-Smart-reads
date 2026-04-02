// Admin Login Logic
document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

function doLogin() {
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value.trim();

  if (!email || !pass) return toast('Please fill in all fields', '⚠️');

  if (email === 'admin@gmail.com' && pass === 'admin@123') {
    setSession({ role: 'admin', email });
    toast('Welcome, Admin!', '🛡️');
    setTimeout(() => window.location.href = 'admin_portal.html', 800);
  } else {
    toast('Invalid credentials. Try admin@gmail.com / admin@123', '❌');
  }
}
