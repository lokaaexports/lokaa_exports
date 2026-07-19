import Link from 'next/link'
import { ArrowRight, Boxes, FileText, Layers3, Package2, Search, Settings2, ShieldCheck, UploadCloud, WandSparkles } from 'lucide-react'
import { WORKFLOW_SEQUENCE } from '@/lib/workflow'

const pimModules = [
  { label: 'Products', href: '/admin/products-advanced', icon: Package2, description: 'Master product records and attributes.' },
  { label: 'Categories', href: '/admin/products-advanced/categories', icon: Layers3, description: 'Structure product taxonomy and hierarchy.' },
  { label: 'Product Templates', href: '/admin/products-advanced/templates', icon: FileText, description: 'Control reusable product schemas.' },
  { label: 'Certifications', href: '/admin/products-advanced/rfqs', icon: ShieldCheck, description: 'Support product compliance and proof.' },
  { label: 'Media Library', href: '/admin/media', icon: UploadCloud, description: 'Central DAM for reusable images and documents.' },
  { label: 'Settings', href: '/admin/settings', icon: Settings2, description: 'Configure global product and system behavior.' },
]

const pimCapabilities = [
  'Dynamic attributes and attribute groups',
  'Product variants and relationships',
  'Packaging, export details, SEO',
  'Documents, images, videos, and reuse',
  'Workflow-driven approval and publishing',
]

export const metadata = {
  title: 'PIM — Lokaa Exports Admin',
  description: 'Product information management, workflows, and media for Lokaa Exports',
}

export default function PIMPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                <Boxes className="h-3.5 w-3.5" />
                Product Information Management
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">PIM control center</h1>
              <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Manage products as structured data, not just a list. This layer now sits above categories, templates,
                attributes, packaging, certifications, SEO, workflow, and reusable media.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/media" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200">
                Media Library
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/products-advanced" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500">
                Open Product Console
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pimModules.map((module) => (
            <Link
              key={module.label}
              href={module.href}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <module.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{module.label}</h2>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{module.description}</p>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <WandSparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Capabilities now supported</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {pimCapabilities.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Workflow</h2>
            </div>
            <div className="mt-5 space-y-3">
              {WORKFLOW_SEQUENCE.map((stage, index) => (
                <div key={stage.key} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{stage.label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{stage.key.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
