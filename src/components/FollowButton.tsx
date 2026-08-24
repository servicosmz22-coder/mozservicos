import { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { requireSupabase } from '../lib/supabase';

export function FollowButton({followingId}:{followingId:string}){
 const supabase=requireSupabase(); const [following,setFollowing]=useState(false); const [busy,setBusy]=useState(false);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();if(!user||user.id===followingId)return;const {data}=await supabase.from('follows').select('id').eq('follower_id',user.id).eq('following_id',followingId).maybeSingle();setFollowing(!!data)})()},[followingId,supabase]);
 const toggle=async()=>{if(busy)return;setBusy(true);const {data:{user}}=await supabase.auth.getUser();if(!user||user.id===followingId){setBusy(false);return}if(following){const {error}=await supabase.from('follows').delete().eq('follower_id',user.id).eq('following_id',followingId);if(!error)setFollowing(false)}else{const {error}=await supabase.from('follows').insert({follower_id:user.id,following_id:followingId});if(!error)setFollowing(true)}setBusy(false)};
 return <button disabled={busy} onClick={toggle} className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-bold ${following?'border-[#00A651] bg-green-50 text-[#00A651]':'bg-white text-gray-700'} disabled:opacity-50`}>{following?<UserCheck size={17}/>:<UserPlus size={17}/>} {following?'A seguir':'Seguir'}</button>;
}
