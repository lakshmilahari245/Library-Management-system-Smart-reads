// User Login / Register Logic
document.addEventListener('keydown', e => { if (e.key === 'Enter') { const active = document.getElementById('form-login').style.display !== 'none'; active ? doLogin() : doRegister(); } });

function switchTab(tab) {
  document.getElementById('form-login').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('form-signup').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tab-login').classList.toggle('active',  tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
}

function doLogin() {
  const email = document.getElementById('l-email').value.trim();
  const pass  = document.getElementById('l-pass').value.trim();
  if (!email || !pass) return toast('Please fill in all fields', '⚠️');

  const user = loginUser(email, pass);
  if (user) {
    setSession({ role: 'user', id: user.id });
    toast(`Welcome back, ${user.name.split(' ')[0]}!`, '👋');
    setTimeout(() => window.location.href = 'user_portal.html', 800);
  } else {
    toast('Invalid email or password', '❌');
  }
}

function doRegister() {
  const name = document.getElementById('s-name').value.trim();
  const roll = document.getElementById('s-roll').value.trim();
  const email = document.getElementById('s-email').value.trim();
  const pass  = document.getElementById('s-pass').value.trim();
  const dob   = document.getElementById('s-dob').value;

  if (!name)  return toast('Full name is required', '⚠️');
  if (!roll)  return toast('Roll number is required', '⚠️');
  if (!email) return toast('Email is required', '⚠️');
  if (!pass || pass.length < 6) return toast('Password must be at least 6 characters', '⚠️');

  const result = registerUser({ name, roll, email, password: pass, dob });
  if (result.error) return toast(result.error, '⚠️');

  toast('Account created! Please login.', '✅');
  switchTab('login');
  document.getElementById('l-email').value = email;
}
