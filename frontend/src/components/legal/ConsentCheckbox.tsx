import React from "react";
import Link from "next/link";

interface ConsentCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({ checked, onChange }) => {
  return (
    <div className="flex items-start gap-3 bg-brand-emerald-50/40 border border-brand-emerald-500/10 p-4 rounded-xl">
      <input
        type="checkbox"
        id="consent-checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 rounded border-slate-350 text-brand-emerald-650 bg-white focus:ring-brand-emerald-500 mt-0.5 cursor-pointer shrink-0"
      />
      <label htmlFor="consent-checkbox" className="text-xs text-slate-600 cursor-pointer leading-relaxed">
        Declaro que li e concordo com os{" "}
        <Link href="/terms" target="_blank" className="text-brand-emerald-600 hover:underline font-bold transition-all">
          Termos de Uso
        </Link>{" "}
        e a{" "}
        <Link href="/privacy" target="_blank" className="text-brand-emerald-600 hover:underline font-bold transition-all">
          Política de Privacidade
        </Link>{" "}
        do Quita.
      </label>
    </div>
  );
};
