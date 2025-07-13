export function Toast({
  show,
  message = "",
}: {
  show: boolean;
  message?: string;
}) {
  return (
    <div
      className={`absolute top-[10px] left-[10px] bg-blue-400/80 z-50 transition-all duration-300 rounded-sm ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="flex justify-between items-center px-4 py-2 rounded-md">
        <div className="text-white text-sm">{message}</div>
      </div>
    </div>
  );
}
