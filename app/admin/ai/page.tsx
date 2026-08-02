'use client'

import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Sparkles, Copy, Wand2 } from 'lucide-react'
import SectionPage from '@/components/admin/platform/SectionPage'

function buildDescription(name: string, category: string, keywords: string[]) {
  const keywordList = keywords.filter(Boolean).join(', ')
  return `${name} is a ${category || 'versatile'} offering built for export-ready business use cases. Key strengths include ${keywordList || 'quality, reliability, and consistent delivery'}.`
}

function buildSeo(name: string, category: string, keywords: string[]) {
  const base = [name, category, ...keywords].filter(Boolean)
  return {
    title: `${name} | ${category || 'Product'} | Lokaa Exports`,
    description: `${name} for ${category || 'B2B buyers'} with export-focused quality, compliance, and reliable fulfillment.`,
    keywords: Array.from(new Set(base.map((value) => String(value).toLowerCase()))).join(', '),
  }
}

function buildEmailReply(name: string, tone: string) {
  return `Hello,\n\nThank you for your message regarding ${name || 'your request'}. We have reviewed the details and will respond with the next steps shortly.${tone === 'formal' ? '\n\nRegards,\nLokaa Exports Team' : '\n\nBest,\nLokaa Team'}`
}

export default function AiPage() {
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [keywords, setKeywords] = useState('export, quality, compliant')
  const [tone, setTone] = useState('formal')

  const keywordArray = useMemo(() => keywords.split(',').map((item) => item.trim()).filter(Boolean), [keywords])

  const outputs = {
    description: buildDescription(productName, category, keywordArray),
    seo: buildSeo(productName, category, keywordArray),
    email: buildEmailReply(productName, tone),
  }

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  return (
    <>
      <SectionPage
        subtitle="AI"
        title="Content generation tools"
        description="Use deterministic helpers for product descriptions, SEO metadata, keyword suggestions, and reply drafts until a model integration is connected."
        links={[{ href: '/admin/pim', label: 'Open PIM' }, { href: '/admin/search', label: 'Search' }]}
        stats={[
          { label: 'Modes', value: 4 },
          { label: 'Output', value: 'Text' },
          { label: 'Target', value: 'Product content' },
          { label: 'Workflow', value: 'Copy-ready' },
        ]}
        highlights={[
          { title: 'Description helper', description: 'Generate concise export-friendly copy.' },
          { title: 'SEO helper', description: 'Create title, description, and keyword fields.' },
          { title: 'Email reply helper', description: 'Draft a response with a selectable tone.' },
        ]}
      />

      <div className="mx-auto max-w-7xl space-y-6 px-6 pb-6">
        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Inputs</h2>
            </div>
            <div className="mt-4 space-y-3">
              <input value={productName} onChange={(event) => setProductName(event.target.value)} placeholder="Product name" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <input value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="keyword, keyword, keyword" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700" />
              <select value={tone} onChange={(event) => setTone(event.target.value)} className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-2 text-sm outline-none dark:border-slate-700">
                <option value="formal">Formal</option>
                <option value="friendly">Friendly</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Product description</h3>
                <button onClick={() => copy(outputs.description)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{outputs.description}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">SEO package</h3>
                <button onClick={() => copy(JSON.stringify(outputs.seo, null, 2))} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p><span className="font-medium text-slate-900 dark:text-white">Title:</span> {outputs.seo.title}</p>
                <p><span className="font-medium text-slate-900 dark:text-white">Description:</span> {outputs.seo.description}</p>
                <p><span className="font-medium text-slate-900 dark:text-white">Keywords:</span> {outputs.seo.keywords}</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">Email reply draft</h3>
                <button onClick={() => copy(outputs.email)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-100">{outputs.email}</pre>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
