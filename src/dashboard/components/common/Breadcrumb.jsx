import { Children } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

function Breadcrumb({ children, className = "" }) {
  const items = Children.toArray(children);

  return (
    <nav
      aria-label="مسار التنقل"
      className={`mb-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm ${className}`}
    >
      {items.map((item, index) => (
        <span key={item.key ?? index} className="inline-flex items-center gap-2">
          {index > 0 && <ChevronLeft size={16} aria-hidden="true" className="text-slate-400" />}
          {item}
        </span>
      ))}
    </nav>
  );
}

function BreadcrumbLink({ children, to, onClick }) {
  const className = "cursor-pointer font-medium text-slate-500 transition-colors hover:text-sky-700";

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
    <span aria-current="page" className="font-semibold text-slate-800">
      {children}
    </span>
  );
}

Breadcrumb.Link = BreadcrumbLink;
Breadcrumb.Current = BreadcrumbCurrent;

export default Breadcrumb;
