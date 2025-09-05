export default function EmptyState({ icon = null, title = 'Nothing here yet', description = 'Check back later or create something new.', action = null }) {
  return (
    <div className="w-full rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-gray-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
























