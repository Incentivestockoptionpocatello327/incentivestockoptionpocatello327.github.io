/**
 * Página do Simulador — Versão GitHub Pages (estática)
 * 
 * Para acessar o simulador online, o usuário precisa:
 * 1. Solicitar acesso via email
 * 2. Receber credenciais do administrador
 * 3. Acessar via link privado (hospedado em servidor separado)
 */

import { useState } from "react";
import { ArrowLeft, Mail, Zap } from "lucide-react";
import { ICONE_APP, EMAIL_SUPORTE } from "@/lib/assets";
import { Button } from "@/components/ui/button";

export default function Simulador() {
  const [enviado, setEnviado] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleSolicitar = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enviar email para suporte
    const assunto = "Solicitação de Acesso ao Simulador Online";
    const corpo = `Olá,\n\nGostaria de solicitar acesso ao simulador online do JSF Elétrico.\n\nMeus dados:\n- Nome: ${nome}\n- Email: ${email}\n- Mensagem: ${mensagem}\n\nAguardo retorno.\n\nObrigado!`;
    
    const mailtoLink = `mailto:${EMAIL_SUPORTE}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.location.href = mailtoLink;
    
    setEnviado(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={ICONE_APP} alt="JSF Elétrico" className="h-10 w-10 rounded" />
            <h1 className="text-2xl font-bold text-white">JSF Elétrico</h1>
          </div>
          <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </a>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">Simulador Online</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  O simulador online do JSF Elétrico é um ambiente protegido para aprendizado e prática de comandos elétricos. 
                  Para acessar, você precisa solicitar acesso ao administrador.
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Solicitar Acesso</h3>
            
            {enviado ? (
              <div className="text-center py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 mb-4">
                  <Mail className="h-6 w-6 text-emerald-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Email enviado!</h4>
                <p className="text-sm text-slate-400 mb-6">
                  Seu pedido foi enviado para o administrador. Você receberá as credenciais de acesso no email informado.
                </p>
                <Button
                  onClick={() => {
                    setEnviado(false);
                    setNome("");
                    setEmail("");
                    setMensagem("");
                  }}
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700"
                >
                  Fazer nova solicitação
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSolicitar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mensagem (opcional)
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Solicitar Acesso
                </Button>
              </form>
            )}
          </div>

          {/* Info Footer */}
          <div className="text-center text-sm text-slate-400">
            <p>
              Dúvidas? Entre em contato:{" "}
              <a href={`mailto:${EMAIL_SUPORTE}`} className="text-cyan-400 hover:text-cyan-300">
                {EMAIL_SUPORTE}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
