import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./button";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-xl p-5 mx-4 overflow-hidden"
          >
            <div className="flex items-start gap-3">
              {isDanger && (
                <div className="p-2.5 bg-rose-50 rounded-full text-rose-600 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-sans font-medium">
                  {description}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 mt-5">
              <Button variant="secondary" onClick={onClose} className="text-xs font-semibold px-4 h-9 py-0">
                {cancelText}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`text-xs font-semibold px-4 h-9 py-0 ${
                  isDanger
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/10 hover:shadow-rose-600/20"
                    : ""
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
