import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { getPostLoginDestination } from '../lib/auth-routing';

export const Route = createFileRoute('/login')({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  const [show,setShow]=useState(false); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [resetSent,setResetSent]=useState(false);

  async function submit(e:React.FormEvent){
    e.preventDefault(); setError(''); setResetSent(false);
    if(!supabase){setError('Configura o Supabase para entrar.');return;}
    setLoading(true);
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setError(error.message);setLoading(false);return;}
    try { const destination=await getPostLoginDestination(); await navigate({to:destination}); }
    catch(err){setError(err instanceof Error?err.message:'Não foi possível determinar o acesso da conta.');}
    finally{setLoading(false);}
  }

  async function forgotPassword(){
    if(!supabase || !email){setError('Introduz o teu e-mail para receber o link de recuperação.');return;}
    setLoading(true);setError('');
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`});
    if(error)setError(error.message); else setResetSent(true);
    setLoading(false);
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#F8F9FA] px-4"><div className="w-full max-w-md"><Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16}/> Voltar</Link><div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8"><div className="mb-7"><h1 className="text-2xl font-extrabold">Bem-vindo ao ServiçoMoz</h1><p className="mt-2 text-sm text-gray-500">Entra na tua conta para continuar.</p></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">E-mail<input value={email} onChange={e=>setEmail(e.target.value)} type="email" required className="mt-1.5 w-full rounded-lg border px-3 py-3 outline-none focus:border-[#00A651]"/></label><label className="block text-sm font-medium">Palavra-passe<div className="relative mt-1.5"><input value={password} onChange={e=>setPassword(e.target.value)} type={show?'text':'password'} required className="w-full rounded-lg border px-3 py-3 pr-11 outline-none focus:border-[#00A651]"/><button type="button" onClick={()=>setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{show?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>{error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}{resetSent&&<p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">Enviámos o link de recuperação para o teu e-mail.</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00A651] py-3 font-bold text-white disabled:opacity-60">{loading&&<Loader2 className="animate-spin" size={18}/>}Entrar</button></form><button type="button" onClick={()=>void forgotPassword()} className="mt-4 w-full text-sm font-medium text-[#00A651]">Esqueci a senha</button><p className="mt-6 text-center text-sm text-gray-500">Ainda não tens conta? <Link to="/register" className="font-bold text-[#00A651]">Criar conta</Link></p></div></div></main>;
}
