import SyncIcon from "@mui/icons-material/Sync";

export default function MadinatiIntegration() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
          <SyncIcon />
        </div>

        <div>
          <h2 className="font-bold text-slate-800">منصة مدينتي</h2>

          <p className="text-sm text-slate-400">حالة التكامل مع المنصة</p>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-emerald-50 p-4">
        <p className="font-semibold text-emerald-600">متصل</p>

        <p className="mt-1 text-sm text-slate-500">آخر مزامنة منذ 5 دقائق</p>
      </div>
    </div>
  );
}
