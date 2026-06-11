import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "secondary-dark";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", children, className = "", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl text-sm transition-all duration-250 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

    const variants = {
      primary:
        "bg-brand-emerald-600 hover:bg-brand-emerald-700 text-brand-offwhite-50 shadow-md shadow-brand-emerald-600/10 hover:shadow-lg hover:shadow-brand-emerald-600/20 active:scale-98 hover:-translate-y-[2px] px-6 py-3.5 focus-visible:outline-brand-emerald-600",
      secondary:
        "bg-brand-offwhite-50 border border-slate-200 hover:border-slate-300 hover:bg-brand-offwhite-100 text-brand-petroleo hover:shadow-md hover:-translate-y-[2px] px-6 py-3.5 focus-visible:outline-slate-500",
      "secondary-dark":
        "bg-[#032d24] border border-emerald-500/10 hover:border-emerald-500/20 hover:bg-[#043d31] text-white hover:shadow-md hover:-translate-y-[2px] px-6 py-3.5 focus-visible:outline-emerald-500",
      tertiary:
        "bg-transparent text-slate-550 hover:text-brand-petroleo px-4 py-2 hover:bg-brand-offwhite-200/50 focus-visible:outline-slate-500 hover:-translate-y-[1px]",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} transition-all duration-300 ease-out ${variants[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
