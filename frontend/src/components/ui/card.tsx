import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  highlighted?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hoverable = false, highlighted = false, className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          bg-brand-offwhite-50 
          border 
          rounded-2xl 
          p-6 sm:p-8 
          shadow-sm 
          transition-all 
          duration-250 
          ${highlighted ? "border-brand-emerald-500 bg-brand-emerald-50/10 shadow-md shadow-brand-emerald-500/5" : "border-slate-200"}
          ${hoverable ? "hover:border-brand-emerald-500/30 hover:shadow-md hover:shadow-slate-100" : ""}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
