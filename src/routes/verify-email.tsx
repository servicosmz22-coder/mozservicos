import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Loader2, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { requireSupabase } from '../lib/supabase';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => ({ email: String(search.email ?? '') }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const nav = useNavigate();
  const { email } = Route.useSearch();
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const supabase = requireSupabase();

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function change(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code]; next[index] = digit; setCode(next);
    if (digit && index < 5) inputs.current[index + 1]?.focus();
    if (next.every(Boolean)) void verify(next.join(''));
  }

  function keyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) inputs.current[index - 1]?.focus();
  }

  async function verify(token: string) {
    setLoading(true); setError('');
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
    if (verifyError) { setError('Código inválido ou expirado.'); setLoading(false); return; }
    const { data } = await supabase.auth.getUser();
    const role = data.user?.user_metadata?.role;
    setLoading(false);
    if (role === 'professional') await nav({ to: '/professional/onboarding' });
    else await nav({ to: '/feed' });
  }

  async function resend() {
    if (seconds > 0 || !email) return;
    setError('');
    const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
    if (resendError) setError(resendError.message);
    else setSeconds(60);
  }

  return <main className="min-h-screen bg-[#F8F9FA] px-4 py-10">
    <div className="mx-auto max-w-md">
      <button onClick={() => nav({ to: '/login' })} className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500"><ArrowLeft size={16}/> Voltar</button>
      <div className="rounded-2xl border bg-white p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#00A651]/10 text-[#00A651]"><RotateCcw size={25}/></div>
        <h1 className="mt-5 text-2xl font-extrabold">Verifica o teu e-mail</h1>
        <p className="mt-2 text-sm leading-6 text-gray-500">Enviámos um código de 6 dígitos para <strong className="text-gray-700">{email}</strong>.</p>
        <div className="mt-7 flex justify-center gap-2">
          {code.map((digit, i) => <input key={i} ref={(el) => { inputs.current[i] = el; }} value={digit} onChange={(e) => change(i, e.target.value)} onKeyDown={(e) => keyDown(i, e)} inputMode="numeric" maxLength={1} autoFocus={i === 0} className="size-12 rounded-xl border text-center text-xl font-bold outline-none focus:border-[#00A651] focus:ring-2 focus:ring-[#00A651]/15" />)}
        </div>
        {loading && <div className="mt-5 flex justify-center text-[#00A651]"><Loader2 className="animate-spin"/></div>}
        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        <button disabled={seconds > 0} onClick={() => void resend()} className="mt-6 text-sm font-semibold text-[#00A651] disabled:text-gray-400">{seconds > 0 ? `Reenviar código em ${seconds}s` : 'Reenviar código'}</button>
      </div>
    </div>
  </main>;
}
