import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastItemProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto p-4 rounded-xl border flex items-start gap-3 shadow-md bg-white w-full max-w-sm ${
        toast.type === "success"
          ? "border-emerald-100 bg-emerald-50/90 text-emerald-950"
          : toast.type === "error"
          ? "border-rose-100 bg-rose-50/90 text-rose-950"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {toast.type === "success" && <CheckCircle className="w-5 h-5 text-emerald-500" />}
        {toast.type === "error" && <AlertTriangle className="w-5 h-5 text-rose-500" />}
        {toast.type === "info" && <Info className="w-5 h-5 text-slate-500" />}
      </div>
      <div className="flex-1 text-xs font-semibold leading-relaxed font-sans">
        {toast.message}
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

interface CustomToastContainerProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export const CustomToastContainer: React.FC<CustomToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
};
