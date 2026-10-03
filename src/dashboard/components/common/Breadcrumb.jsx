import { Children } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

function Breadcrumb({ children, className = "" }) {
  const items = Children.toArray(children);

  return (
    <nav
      aria-label="مسار التنقل"
      className={`mb-4 flex w-fit max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm sm:rounded-full sm:px-4 sm:text-sm ${className}`}
    >
      {items.map((item, index) => (
        <span key={item.key ?? index} className="inline-flex min-w-0 max-w-full items-center gap-2">
          {index > 0 && <ChevronLeft size={16} aria-hidden="true" className="shrink-0 text-slate-400" />}
          {item}
        </span>
      ))}
    </nav>
  );
}

function BreadcrumbLink({ children, to, onClick }) {
  const className = "min-w-0 whitespace-normal break-words text-right font-medium text-slate-500 transition-colors hover:text-sky-700";

  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  );
}

function BreadcrumbCurrent({ children }) {
  return (
    <span aria-current="page" className="min-w-0 whitespace-normal break-words font-semibold text-slate-800">
      {children}
    </span>
  );
}

Breadcrumb.Link = BreadcrumbLink;
Breadcrumb.Current = BreadcrumbCurrent;

export default Breadcrumb;
