// ===== 共享数据（与前端共用 localStorage） =====
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

function getUsers() {
  const csv = localStorage.getItem('maomao_users_csv');
  return csv ? parseUsersCSV(csv) : [];
}

function saveUsers(users) {
  localStorage.setItem('maomao_users_csv', serializeUsersCSV(users));
}

function getOrders() {
  return JSON.parse(localStorage.getItem('maomao_orders') || '[]');
}

function saveOrders(orders) {
  localStorage.setItem('maomao_orders', JSON.stringify(orders));
}

// ===== 管理登录 =====
const ADMIN_USER = 'adim';
const ADMIN_PASS = '123456';

function handleAdminLogin(e) {
  e.preventDefault();
  const pass = document.getElementById('adminPass').value;
  const errEl = document.getElementById('adminLoginError');

  if (pass === ADMIN_PASS) {
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('adminPanelSection').style.display = 'block';
    switchAdminTab('users', document.querySelector('.admin-tab'));
  } else {
    errEl.textContent = '密码错误';
    errEl.style.display = 'block';
  }
}

function adminLogout() {
  document.getElementById('adminLoginSection').style.display = '';
  document.getElementById('adminPanelSection').style.display = 'none';
  document.getElementById('adminPass').value = '';
  document.getElementById('adminLoginError').style.display = 'none';
}

// ===== 标签切换 =====
function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('adminUsersPanel').style.display = tab === 'users' ? 'block' : 'none';
  document.getElementById('adminOrdersPanel').style.display = tab === 'orders' ? 'block' : 'none';
  if (tab === 'users') handleAdminUserSearch();
  else handleAdminOrderSearch();
}

// ===== CSV 导出 =====
function downloadUsersCSV() {
  const users = getUsers();
  if (users.length === 0) { alert('暂无用户数据'); return; }
  const csv = serializeUsersCSV(users);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'users.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// ===== 用户查询 =====
function queryUsers(keyword) {
  const users = getUsers();
  if (!keyword) return users;
  const kw = keyword.toLowerCase();
  return users.filter(u => u.username.toLowerCase().includes(kw));
}

// ===== 用户管理 =====
function handleAdminUserSearch() {
  const kw = document.getElementById('adminUserSearch').value.trim();
  const results = queryUsers(kw);
  const container = document.getElementById('adminUserResult');

  if (results.length === 0) {
    container.innerHTML = '<div class="empty-state">未找到用户</div>';
    return;
  }

  container.innerHTML = `
    <table class="user-table">
      <thead><tr><th>#</th><th>用户名</th><th>密码</th><th>操作</th></tr></thead>
      <tbody>
        ${results.map((u, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${u.username}</td>
            <td>${u.password}</td>
            <td><button class="delete-btn" onclick="adminDeleteUser('${u.username}')">删除</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <p class="user-count">共 ${results.length} 条记录</p>
  `;
}

function adminDeleteUser(username) {
  if (!confirm(`确定要删除用户「${username}」吗？`)) return;
  let users = getUsers();
  users = users.filter(u => u.username !== username);
  saveUsers(users);
  handleAdminUserSearch();
}

// ===== 订单管理 =====
function handleAdminOrderSearch() {
  const kw = document.getElementById('adminOrderSearch').value.trim().toLowerCase();
  let orders = getOrders();
  if (kw) {
    orders = orders.filter(o => {
      if (o.type === 'grooming') return o.data.petName.toLowerCase().includes(kw);
      return JSON.stringify(o.data).toLowerCase().includes(kw);
    });
  }
  const container = document.getElementById('adminOrderResult');

  if (orders.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无订单</div>';
    return;
  }

  container.innerHTML = `
    <table class="user-table">
      <thead><tr><th>#</th><th>类型</th><th>详情</th><th>时间</th><th>状态</th><th>操作</th></tr></thead>
      <tbody>
        ${[...orders].reverse().map((o, i) => {
          const detail = o.type === 'grooming'
            ? `🐾 ${o.data.petName} · ${o.data.service} · ${o.data.date} ${o.data.time} · ${o.data.phone}`
            : `🛒 ${o.data.items.map(it => `${it.name}x${it.qty}`).join(', ')} 合计¥${o.data.total}`;
          const statusTag = o.status === 'processed'
            ? '<span class="tag tag-processed">已处理</span>'
            : '<span class="tag tag-pending">待处理</span>';
          const actionBtn = o.status === 'processed'
            ? ''
            : `<button class="process-btn" onclick="adminProcessOrder(${o.id})">处理完成</button>`;
          return `<tr>
            <td>${orders.length - i}</td>
            <td>${o.type === 'grooming' ? '洗护预约' : '商品订单'}</td>
            <td class="order-detail">${detail}</td>
            <td style="font-size:12px;color:#999;">${o.createdAt}</td>
            <td>${statusTag}</td>
            <td>${actionBtn}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="user-count">共 ${orders.length} 条记录</p>
  `;
}

function adminProcessOrder(id) {
  let orders = getOrders();
  const order = orders.find(o => o.id === id);
  if (order) {
    order.status = 'processed';
    saveOrders(orders);
    handleAdminOrderSearch();
  }
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminPass').focus();
});
