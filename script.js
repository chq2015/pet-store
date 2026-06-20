// ===== Data =====
const pets = [
  { id: 1, name: '金毛犬', breed: '金毛寻回犬', price: 2800, emoji: '🐕', desc: '温顺聪明，家庭首选' },
  { id: 2, name: '布偶猫', breed: '布偶猫', price: 4500, emoji: '🐱', desc: '温柔粘人，仙女猫' },
  { id: 3, name: '柯基犬', breed: '柯基犬', price: 3200, emoji: '🐕', desc: '小短腿，笑容满分' },
  { id: 4, name: '英短猫', breed: '英国短毛猫', price: 3500, emoji: '🐱', desc: '圆脸萌宠，性格温和' },
  { id: 5, name: '泰迪犬', breed: '贵宾犬', price: 1800, emoji: '🐩', desc: '聪明活泼，不掉毛' },
  { id: 6, name: '缅因猫', breed: '缅因库恩猫', price: 6800, emoji: '🐱', desc: '巨型温柔，霸气帅气' },
];

const supplies = [
  { id: 101, name: '全价成猫粮', desc: '优质蛋白，营养均衡', price: 128, emoji: '🍖' },
  { id: 102, name: '宠物玩具礼包', desc: '耐咬磨牙，五件套', price: 69, emoji: '🧸' },
  { id: 103, name: '猫抓板窝', desc: '可躺可抓，瓦楞纸', price: 45, emoji: '🛏️' },
  { id: 104, name: '宠物牵引绳', desc: '防爆冲，舒适不勒', price: 58, emoji: '🦮' },
  { id: 105, name: '智能饮水机', desc: '活水循环，静音过滤', price: 189, emoji: '💧' },
  { id: 106, name: '宠物除味器', desc: 'UVC杀菌，高效除臭', price: 259, emoji: '✨' },
];

let cart = [];
let cartOpen = false;

