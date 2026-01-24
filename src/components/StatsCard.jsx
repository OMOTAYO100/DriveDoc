export default function StatsCard({ title, value, icon, color }) {
  const IconComp = icon;
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <IconComp className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );
}
