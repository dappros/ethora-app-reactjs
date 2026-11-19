import { ReactElement } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface LineChartLocalProps {
  data: { value: number; name: string }[];
  name: string;
  // Several lines on one chart (with a legend): each its own series, same days.
  series?: { key: string; label: string; data: { value: number; name: string }[] }[];
}

const COLORS = ['#8884d8', '#e07b39'];

export const LineChartLocal = (props: LineChartLocalProps): ReactElement => {
  const { data, series } = props;
  const many = Boolean(series && series.length > 1);
  // One row per day: { name, <key>: value, ... }.
  const rows = many
    ? (series![0].data || []).map((p, i) => {
        const row: Record<string, string | number> = { name: p.name };
        for (const s of series!) row[s.key] = s.data?.[i]?.value ?? 0;
        return row;
      })
    : data;

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={rows}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Tooltip />

          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          {many && <Legend />}
          {many ? (
            series!.map((s, i) => (
              <Line key={s.key} type="monotone" dataKey={s.key} name={s.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} activeDot={{ r: 6 }} />
            ))
          ) : (
            <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