// ===== Render =====
function renderPets() {
  const grid = document.getElementById('petGrid');
  grid.innerHTML = pets.map(p => `
    <div class="card">
      <div class="card-img">${p.emoji}</div>
      <div class="card-body">
        <div class="card-title">${p.name}</div>
        <div class="card-meta">${p.desc} · ${p.breed}</div>
        <div class="card-footer">
          <span class="price">${p.price}</span>
          <button class="add-cart" onclick="addToCart(${p.id}, 'pet')">加入购物车</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderSupplies() {
  const grid = document.getElementById('suppliesGrid');
  grid.innerHTML = supplies.map(s => `
    <div class="card">
      <div class="card-img">${s.emoji}</div>
      <div class="card-body">
        <div class="card-title">${s.name}</div>
        <div class="card-meta">${s.desc}</div>
        <div class="card-footer">
          <span class="price">${s.price}</span>
          <button class="add-cart" onclick="addToCart(${s.id}, 'supply')">加入购物车</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== Cart =====
function addToCart(id, type) {
  if (!getCurrentUser()) { showLogin(); return; }
  const item = type === 'pet' ? pets.find(p => p.id === id) : supplies.find(s => s.id === id);
  const existing = cart.find(c => c.id === id && c.type === type);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: id, type: type, name: item.name, price: item.price, emoji: item.emoji, qty: 1 });
  }
  updateCartUI();
  // feedback
  const btn = event.target;
  btn.textContent = '✓ 已加入';
  btn.style.background = '#27ae60';
  setTimeout(() => { btn.textContent = '加入购物车'; btn.style.background = ''; }, 800);
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  document.getElementById('cartCount').textContent = count;

  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<div class="empty-cart">购物车还是空的，快去逛逛吧～</div>';
  } else {
    container.innerHTML = cart.map((c, i) => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${c.emoji} ${c.name}</div>
          <div class="cart-item-price">¥${c.price}</div>
        </div>
        <div class="cart-item-qty">
          <button onclick="changeQty(${i}, -1)">−</button>
          <span>${c.qty}</span>
          <button onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
    `).join('');
  }
  document.getElementById('cartTotal').textContent = cart.reduce((s, c) => s + c.price * c.qty, 0);
}

function changeQty(index, delta) {
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  updateCartUI();
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cartModal').classList.toggle('active', cartOpen);
  updateCartUI();
}

function checkout() {
  if (!getCurrentUser()) { showLogin(); return; }
  if (cart.length === 0) { alert('购物车是空的！'); return; }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const orders = getOrders();
  orders.push({
    id: Date.now(),
    type: 'checkout',
    data: { items: cart.map(c => ({ name: c.name, price: c.price, qty: c.qty })), total: total },
    status: 'pending',
    createdAt: new Date().toLocaleString(),
  });
  saveOrders(orders);
  alert('🎉 订单提交成功！总金额：¥' + total + '\n我们会尽快与您联系确认。');
  cart = [];
  updateCartUI();
  toggleCart();
}

// ===== Grooming =====
function getOrders() {
  return JSON.parse(localStorage.getItem('maomao_orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('maomao_orders', JSON.stringify(orders));
}

function submitGrooming(e) {
  e.preventDefault();
  if (!getCurrentUser()) { showLogin(); return; }
  const data = {
    petType: document.getElementById('petType').value,
    petName: document.getElementById('petName').value,
    service: document.getElementById('serviceType').value,
    date: document.getElementById('apptDate').value,
    time: document.getElementById('apptTime').value,
    phone: document.getElementById('phone').value,
    note: document.getElementById('note').value,
  };
  const orders = getOrders();
  orders.push({
    id: Date.now(),
    type: 'grooming',
    data: data,
    status: 'pending',
    createdAt: new Date().toLocaleString(),
  });
  saveOrders(orders);
  document.getElementById('groomingSuccess').style.display = 'block';
  document.getElementById('groomingForm').reset();
  setTimeout(() => { document.getElementById('groomingSuccess').style.display = 'none'; }, 4000);
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  renderPets();
  renderSupplies();
  updateCartUI();

  // Close cart on overlay click
  document.getElementById('cartModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('cartModal')) toggleCart();
  });

  // Set min date for grooming
  const dateInput = document.getElementById('apptDate');
  dateInput.min = new Date().toISOString().split('T')[0];

  // Smooth scroll for nav
  document.querySelectorAll('nav a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('href') !== '#cart') {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});

// ===== CSV 解析/序列化 =====
function parseUsersCSV(csv) {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      result.push({ username: parts[0].trim(), password: parts[1].trim() });
    }
  }
  return result;
}

function serializeUsersCSV(users) {
  let csv = 'username,password\n';
  users.forEach(u => { csv += `${u.username},${u.password}\n`; });
  return csv;
}

// ===== 用户存储（CSV 格式在 localStorage） =====
function getUsers() {
  const csv = localStorage.getItem('maomao_users_csv');
  return csv ? parseUsersCSV(csv) : [];
}

function saveUsers(users) {
  localStorage.setItem('maomao_users_csv', serializeUsersCSV(users));
}

// ===== 从 users.csv 文件导入 =====
async function importUsersFromCSV() {
  try {
    const res = await fetch('users.csv');
    const csvText = await res.text();
    const fileUsers = parseUsersCSV(csvText);
    if (fileUsers.length === 0) return;

    const existing = getUsers();
    const merged = [...existing];
    fileUsers.forEach(fu => {
      if (!merged.find(u => u.username === fu.username)) {
        merged.push(fu);
      }
    });
    saveUsers(merged);
  } catch (_) {
    // users.csv 不存在或无法读取，跳过
  }
}

// ===== 前端用户登录/注册 =====
function getCurrentUser() {
  return localStorage.getItem('maomao_current_user');
}

function setCurrentUser(username) {
  if (username) {
    localStorage.setItem('maomao_current_user', username);
  } else {
    localStorage.removeItem('maomao_current_user');
  }
  updateAuthUI();
}

function showLogin() {
  closeModal('registerModal');
  document.getElementById('loginError').style.display = 'none';
  document.getElementById('loginModal').classList.add('active');
}

function showRegister() {
  closeModal('loginModal');
  document.getElementById('registerError').style.display = 'none';
  document.getElementById('registerModal').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginError');

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    errEl.textContent = '用户名或密码错误';
    errEl.style.display = 'block';
    return;
  }

  setCurrentUser(username);
  closeModal('loginModal');
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('regUser').value.trim();
  const password = document.getElementById('regPass').value;
  const confirm = document.getElementById('regConfirm').value;
  const errEl = document.getElementById('registerError');

  if (password !== confirm) {
    errEl.textContent = '两次密码输入不一致';
    errEl.style.display = 'block';
    return;
  }

  const users = getUsers();
  if (users.find(u => u.username === username)) {
    errEl.textContent = '用户名已存在';
    errEl.style.display = 'block';
    return;
  }

  users.push({ username, password });
  saveUsers(users);
  setCurrentUser(username);
  closeModal('registerModal');
  document.getElementById('regUser').value = '';
  document.getElementById('regPass').value = '';
  document.getElementById('regConfirm').value = '';
}

function logout() {
  setCurrentUser(null);
}

function updateAuthUI() {
  const link = document.getElementById('authLink');
  const user = getCurrentUser();
  if (user) {
    link.innerHTML = `<span class="auth-user">👤 ${user}</span>
      <button class="auth-logout" onclick="logout()">退出</button>`;
    link.href = 'javascript:void(0)';
    link.onclick = null;
  } else {
    link.innerHTML = '👤 登录';
    link.href = 'javascript:void(0)';
    link.onclick = () => showLogin();
  }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  ['loginModal', 'registerModal'].forEach(id => {
    document.getElementById(id).addEventListener('click', (e) => {
      if (e.target === document.getElementById(id)) closeModal(id);
    });
  });

  importUsersFromCSV();
  updateAuthUI();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('loginModal');
      closeModal('registerModal');
    }
  });
});
