export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const iconSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";
  const textSize = size === "sm" ? "text-base" : "text-lg";
  const tSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className="flex items-center gap-2">
      <div className={`${iconSize} rounded-xl bg-primary flex items-center justify-center relative overflow-hidden`}>
        {/* Green T with shadow depth effect */}
        <span className={`${tSize} font-extrabold text-white relative z-10`}>T</span>
        <div className="absolute right-0 top-0 w-1/3 h-full bg-black/10" />
      </div>
      <span className={`${textSize} font-semibold tracking-tight text-text`}>
        Taskative
      </span>
    </div>
  );
}
