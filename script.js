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
  if (cart.length === 0) { alert('购物车是空的！'); return; }
  alert('🎉 订单提交成功！总金额：¥' + cart.reduce((s, c) => s + c.price * c.qty, 0) + '\n我们会尽快与您联系确认。');
  cart = [];
  updateCartUI();
  toggleCart();
}

// ===== Grooming =====
function submitGrooming(e) {
  e.preventDefault();
  const data = {
    petType: document.getElementById('petType').value,
    petName: document.getElementById('petName').value,
    service: document.getElementById('serviceType').value,
    date: document.getElementById('apptDate').value,
    time: document.getElementById('apptTime').value,
    phone: document.getElementById('phone').value,
    note: document.getElementById('note').value,
  };
  document.getElementById('groomingSuccess').style.display = 'block';
  document.getElementById('groomingForm').reset();
  setTimeout(() => { document.getElementById('groomingSuccess').style.display = 'none'; }, 4000);
  console.log('预约信息:', data);
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
