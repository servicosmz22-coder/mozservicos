export const ADMIN_EMAIL = 'euclidesdomingos066@gmail.com';
export const ADMIN_WHATSAPP = import.meta.env.VITE_ADMIN_WHATSAPP_NUMBER ?? '';
export const PROVINCES = ['Maputo Cidade','Maputo Província','Gaza','Inhambane','Sofala','Manica','Tete','Zambézia','Nampula','Cabo Delgado','Niassa'];
export const PLANS = {
  monthly: { label: 'Plano Mensal', price: 167, duration: '1 mês', features: ['Acesso completo à plataforma','Perfil público visível','Publicações ilimitadas','Receber contactos de clientes','Renovação mensal flexível'] },
  quarterly: { label: 'Plano Trimestral', price: 287, duration: '3 meses', features: ['Acesso completo à plataforma','Perfil público visível','Publicações ilimitadas','Receber contactos de clientes','Renovação mensal flexível','Equivale a ~96 MZN/mês — Poupa 42%'] },
} as const;

export const CATEGORIES: Record<string, string[]> = {
  'Técnicos e Manutenção': ['Canalizador','Electricista','Pedreiro','Mecânico','Pintor','Carpinteiro','Serralheiro','Técnico de AC e Frigorífico','Técnico de Electrónica','Azulejista','Operador de Máquinas','Outro'],
  'Serviços Digitais e Tech': ['Programador Web','Desenvolvedor de Apps','Designer Gráfico','Designer UI/UX','Marketing Digital','Gestor de Redes Sociais','Editor de Vídeo','Editor de Fotos','Especialista em IA','Criador de Conteúdo','Admin de Sistemas','Suporte Técnico Remoto','Outro'],
  'Educação e Formação': ['Professor de Matemática','Professor de Inglês','Professor de Português','Professor de Física','Professor de Química','Professor de Biologia','Professor de História','Professor de Música','Explicador Escolar','Formador Profissional','Coach de Carreira','Intérprete e Tradutor','Outro'],
  'Serviços Empresariais e Jurídicos': ['Advogado','Contabilista','Consultor de Negócios','Consultor Financeiro','Outro'],
  'Criatividade e Eventos': ['Fotógrafo','Videógrafo','DJ e Sonoplasta','Organizador de Eventos','Costureira e Estilista','Alfaiate','Cabeleireiro','Outro'],
  'Serviços Domésticos': ['Empregada Doméstica','Lavandaria','Cuidador de Animais','Baby-sitter','Cuidador de Idosos','Serviço de Compras e Recados','Mudanças','Outro'],
  'Transporte e Mobilidade': ['Moto-táxi','Outro'],
};

export function whatsappUrl(message: string) {
  if (!ADMIN_WHATSAPP) return '#';
  return `https://wa.me/${ADMIN_WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
}
