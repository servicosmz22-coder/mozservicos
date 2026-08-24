import { createFileRoute, Link } from '@tanstack/react-router';
import { MapPin, ShieldCheck, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from '../components/AppShell';
import { requireSupabase } from '../lib/supabase';

export const Route = createFileRoute('/feed')({ component: Feed });

function Feed() {
  const supabase = requireSupabase();
  const [posts, setPosts] = useState<any[]>([]);
  const [verified, setVerified] = useState<any[]>([]);
  const [available, setAvailable] = useState<any[]>([]);
  const [tab, setTab] = useState<'discover'|'near'|'trending'>('discover');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const profile = (await supabase.from('profiles').select('province,city').eq('id', user.id).single()).data;
      const { data: professionals } = await supabase.from('professional_profiles')
        .select('id,bio,macro_category,subcategory,province,city,avatar_url,verified_badge,featured,rating_avg,rating_count,available_now,level,price_min,price_max')
        .eq('account_status', 'approved');
      const rows = professionals ?? [];
      const sameProvince = (p:any) => !profile?.province || p.province === profile.province;
      if (active) {
        setVerified(rows.filter(p => p.verified_badge && sameProvince(p)).slice(0, 10));
        setAvailable(rows.filter(p => p.available_now && sameProvince(p)).slice(0, 10));
      }
      const ids = rows.map(p => p.id);
      if (ids.length) {
        let query = supabase.from('posts').select('id,professional_id,type,caption,hashtags,location_tag,category_tag,media_urls,like_count,comment_count,created_at')
          .eq('approval_status','approved').in('professional_id', ids).order('created_at',{ascending:false}).limit(20);
        const { data } = await query;
        if (active) setPosts(data ?? []);
      }
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [supabase]);

  return <AppShell><div className="px-4 py-5">
    <div className="mb-5"><h1 className="text-2xl font-extrabold">Descobre talento moçambicano</h1><p className="mt-1 text-sm text-gray-500">Encontra profissionais perto de ti.</p></div>
    {available.length > 0 && <section className="mb-6"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><span className="size-2 rounded-full bg-[#00A651]"/>Disponíveis Agora</h2><div className="flex gap-4 overflow-x-auto pb-2">{available.map(p => <Link key={p.id} to="/professional/$id" params={{id:p.id}} className="w-16 shrink-0 text-center"><div className="relative mx-auto size-14 rounded-full bg-gray-100 ring-2 ring-[#00A651]">{p.avatar_url && <img src={p.avatar_url} className="size-full rounded-full object-cover"/>}<span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-[#00A651]"/></div><span className="mt-1 block truncate text-xs font-semibold">{p.bio?.split(' ')[0] || 'Prestador'}</span></Link>)}</div></section>}
    {verified.length > 0 && <section className="mb-6"><h2 className="mb-3 flex items-center gap-2 text-sm font-bold"><ShieldCheck size={17} className="text-blue-500"/>Prestadores Verificados</h2><div className="flex gap-3 overflow-x-auto pb-2">{verified.map(p => <Link key={p.id} to="/professional/$id" params={{id:p.id}} className="min-w-48 rounded-xl border bg-white p-3 shadow-sm"><div className="flex items-center gap-3"><div className="size-11 rounded-full bg-gray-100">{p.avatar_url && <img src={p.avatar_url} className="size-full rounded-full object-cover"/>}</div><div className="min-w-0"><p className="truncate text-sm font-bold">{p.bio || 'Profissional'}</p><p className="text-xs text-gray-500">{p.subcategory || p.macro_category}</p></div></div><div className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600"><ShieldCheck size={14}/> Verificado ✓</div></Link>)}</div></section>}
    <div className="mb-4 flex gap-2 overflow-x-auto"><button onClick={()=>setTab('discover')} className={`rounded-full px-4 py-2 text-sm font-bold ${tab==='discover'?'bg-[#00A651] text-white':'border bg-white'}`}>Descobrir</button><button onClick={()=>setTab('near')} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab==='near'?'bg-[#00A651] text-white':'border bg-white'}`}>Perto de Mim</button><button onClick={()=>setTab('trending')} className={`rounded-full px-4 py-2 text-sm font-semibold ${tab==='trending'?'bg-[#00A651] text-white':'border bg-white'}`}>Em Alta</button></div>
    {loading ? [1,2,3].map(x => <div key={x} className="mb-4 h-80 animate-pulse rounded-2xl bg-gray-200"/>) : posts.length ? posts.map(p => <Post key={p.id} post={p}/>) : <div className="rounded-2xl border bg-white p-10 text-center"><Users className="mx-auto text-gray-300" size={42}/><h2 className="mt-4 font-bold">Ainda não há publicações</h2><p className="mt-1 text-sm text-gray-500">Os novos trabalhos aprovados aparecerão aqui.</p></div>}
  </div></AppShell>;
}

function Post({post}:{post:any}) { return <article className="mb-5 overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex items-center gap-3 p-4"><div className="size-10 rounded-full bg-gray-100"/><div className="min-w-0"><p className="font-bold">Profissional</p><span className="text-xs text-[#00A651]">{post.category_tag || 'Serviço'}</span></div></div>{post.media_urls?.[0] ? <img src={post.media_urls[0]} className="aspect-square w-full object-cover"/> : <div className="grid aspect-[4/3] place-items-center bg-gray-50 px-8 text-center text-lg font-semibold text-gray-600">{post.caption || 'Publicação de serviço'}</div>}<div className="p-4"><div className="flex items-center gap-2 text-xs text-gray-500"><MapPin size={14}/>{post.location_tag || 'Moçambique'}</div><p className="mt-3 line-clamp-2 text-sm">{post.caption}</p><div className="mt-3 flex items-center gap-1 text-sm"><Star size={16} className="fill-[#FCB514] text-[#FCB514]"/> Serviço profissional</div><Link to="/professional/$id" params={{id:post.professional_id}} className="mt-4 block rounded-lg bg-[#00A651] py-3 text-center text-sm font-bold text-white">Ver perfil e Contactar</Link></div></article>; }
