import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { requireSupabase } from '../lib/supabase';

export const Route = createFileRoute('/register/professional')({ component: ProfessionalRegister });

function ProfessionalRegister() {
  const nav = useNavigate();
  const supabase = requireSupabase();
  const [show, setShow] = useState(false), [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [f, setF] = useState({ full_name:'', email:'', password:'', confirm:'', whatsapp:'', phone:'' });
  const set = (k: keyof typeof f, v: string) => setF(x => ({...x, [k]:v}));
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError('');
    if (f.password.length < 6) { setError('A palavra-passe deve ter pelo menos 6 caracteres.'); return; }
    if (f.password !== f.confirm) { setError('As palavras-passe não coincidem.'); return; }
    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({ email:f.email, password:f.password, options:{ data:{ full_name:f.full_name, role:'professional' } } });
    if (authError) { setError(authError.message); setLoading(false); return; }
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({ id:data.user.id, role:'professional', full_name:f.full_name, email:f.email, whatsapp:f.whatsapp, phone:f.phone });
      if (profileError) { setError(profileError.message); setLoading(false); return; }
    }
    setLoading(false); await nav({ to:'/verify-email', search:{ email:f.email } });
  }
  return <main className="min-h-screen bg-[#F8F9FA] px-4 py-8"><div className="mx-auto max-w-lg">
    <Link to="/register" className="inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16}/> Escolher outro tipo</Link>
    <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6"><div className="text-xs font-bold uppercase tracking-wider text-[#00A651]">Passo 1 de 4</div><h1 className="mt-2 text-2xl font-extrabold">Criar conta profissional</h1><p className="mt-2 text-sm text-gray-500">Depois do e-mail, vais completar o teu perfil e escolher o plano.</p></div>
      <div className="mb-7 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold"><span className="rounded-full bg-[#00A651] px-2 py-1 text-white">Conta</span><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">Verificação</span><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">Perfil</span><span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">Plano</span></div>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nome completo"><input required value={f.full_name} onChange={e=>set('full_name',e.target.value)} className="input"/></Field>
        <Field label="E-mail"><input required type="email" value={f.email} onChange={e=>set('email',e.target.value)} className="input"/></Field>
        <Password label="Palavra-passe" value={f.password} show={show} toggle={()=>setShow(!show)} onChange={v=>set('password',v)}/>
        <Password label="Confirmar palavra-passe" value={f.confirm} show={showConfirm} toggle={()=>setShowConfirm(!showConfirm)} onChange={v=>set('confirm',v)}/>
        <Field label="WhatsApp"><div className="flex"><span className="grid place-items-center rounded-l-lg border border-r-0 bg-gray-50 px-3 text-sm">+258</span><input required value={f.whatsapp} onChange={e=>set('whatsapp',e.target.value)} className="input rounded-l-none"/></div></Field>
        <Field label="Telefone"><div className="flex"><span className="grid place-items-center rounded-l-lg border border-r-0 bg-gray-50 px-3 text-sm">+258</span><input required value={f.phone} onChange={e=>set('phone',e.target.value)} className="input rounded-l-none"/></div></Field>
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#00A651] py-3 font-bold text-white disabled:opacity-60">{loading&&<Loader2 size={18} className="animate-spin"/>}Continuar</button>
      </form>
    </div></div></main>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block text-sm font-medium">{label}<div className="mt-1.5">{children}</div></label>}
function Password({label,value,show,toggle,onChange}:{label:string;value:string;show:boolean;toggle:()=>void;onChange:(v:string)=>void}){return <Field label={label}><div className="relative"><input required type={show?'text':'password'} value={value} onChange={e=>onChange(e.target.value)} className="input pr-11"/><button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>}
