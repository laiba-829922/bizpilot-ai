import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}) {
  return (
    <div
      className="
        group
        flex h-full min-w-0 flex-col
        rounded-2xl
        border border-outline
        bg-surface
        p-4
        transition-all duration-200
        hover:border-brand/40
        sm:p-5
        lg:p-6
      "
    >
      {/* Card Header */}
      <div className="flex min-w-0 items-start justify-between gap-3">
        {/* Title + Value */}
        <div className="min-w-0 flex-1">
          <p
            className="
              text-xs font-medium
              text-muted-text
              sm:text-sm
            "
          >
            {title}
          </p>

          <h3
            title={String(value)}
            className="
              mt-3
              min-w-0
              wrap-break-words
              font-display
              text-xl font-extrabold
              leading-tight
              text-primary-text
              sm:text-2xl
              lg:text-3xl
            "
          >
            {value}
          </h3>
        </div>

        {/* Icon */}
        <div
          className="
            flex h-10 w-10
            shrink-0
            items-center justify-center
            rounded-xl
            bg-brand-soft
            text-brand
            sm:h-11 sm:w-11
            lg:h-12 lg:w-12
          "
        >
          {Icon && <Icon className="h-5 w-5 lg:h-6 lg:w-6" />}
        </div>
      </div>

      {/* Card Footer */}
      {change && (
        <div className="mt-auto flex min-w-0 items-start gap-2 pt-5">
          <span
            className={`
              inline-flex min-w-0 items-start gap-1
              text-xs font-semibold
              sm:text-sm
              ${
                positive
                  ? "text-emerald-500"
                  : "text-red-500"
              }
            `}
          >
            {positive ? (
              <ArrowUpRight
                size={16}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <ArrowDownRight
                size={16}
                className="mt-0.5 shrink-0"
              />
            )}

            <span className="wrap-break-words">
              {change}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}