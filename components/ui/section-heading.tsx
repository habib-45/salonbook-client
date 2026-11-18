import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  action?: React.ReactNode
  align?: "left" | "center"
  className?: string
  titleClassName?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className,
  titleClassName,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
        <h2
          className={cn(
            "font-serif text-[2.35rem] leading-[1.08] tracking-[-0.035em] text-ink sm:text-[2.85rem]",
            titleClassName
          )}
        >
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-xl text-[0.9375rem] leading-7 text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action ? (
        <div className={cn("shrink-0", align === "center" && "pt-1")}>{action}</div>
      ) : null}
    </div>
  )
}
