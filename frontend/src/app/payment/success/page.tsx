"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalida os créditos e histórico de pagamentos para atualizar a UI imediatamente
    queryClient.invalidateQueries({ queryKey: ["credits"] });
    queryClient.invalidateQueries({ queryKey: ["payments"] });
  }, [queryClient]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative gradient blur */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-100 blur-[120px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-blue-100 blur-[120px] opacity-60 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white border-slate-200/80 p-8 rounded-3xl shadow-xl border relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
          
          <div className="mb-6 flex justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 shadow-inner relative"
            >
              <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow"
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            Pagamento Aprovado!
          </h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
            Obrigado pela sua compra. Seus créditos foram adicionados à sua conta com sucesso e já estão prontos para uso.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 font-medium transition-all shadow-lg shadow-emerald-600/10 flex items-center justify-center gap-2"
            >
              Ir para o Dashboard
              <ArrowRight className="w-4 h-4" />
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => router.push("/wizard")}
              className="w-full border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl h-12 font-medium transition-all"
            >
              Iniciar Nova Reclamação
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
