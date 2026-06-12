import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { t } from '../lib/i18n';

function buildChartData(commands) {
  const today = new Date().toDateString();
  const todayCommands = commands.filter(
    (c) => c.created_at && new Date(c.created_at).toDateString() === today
  );

  // Group by item
  const map = {};
  for (const cmd of todayCommands) {
    if (!cmd.parsed_item) continue;
    if (!map[cmd.parsed_item]) map[cmd.parsed_item] = { item: cmd.parsed_item, add: 0, subtract: 0 };
    if (cmd.parsed_action === 'add') map[cmd.parsed_item].add += cmd.parsed_quantity || 0;
    if (cmd.parsed_action === 'subtract') map[cmd.parsed_item].subtract += cmd.parsed_quantity || 0;
  }

  return Object.values(map);
}

export function ActivityChart({ commands, lang }) {
  const data = buildChartData(commands);

  if (data.length === 0) {
    return (
      <div className="chart-empty">
        <span>📊</span>
        <p>{lang === 'am' ? 'ዛሬ ምንም እንቅስቃሴ የለም' : 'No activity today yet'}</p>
      </div>
    );
  }

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd0" />
          <XAxis dataKey="item" tick={{ fontSize: 11, fill: '#6b5c52', fontFamily: 'Noto Sans Ethiopic, system-ui' }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6b5c52' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontFamily: 'Noto Sans Ethiopic, system-ui', fontSize: 12 }}
            formatter={(value, name) => [
              value,
              name === 'add' ? t(lang, 'addKeyword') : t(lang, 'subtractKeyword'),
            ]}
          />
          <Legend
            formatter={(value) =>
              value === 'add' ? t(lang, 'addKeyword') : t(lang, 'subtractKeyword')
            }
          />
          <Bar dataKey="add" name="add" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#2d6a4f" />
            ))}
          </Bar>
          <Bar dataKey="subtract" name="subtract" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill="#b91c1c" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
