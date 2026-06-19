"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function PaymentPendingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["credits"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient blur */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-amber-100 blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-100 blur-[120px] opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white border-slate-200/80 p-8 rounded-3xl shadow-xl border relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500" />
          
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner relative"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              >
                <Clock className="w-12 h-12 stroke-[1.5]" />
              </motion.div>
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Pagamento em Processamento
          </h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            Seu pagamento está sendo processado pelo Mercado Pago. Seus créditos serão liberados automaticamente assim que a aprovação for confirmada.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-2xl h-12 font-medium transition-all shadow-lg shadow-amber-600/10 flex items-center justify-center gap-2"
            >
              Voltar para o Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
