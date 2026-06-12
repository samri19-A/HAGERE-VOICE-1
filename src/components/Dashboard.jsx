import { t } from '../lib/i18n';

/**
 * Compact stats strip shown in the header top-right area.
 * Shows 4 key numbers: item types, total stock, today's sales, today's revenue.
 */
export function Dashboard({ items, commands, lang }) {
  const today = new Date().toDateString();
  const todayCommands = commands.filter(
    (c) => c.created_at && new Date(c.created_at).toDateString() === today
  );

  const totalItems  = items.length;
  const totalStock  = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const todaySales  = todayCommands
    .filter((c) => c.parsed_action === 'subtract' && c.status === 'applied')
    .reduce((s, c) => s + (c.parsed_quantity || 0), 0);
  const todayRevenue = todayCommands
    .filter((c) => c.parsed_action === 'subtract' && c.status === 'applied')
    .reduce((s, c) => s + (Number(c.revenue_birr) || 0), 0);

  const stats = [
    { icon: '📦', value: totalItems,              label: t(lang, 'dashTotalItems'),  color: '#7b2d4e' },
    { icon: '🗂️', value: totalStock,               label: t(lang, 'dashTotalStock'),  color: '#1d4ed8' },
    { icon: '🛍️', value: todaySales,               label: t(lang, 'dashTodaySales'),  color: '#15803d' },
    { icon: '💰', value: `${todayRevenue.toFixed(0)} ${t(lang, 'dashBirr')}`,
                                                    label: t(lang, 'dashRevenue'),     color: '#b45309',
      highlight: todayRevenue > 0 },
  ];

  return (
    <div className="dash-strip">
      {stats.map((s) => (
        <div key={s.label} className={`dash-stat ${s.highlight ? 'dash-stat-hi' : ''}`}>
          <span className="dash-stat-icon">{s.icon}</span>
          <div className="dash-stat-body">
            <span className="dash-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="dash-stat-label">{s.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
