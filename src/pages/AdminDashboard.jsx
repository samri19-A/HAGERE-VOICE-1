import { useCallback, useEffect, useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  adminGetStats, adminGetAllUsers,
  adminDeleteUser, adminGetUserInventory, adminGetUserCommands,
} from '../lib/adminService';
import './AdminDashboard.css';

// ── Palette ───────────────────────────────────────────────────────────────────
const PIE_COLORS  = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];
const AREA_COLOR  = '#6366f1';
const BAR_COLOR   = '#8b5cf6';
const REV_COLOR   = '#10b981';

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n)    { return Number(n ?? 0).toLocaleString(); }
function fmtBirr(n){ return `${Number(n ?? 0).toLocaleString()} ብር`; }
function fmtDate(d){ return d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—'; }
function fmtAgo(d) {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color = '#6366f1', trend }) {
  return (
    <div className="adm-stat-card" style={{ '--accent': color }}>
      <div className="adm-stat-icon">{icon}</div>
      <div className="adm-stat-body">
        <div className="adm-stat-value">{value}</div>
        <div className="adm-stat-label">{label}</div>
        {sub   && <div className="adm-stat-sub">{sub}</div>}
        {trend != null && (
          <div className={`adm-stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} today
          </div>
        )}
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHead({ icon, title, action }) {
  return (
    <div className="adm-section-head">
      <h2>{icon} {title}</h2>
      {action}
    </div>
  );
}

// ── User detail drawer ────────────────────────────────────────────────────────
function UserDrawer({ user, onClose }) {
  const [tab,      setTab]      = useState('inventory');
  const [items,    setItems]    = useState([]);
  const [commands, setCommands] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!user?.shop_id) { setLoading(false); return; }
    Promise.all([
      adminGetUserInventory(user.shop_id),
      adminGetUserCommands(user.shop_id),
    ]).then(([inv, cmds]) => {
      setItems(inv);
      setCommands(cmds);
    }).finally(() => setLoading(false));
  }, [user]);

  const actionBreakdown = (() => {
    const m = {};
    commands.forEach(c => { m[c.parsed_action] = (m[c.parsed_action] || 0) + 1; });
    return Object.entries(m).map(([action, count]) => ({ action, count }));
  })();

  return (
    <div className="adm-drawer-backdrop" onClick={onClose}>
      <div className="adm-drawer" onClick={e => e.stopPropagation()}>
        <div className="adm-drawer-header">
          <div className="adm-drawer-avatar">{user.avatar_emoji || '🏪'}</div>
          <div>
            <h3>{user.full_name || user.phone_number || user.email}</h3>
            <p>{user.shop_name || 'No shop name'}</p>
            <span className="adm-drawer-badge">{user.role}</span>
          </div>
          <button className="adm-drawer-close" onClick={onClose}>✕</button>
        </div>

        <div className="adm-drawer-meta">
          <div><span>📧</span>{user.email}</div>
          <div><span>📱</span>{user.phone_number || '—'}</div>
          <div><span>📍</span>{user.shop_location || '—'}</div>
          <div><span>📅</span>Joined {fmtDate(user.created_at)}</div>
          <div><span>🕐</span>Last active {fmtAgo(user.last_command_at || user.last_sign_in_at)}</div>
          <div><span>📦</span>{fmt(user.item_count)} items · {fmt(user.total_qty)} qty</div>
          <div><span>🎤</span>{fmt(user.command_count)} commands</div>
          <div><span>💰</span>{fmtBirr(user.total_revenue)} revenue</div>
        </div>

        <div className="adm-drawer-tabs">
          {['inventory','commands','charts'].map(t => (
            <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
              {t === 'inventory' ? '📦 Inventory' : t === 'commands' ? '🎤 Commands' : '📊 Charts'}
            </button>
          ))}
        </div>

        <div className="adm-drawer-body">
          {loading && <div className="adm-loading">Loading…</div>}

          {!loading && tab === 'inventory' && (
            items.length === 0
              ? <p className="adm-empty">No inventory items.</p>
              : <table className="adm-table">
                  <thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Price</th><th>Category</th></tr></thead>
                  <tbody>
                    {items.map(it => (
                      <tr key={it.id}>
                        <td><span className="adm-emoji">{it.emoji}</span> {it.name_am}</td>
                        <td className={it.quantity <= it.low_stock_threshold ? 'adm-low' : ''}>{it.quantity}</td>
                        <td>{it.unit}</td>
                        <td>{it.price_birr > 0 ? `${it.price_birr} ብር` : '—'}</td>
                        <td>{it.category || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {!loading && tab === 'commands' && (
            commands.length === 0
              ? <p className="adm-empty">No voice commands yet.</p>
              : <table className="adm-table">
                  <thead><tr><th>Time</th><th>Action</th><th>Item</th><th>Qty</th><th>Revenue</th><th>Status</th></tr></thead>
                  <tbody>
                    {commands.map(c => (
                      <tr key={c.id} className={c.status === 'undone' ? 'adm-undone' : ''}>
                        <td className="adm-muted">{fmtAgo(c.created_at)}</td>
                        <td><span className={`adm-action-badge adm-action-${c.parsed_action}`}>{c.parsed_action}</span></td>
                        <td>{c.parsed_item || '—'}</td>
                        <td>{c.parsed_quantity ?? '—'}</td>
                        <td>{c.revenue_birr > 0 ? `${c.revenue_birr} ብር` : '—'}</td>
                        <td><span className={`adm-status-badge adm-status-${c.status}`}>{c.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
          )}

          {!loading && tab === 'charts' && (
            <div className="adm-drawer-charts">
              {actionBreakdown.length > 0 && (
                <div className="adm-chart-block">
                  <h4>Command Types</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={actionBreakdown} dataKey="count" nameKey="action" cx="50%" cy="50%" outerRadius={70} label={({ action, percent }) => `${action} ${(percent*100).toFixed(0)}%`}>
                        {actionBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              {items.length > 0 && (
                <div className="adm-chart-block">
                  <h4>Stock Levels</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={items.slice(0,10)} margin={{ left: -10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name_am" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="quantity" fill={BAR_COLOR} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────────
function DeleteConfirm({ user, onConfirm, onCancel, loading }) {
  return (
    <div className="adm-modal-backdrop" onClick={onCancel}>
      <div className="adm-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-confirm-icon">⚠️</div>
        <h3>Delete User Account</h3>
        <p>
          This will permanently delete <strong>{user.full_name || user.email}</strong>
          's account, shop, all inventory and command history. This cannot be undone.
        </p>
        <div className="adm-confirm-actions">
          <button className="adm-btn-cancel" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="adm-btn-delete" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="adm-spinner" /> : '🗑️ Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminDashboard ────────────────────────────────────────────────────────
export function AdminDashboard({ user: adminUser, onSignOut }) {
  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [statsErr,    setStatsErr]    = useState('');
  const [search,      setSearch]      = useState('');
  const [activeTab,   setActiveTab]   = useState('overview');
  const [drawerUser,  setDrawerUser]  = useState(null);
  const [deleteUser,  setDeleteUser]  = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [sortBy,      setSortBy]      = useState('created_at');
  const [sortDir,     setSortDir]     = useState('desc');

  const load = useCallback(async () => {
    setLoading(true);
    setStatsErr('');
    try {
      const [s, u] = await Promise.all([adminGetStats(), adminGetAllUsers()]);
      setStats(s);
      setUsers(u);
    } catch (e) {
      setStatsErr(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Delete handler ─────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await adminDeleteUser(deleteUser.id);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
      setDeleteUser(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Filtered + sorted users ────────────────────────────────────────────────
  const filteredUsers = users
    .filter(u => {
      const q = search.toLowerCase();
      return (
        (u.full_name  || '').toLowerCase().includes(q) ||
        (u.shop_name  || '').toLowerCase().includes(q) ||
        (u.email      || '').toLowerCase().includes(q) ||
        (u.phone_number|| '').toLowerCase().includes(q) ||
        (u.shop_location || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let va = a[sortBy] ?? 0;
      let vb = b[sortBy] ?? 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => sortBy === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ' ⇅';

  // ── Chart data prep ────────────────────────────────────────────────────────
  const commandsPerDay = (stats?.commands_per_day || []).map(d => ({
    day:      new Date(d.day).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
    commands: d.commands,
    revenue:  Number(d.revenue || 0),
  }));

  const signupsPerDay = (stats?.signups_per_day || []).map(d => ({
    day:     new Date(d.day).toLocaleDateString('en-GB', { day:'2-digit', month:'short' }),
    signups: d.signups,
  }));

  const topCategories = (stats?.top_categories || []).map(d => ({
    name:  d.category,
    value: d.item_count,
    qty:   d.total_qty,
  }));

  const actionBreakdown = (stats?.action_breakdown || []).map(d => ({
    name:  d.action,
    value: d.count,
  }));

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="adm-loading-screen">
        <div className="adm-loading-spinner" />
        <p>Loading admin data…</p>
      </div>
    );
  }

  return (
    <div className="adm-shell">
      {/* ── Sidebar ── */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-logo">
          <span>🛡️</span>
          <div>
            <strong>Admin Portal</strong>
            <small>HAGERE VOICE</small>
          </div>
        </div>

        <nav className="adm-sidebar-nav">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'users',    icon: '👥', label: 'Users' },
            { id: 'charts',   icon: '📈', label: 'Analytics' },
          ].map(item => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-user">
            <div className="adm-sidebar-avatar">
              {(adminUser?.user_metadata?.full_name || adminUser?.email || 'A')[0].toUpperCase()}
            </div>
            <div>
              <strong>{adminUser?.user_metadata?.full_name || 'Admin'}</strong>
              <small>{adminUser?.email}</small>
            </div>
          </div>
          <button className="adm-signout-btn" onClick={onSignOut}>
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="adm-main">
        {/* ── Header ── */}
        <header className="adm-header">
          <div>
            <h1>
              {activeTab === 'overview' && '📊 Overview'}
              {activeTab === 'users'    && '👥 User Management'}
              {activeTab === 'charts'   && '📈 Analytics'}
            </h1>
            <p>Last refreshed: {new Date().toLocaleTimeString()}</p>
          </div>
          <button className="adm-refresh-btn" onClick={load}>↻ Refresh</button>
        </header>

        {statsErr && (
          <div className="adm-error-banner">⚠️ {statsErr}</div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="adm-overview">
            {/* Stat cards */}
            <div className="adm-stat-grid">
              <StatCard icon="👥" label="Total Users"    value={fmt(stats?.total_users)}    sub={`+${stats?.users_today ?? 0} today`}    color="#6366f1" trend={stats?.users_today} />
              <StatCard icon="🏪" label="Total Shops"    value={fmt(stats?.total_shops)}    color="#8b5cf6" />
              <StatCard icon="📦" label="Active Items"   value={fmt(stats?.total_items)}    color="#ec4899" />
              <StatCard icon="🎤" label="Voice Commands" value={fmt(stats?.total_commands)} sub={`+${stats?.commands_today ?? 0} today`} color="#f59e0b" trend={stats?.commands_today} />
              <StatCard icon="💰" label="Total Revenue"  value={fmtBirr(stats?.total_revenue)} sub={`${fmtBirr(stats?.revenue_today)} today`} color="#10b981" />
              <StatCard icon="📅" label="Users This Week" value={fmt(stats?.users_this_week)} color="#3b82f6" />
            </div>

            {/* Quick activity chart */}
            {commandsPerDay.length > 0 && (
              <div className="adm-chart-card">
                <SectionHead icon="📈" title="Commands & Revenue (Last 30 days)" />
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={commandsPerDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradCmd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={AREA_COLOR} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={AREA_COLOR} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={REV_COLOR} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={REV_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left"  type="monotone" dataKey="commands" stroke={AREA_COLOR} fill="url(#gradCmd)" strokeWidth={2} dot={false} />
                    <Area yAxisId="right" type="monotone" dataKey="revenue"  stroke={REV_COLOR}  fill="url(#gradRev)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Two column: signups + action pie */}
            <div className="adm-two-col">
              {signupsPerDay.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="👥" title="New Sign-ups (Last 30 days)" />
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={signupsPerDay} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="signups" fill={BAR_COLOR} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {actionBreakdown.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="🎤" title="Command Types" />
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={actionBreakdown}
                        dataKey="value" nameKey="name"
                        cx="50%" cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {actionBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top categories */}
            {topCategories.length > 0 && (
              <div className="adm-chart-card">
                <SectionHead icon="📦" title="Top Inventory Categories (platform-wide)" />
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topCategories} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={75} />
                    <Tooltip />
                    <Bar dataKey="value" name="Items" fill={AREA_COLOR} radius={[0,4,4,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent users mini-table */}
            <div className="adm-chart-card">
              <SectionHead
                icon="👥"
                title="Recent Users"
                action={
                  <button className="adm-view-all" onClick={() => setActiveTab('users')}>
                    View All →
                  </button>
                }
              />
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th><th>Shop</th><th>Items</th><th>Commands</th><th>Revenue</th><th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.slice(0, 8).map(u => (
                    <tr key={u.id} className="adm-row-click" onClick={() => setDrawerUser(u)}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-user-dot">{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                          <div>
                            <strong>{u.full_name || u.phone_number || '—'}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.shop_name || '—'}</td>
                      <td>{u.item_count}</td>
                      <td>{u.command_count}</td>
                      <td>{Number(u.total_revenue) > 0 ? `${fmt(u.total_revenue)} ብር` : '—'}</td>
                      <td className="adm-muted">{fmtDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* USERS TAB                                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'users' && (
          <div className="adm-users">
            <div className="adm-users-toolbar">
              <input
                className="adm-search"
                type="search"
                placeholder="🔍  Search by name, shop, phone, location…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="adm-users-count">
                {filteredUsers.length} / {users.length} users
              </div>
            </div>

            <div className="adm-table-wrap">
              <table className="adm-table adm-table-full">
                <thead>
                  <tr>
                    <th className="adm-th-sort" onClick={() => toggleSort('full_name')}>User <SortIcon col="full_name" /></th>
                    <th className="adm-th-sort" onClick={() => toggleSort('shop_name')}>Shop <SortIcon col="shop_name" /></th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th className="adm-th-sort" onClick={() => toggleSort('item_count')}>Items <SortIcon col="item_count" /></th>
                    <th className="adm-th-sort" onClick={() => toggleSort('command_count')}>Cmds <SortIcon col="command_count" /></th>
                    <th className="adm-th-sort" onClick={() => toggleSort('total_revenue')}>Revenue <SortIcon col="total_revenue" /></th>
                    <th className="adm-th-sort" onClick={() => toggleSort('last_command_at')}>Last Active <SortIcon col="last_command_at" /></th>
                    <th className="adm-th-sort" onClick={() => toggleSort('created_at')}>Joined <SortIcon col="created_at" /></th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={11} className="adm-empty">No users found.</td></tr>
                  )}
                  {filteredUsers.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-user-dot">{(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                          <div>
                            <strong>{u.full_name || '—'}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>{u.shop_name || <span className="adm-muted">—</span>}</td>
                      <td>{u.phone_number || <span className="adm-muted">—</span>}</td>
                      <td>{u.shop_location || <span className="adm-muted">—</span>}</td>
                      <td className="adm-num">{fmt(u.item_count)}</td>
                      <td className="adm-num">{fmt(u.command_count)}</td>
                      <td className="adm-num">{Number(u.total_revenue) > 0 ? `${fmt(u.total_revenue)} ብር` : '—'}</td>
                      <td className="adm-muted">{fmtAgo(u.last_command_at || u.last_sign_in_at)}</td>
                      <td className="adm-muted">{fmtDate(u.created_at)}</td>
                      <td>
                        <span className={`adm-role-badge adm-role-${u.role}`}>{u.role}</span>
                      </td>
                      <td>
                        <div className="adm-row-actions">
                          <button
                            className="adm-btn-view"
                            onClick={() => setDrawerUser(u)}
                            title="View details"
                          >👁️</button>
                          {u.role !== 'admin' && (
                            <button
                              className="adm-btn-del"
                              onClick={() => setDeleteUser(u)}
                              title="Delete user"
                            >🗑️</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* ANALYTICS TAB                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'charts' && (
          <div className="adm-analytics">
            {/* Full revenue chart */}
            {commandsPerDay.length > 0 ? (
              <div className="adm-chart-card">
                <SectionHead icon="💰" title="Revenue Over Time (Last 30 days)" />
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={commandsPerDay} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradRev2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={REV_COLOR} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={REV_COLOR} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} ብር`, 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke={REV_COLOR} fill="url(#gradRev2)" strokeWidth={2.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="adm-chart-card adm-empty-chart">
                <span>📈</span><p>No command data in the last 30 days yet.</p>
              </div>
            )}

            <div className="adm-two-col">
              {/* Commands bar */}
              {commandsPerDay.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="🎤" title="Daily Commands" />
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={commandsPerDay} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="commands" fill={AREA_COLOR} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Signups bar */}
              {signupsPerDay.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="👥" title="Daily Sign-ups" />
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={signupsPerDay} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="signups" fill={BAR_COLOR} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="adm-two-col">
              {/* Category pie */}
              {topCategories.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="📦" title="Items by Category" />
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={topCategories}
                        dataKey="value" nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={100}
                        paddingAngle={3}
                        label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent*100).toFixed(0)}%` : ''}
                      >
                        {topCategories.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n, p) => [v, n]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Action breakdown pie */}
              {actionBreakdown.length > 0 && (
                <div className="adm-chart-card">
                  <SectionHead icon="🎤" title="Command Types Breakdown" />
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={actionBreakdown}
                        dataKey="value" nameKey="name"
                        cx="50%" cy="50%"
                        innerRadius={55} outerRadius={100}
                        paddingAngle={3}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      >
                        {actionBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Top users by revenue */}
            {users.length > 0 && (
              <div className="adm-chart-card">
                <SectionHead icon="🏆" title="Top Users by Revenue" />
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[...users]
                      .sort((a, b) => Number(b.total_revenue) - Number(a.total_revenue))
                      .slice(0, 10)
                      .map(u => ({
                        name:    u.full_name || u.phone_number || u.email?.split('@')[0],
                        revenue: Number(u.total_revenue || 0),
                        items:   u.item_count,
                      }))
                    }
                    margin={{ top: 5, right: 20, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v} ብር`, 'Revenue']} />
                    <Bar dataKey="revenue" fill={REV_COLOR} radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Modals / Drawers ── */}
      {drawerUser && (
        <UserDrawer user={drawerUser} onClose={() => setDrawerUser(null)} />
      )}
      {deleteUser && (
        <DeleteConfirm
          user={deleteUser}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
