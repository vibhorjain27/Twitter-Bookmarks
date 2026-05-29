interface Item {
  cat: string
  status: string
}

interface Props {
  items: Item[]
}

export function StatsBar({ items }: Props) {
  const pending = items.filter(i => i.status !== 'done').length
  const done = items.filter(i => i.status === 'done').length
  const stocksPending = items.filter(
    i => i.cat === 'stocks' && i.status !== 'done'
  ).length

  const stats = [
    { label: 'Pending', value: pending, highlight: pending > 0 },
    { label: 'Done', value: done, highlight: false },
    { label: 'Stocks pending', value: stocksPending, highlight: stocksPending > 0 },
  ]

  return (
    <div className="flex gap-6 flex-wrap p-4 bg-white rounded-xl border">
      {stats.map(({ label, value, highlight }) => (
        <div key={label} className="flex flex-col">
          <span
            className={
              highlight ? 'text-2xl font-bold text-slate-900' : 'text-2xl font-bold text-slate-400'
            }
          >
            {value}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  )
}
