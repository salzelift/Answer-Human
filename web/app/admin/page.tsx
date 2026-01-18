export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Admin dashboard
          </h1>
          <p className="mt-3 text-slate-600">
            This page is reserved for administrators. Access controls and tools
            will be added here.
          </p>
        </div>
      </div>
    </div>
  );
}

