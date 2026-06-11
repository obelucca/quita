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
          bg-white 
          border 
          rounded-2xl 
          p-6 sm:p-8 
          shadow-sm 
          transition-all 
          duration-300 
          ease-out
          ${highlighted ? "border-brand-emerald-500 bg-brand-emerald-50/5 shadow-md shadow-brand-emerald-600/5" : "border-slate-250"}
          ${hoverable ? "hover:scale-[1.01] hover:border-brand-emerald-500/20 hover:shadow-lg hover:shadow-brand-emerald-600/5 cursor-pointer" : ""}
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
