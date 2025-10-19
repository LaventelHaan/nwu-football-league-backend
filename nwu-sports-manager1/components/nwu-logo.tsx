interface NWULogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function NWULogo({ size = "md", className = "" }: NWULogoProps) {
  const sizeClasses = {
    sm: "w-16 h-16 text-2xl",
    md: "w-24 h-24 text-4xl",
    lg: "w-32 h-32 text-6xl",
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-card rounded-full shadow-lg flex items-center justify-center ${className}`}
    >
      <div className="text-center">
        <div className="font-black text-primary tracking-tight">NWU</div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Sports</div>
      </div>
    </div>
  )
}
