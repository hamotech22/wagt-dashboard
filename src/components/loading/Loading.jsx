export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-10 w-10 rounded-full border border-[#ff4d00]/15" />
        <div className="h-10 w-10 animate-spin rounded-full border-[2px] border-zinc-200 border-t-[#ff4d00]" />
      </div>
    </div>
  );
}
