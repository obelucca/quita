import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className = "", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-250 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

    const variants = {
      primary:
        "bg-brand-emerald-600 hover:bg-brand-emerald-700 text-brand-offwhite-50 shadow-md shadow-brand-emerald-600/10 hover:shadow-lg hover:shadow-brand-emerald-600/20 active:scale-98 hover:-translate-y-0.5 px-6 py-3.5 focus-visible:outline-brand-emerald-600",
      secondary:
        "bg-brand-offwhite-50 border border-slate-200 hover:border-slate-350 hover:bg-brand-offwhite-100 text-brand-petroleo hover:shadow-sm px-6 py-3.5 focus-visible:outline-slate-500",
      tertiary:
        "bg-transparent text-slate-500 hover:text-brand-petroleo px-4 py-2 hover:bg-brand-offwhite-200/50 focus-visible:outline-slate-500",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
