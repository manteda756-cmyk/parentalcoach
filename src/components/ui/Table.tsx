import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Table<T extends Record<string, any>>({ columns, data, onRowClick, emptyMessage = 'No records found' }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3.5 text-left font-semibold uppercase tracking-wider ${col.className ?? ''}`}
                style={{ color: '#6b7280', fontSize: '0.67rem', letterSpacing: '0.08em' }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-16 text-center" style={{ color: '#6b7280' }}>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    📭
                  </div>
                  <p className="font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : data.map((row, i) => (
            <tr
              key={i}
              className={`transition-all ${onRowClick ? 'cursor-pointer' : ''}`}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onClick={() => onRowClick?.(row)}
              onMouseEnter={e => {
                if (onRowClick) (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)';
                else (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
              }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${col.className ?? ''}`}
                  style={{ color: '#c9d1d9' }}
                >
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
