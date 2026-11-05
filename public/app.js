const authBlock = document.getElementById('authBlock');
const burgerBlock = document.getElementById('burgerBlock');
const message = document.getElementById('message');

const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const formRegister = document.getElementById('registerForm');
const formLogin = document.getElementById('loginForm');

const regPhone = document.getElementById('regPhone');
const phoneError = document.getElementById('phoneError');

function checkAuth() {
  const token = localStorage.getItem('token');
  if (token) {
    authBlock.classList.add('hidden');
    burgerBlock.classList.remove('hidden');
  } else {
    authBlock.classList.remove('hidden');
    burgerBlock.classList.add('hidden');
  }
}

tabLogin.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  formLogin.classList.remove('hidden');
  formRegister.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  formRegister.classList.remove('hidden');
  formLogin.classList.add('hidden');
});

function validatePhone(raw) {
  const value = raw.trim();
  if (value.length < 10 || value.length > 20) return 'Длина от 10 до 20';
  if (!/^\+?[\d\s\-()]+$/.test(value)) return 'Неверный формат';
  return null;
}

regPhone.addEventListener('input', () => {
  const err = validatePhone(regPhone.value);
  phoneError.textContent = err || '';
});

formRegister.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.classList.add('hidden');

  const phoneErr = validatePhone(regPhone.value);
  if (phoneErr) {
    phoneError.textContent = phoneErr;
    return;
  }

  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('regEmail').value,
      phone: regPhone.value.replace(/[\s\-()]/g, ''),
      password: document.getElementById('regPassword').value
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    message.textContent = data.error || 'Ошибка';
    message.classList.remove('hidden');
  } else {
    alert('Успешно! Теперь войдите.');
    tabLogin.click();
  }
});

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  message.classList.add('hidden');

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    message.textContent = data.error || 'Неверный email или пароль';
    message.classList.remove('hidden');
  } else {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    checkAuth();
  }
});

document.getElementById('showDataBtn').addEventListener('click', () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const dataDiv = document.getElementById('userData');
  
  dataDiv.innerHTML = `
    <p>Email: ${user.email}</p>
    <p>Телефон: ${user.phone}</p>
    <p><strong>2 бургера</strong></p>
  `;
  
  dataDiv.classList.remove('hidden');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  document.getElementById('userData').classList.add('hidden');
  checkAuth();
});

checkAuth();