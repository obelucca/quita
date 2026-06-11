"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/schemas";
import { AlertCircle, Lock, Mail, User, Sparkles } from "lucide-react";
import Link from "next/link";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "register") {
      setActiveTab("register");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/wizard");
    }
  }, [isAuthenticated, router]);

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLoginForm,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  // Register Form
  const {
    register: registerSignup,
    handleSubmit: handleSignupSubmit,
    formState: { errors: signupErrors },
    reset: resetSignupForm,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginInput) => {
    setApiError(null);
    try {
      await login(data);
      router.push("/wizard");
    } catch (err: any) {
      setApiError(err.data?.message || "E-mail ou senha incorretos.");
    }
  };

  const onRegister = async (data: RegisterInput) => {
    setApiError(null);
    try {
      await register(data);
      router.push("/wizard");
    } catch (err: any) {
      setApiError(err.data?.message || "Erro ao criar conta. E-mail pode já estar em uso.");
    }
  };

  const switchTab = (tab: "login" | "register") => {
    setApiError(null);
    setActiveTab(tab);
    resetLoginForm();
    resetSignupForm();
    router.replace(`/auth?tab=${tab}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-3xl pointer-events-none -z-10"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="bg-emerald-600 p-2 rounded-lg text-white font-bold text-lg tracking-wider">
            Q
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Quita<span className="text-emerald-500">.</span>
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          {activeTab === "login" ? "Acesse sua conta" : "Crie sua conta grátis"}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-650">
          {activeTab === "login"
            ? "Para continuar o seu processo de negociação"
            : "E comece a resolver suas dívidas hoje mesmo"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white border border-slate-200 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => switchTab("login")}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                activeTab === "login"
                  ? "border-emerald-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab("register")}
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                activeTab === "register"
                  ? "border-emerald-500 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Cadastro
            </button>
          </div>

          {apiError && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{apiError}</span>
            </div>
          )}

          {activeTab === "login" ? (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...registerLogin("email")}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{loginErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...registerLogin("password")}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-600">{loginErrors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Entrar"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome Completo</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    {...registerSignup("name")}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="João da Silva"
                  />
                </div>
                {signupErrors.name && (
                  <p className="mt-1 text-xs text-rose-600">{signupErrors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    {...registerSignup("email")}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
                {signupErrors.email && (
                  <p className="mt-1 text-xs text-rose-600">{signupErrors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    {...registerSignup("password")}
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-sm transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {signupErrors.password && (
                  <p className="mt-1 text-xs text-rose-600">{signupErrors.password.message}</p>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700">
                <Sparkles className="w-4 h-4 flex-shrink-0 text-emerald-650 mt-0.5" />
                <span>Ao se cadastrar, você ganha 1 (uma) geração de reclamação regulatória totalmente gratuita!</span>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Criar Conta"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}
