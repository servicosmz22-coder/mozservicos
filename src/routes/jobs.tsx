import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { JobBoard } from '../components/JobBoard';

export const Route = createFileRoute('/jobs')({ component: JobsPage });

function JobsPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] px-4 py-5 text-[#1A1A1A]">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center gap-3">
          <Link
            to="/"
            className="grid size-10 place-items-center rounded-full border bg-white text-[#1A1A1A] shadow-sm"
            aria-label="Voltar"
          >
            <ArrowLeft size={19} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#00A651]">ServiçoMoz</p>
            <h1 className="text-2xl font-extrabold tracking-tight">Pedidos</h1>
          </div>
        </div>
        <JobBoard />
      </div>
    </main>
  );
}
