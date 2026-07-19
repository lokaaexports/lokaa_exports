'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowUpRight, ArrowLeft, ArrowRight, Check, Loader2, Mail, Phone } from 'lucide-react'
import COUNTRIES from '@/lib/countries'
import PORTS from '@/lib/ports'
import Nav from '@/components/site/nav'
import Footer from '@/components/site/footer'
import { PRODUCTS } from '@/lib/products'

const EASE = [0.16, 1, 0.3, 1]
const STEPS = [
  { id: 'contact', label: 'Your details' },
  { id: 'requirement', label: 'Requirement' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'review', label: 'Review' },
]

function Field({ label, value, onChange, placeholder, type = 'text', inputMode, pattern, title, maxLength }) {
  return (
    <div>
      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        pattern={pattern}
        title={title}
        maxLength={maxLength}
        className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy placeholder:text-graphite/40 transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
      />
    </div>
  )
}

function SearchSelect({ value, onChange, items, placeholder = 'Type to search…', getLabel, getKey }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')

  useEffect(() => setQuery(value || ''), [value])

  const filtered = items.filter((item) => getLabel(item).toLowerCase().includes((query || '').toLowerCase())).slice(0, 8)

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
        />
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-graphite/50">▾</div>
      </div>
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-lg border border-navy/10 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="p-3 text-sm text-graphite/60">No results</div>
          ) : (
            <ul className="max-h-56 overflow-auto">
              {filtered.map((item) => (
                <li key={getKey(item)}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { onChange(getLabel(item)); setQuery(getLabel(item)); setOpen(false) }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-navy/5"
                  >
                    <div className="truncate">{getLabel(item)}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

function CountrySelect({ value, onChange, placeholder = 'Type to search…' }) {
  return <SearchSelect value={value} onChange={onChange} items={COUNTRIES} placeholder={placeholder} getLabel={(item) => item.name} getKey={(item) => item.code} />
}

function PortSelect({ value, onChange, placeholder = 'Type to search…' }) {
  return <SearchSelect value={value} onChange={onChange} items={PORTS} placeholder={placeholder} getLabel={(item) => `${item.name} — ${item.country}`} getKey={(item) => `${item.name}-${item.country}`} />
}

function RFQInner() {
  const search = useSearchParams()
  const preselect = search.get('product') || ''
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(null)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    phoneCode: '+91',
    company: '',
    country: '',
    productInterest: preselect ? (PRODUCTS.find((p) => p.slug === preselect)?.name || '') : '',
    quantity: '',
    packaging: '',
    incoterms: 'CIF',
    targetPort: '',
    targetPrice: '',
    preferredCurrency: 'USD',
    shipmentDate: '',
    message: '',
    customSpecifications: '',
    attachments: [],
    sourcePage: '',
  })

  useEffect(() => {
    if (preselect) {
      const p = PRODUCTS.find((pr) => pr.slug === preselect)
      if (p) setForm((f) => ({ ...f, productInterest: p.name }))
    }
    if (typeof window !== 'undefined') {
      setForm((f) => ({ ...f, sourcePage: window.location.href }))
    }
  }, [preselect])

  const uploadAttachment = async (file) => {
    setUploadingAttachment(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('type', 'rfq-attachments')
      formData.append('entityType', 'rfq')
      const res = await fetch('/api/uploads', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Unable to upload file')
      setForm((f) => ({
        ...f,
        attachments: [
          ...f.attachments,
          { name: file.name, url: data.url },
        ],
      }))
    } catch (error) {
      toast.error(error.message || 'Upload failed')
    } finally {
      setUploadingAttachment(false)
    }
  }

  const removeAttachment = (name) => {
    setForm((f) => ({
      ...f,
      attachments: f.attachments.filter((attachment) => attachment.name !== name),
    }))
  }

  const update = (key, value) => {
    if (key === 'fullName') {
      value = value.replace(/[^A-Za-z\s.'-]/g, '')
    }
    if (key === 'phone') {
      value = value.replace(/[^+\d\s()-]/g, '')
    }
    setForm((f) => ({ ...f, [key]: value }))
  }

  const nameRegex = /^[A-Za-z\s.'-]{3,}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\+?[\d\s()-]{7,64}$/

  const validate = (index) => {
    if (index === 0) {
      const isNameValid = nameRegex.test(form.fullName.trim())
      const isEmailValid = emailRegex.test(form.email.trim())
      const isCompanyValid = form.company.trim().length >= 2
      const isPhoneValid = !form.phone.trim() || phoneRegex.test(form.phone.trim())
      return isNameValid && isEmailValid && isCompanyValid && isPhoneValid
    }
    if (index === 1) return form.productInterest.trim() && form.country.trim()
    return true
  }

  const next = () => {
    if (!validate(step)) {
      toast.error('Please complete the required fields and use a valid email address.')
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const submit = async () => {
    const isNameValid = nameRegex.test(form.fullName.trim())
    const isEmailValid = emailRegex.test(form.email.trim())
    const isPhoneValid = !form.phone.trim() || phoneRegex.test(form.phone.trim())

    if (!isNameValid) {
      toast.error('Please enter a valid name without numbers.')
      return
    }
    if (!isEmailValid) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!isPhoneValid) {
      toast.error('Please enter a valid phone number.')
      return
    }
    if (!validate(1)) {
      toast.error('Please complete the requirement fields before submitting.')
      return
    }
    if (form.shipmentDate && Number.isNaN(Date.parse(form.shipmentDate))) {
      toast.error('Please select a valid shipment date.')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...form,
        phone: `${form.phoneCode} ${form.phone}`.trim(),
      }
      const res = await fetch('/api/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setDone(data.rfq)
      toast.success('RFQ submitted successfully')
    } catch (error) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <section className="min-h-screen bg-ivory pb-32 pt-40">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} className="text-center">
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full gold-gradient shadow-lg">
              <Check className="h-10 w-10 text-navy" strokeWidth={2.5} />
            </div>
            <div className="mb-6 flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> RFQ received <span className="h-px w-8 bg-gold" /></div>
            <h1 className="font-display text-4xl tracking-tight text-navy lg:text-6xl">Thank you, {done.fullName.split(' ')[0]}.</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-graphite/70">Your request is now with our export desk. A tailored proposal including pricing, lead times and documentation will arrive within 24 hours.</p>
            <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-navy px-6 py-4 text-white">
              <span className="text-[10px] uppercase tracking-[0.28em] text-gold">Reference</span>
              <span className="font-display text-2xl tracking-widest">{done.reference}</span>
            </div>
            <div className="mt-14 grid gap-4 text-left md:grid-cols-3">
              <div className="rounded-2xl border border-navy/5 bg-white p-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">Product</div>
                <div className="mt-2 font-display text-navy">{done.productInterest}</div>
              </div>
              <div className="rounded-2xl border border-navy/5 bg-white p-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">Destination</div>
                <div className="mt-2 font-display text-navy">{done.country}</div>
              </div>
              <div className="rounded-2xl border border-navy/5 bg-white p-6">
                <div className="text-[10px] uppercase tracking-[0.24em] text-graphite/50">Company</div>
                <div className="mt-2 font-display text-navy">{done.company}</div>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/organics" className="inline-flex items-center gap-2 rounded-full border border-navy/20 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white">Explore organic sourcing <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/" className="text-sm text-graphite/60 transition hover:text-navy">Return home</Link>
            </div>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <>
      <Nav theme="light" />
      <section className="min-h-screen bg-ivory pb-24 pt-32">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-graphite/60 transition hover:text-navy"><ArrowLeft className="h-4 w-4" /> Back home</Link>
          <div className="grid gap-14 lg:grid-cols-12">
            <aside className="lg:col-span-4">
              <div className="mb-5 flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-graphite/60"><span className="h-px w-8 bg-gold" /> Request for quote</div>
              <h1 className="font-display text-4xl leading-[1.05] tracking-tight text-navy lg:text-5xl">An export proposal on your desk <span className="text-gold">within 24 hours</span>.</h1>
              <p className="mt-5 leading-relaxed text-graphite/70">Complete the form and our team will return a commercial recommendation covering product, packaging, volume, destination and documentation.</p>
              <div className="mt-10 space-y-4">
                {STEPS.map((item, index) => (
                  <div key={item.id} className={`flex items-center gap-4 transition-opacity ${step === index ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index < step ? 'bg-gold text-navy' : index === step ? 'bg-navy text-gold' : 'bg-navy/10 text-navy'}`}>{index < step ? <Check className="h-4 w-4" /> : index + 1}</div>
                    <div className="font-display text-navy">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-12 space-y-3 border-t border-navy/10 pt-8 text-sm text-graphite/70">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> info@lokaaexports.com</div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> +91 97906 07059</div>
              </div>
            </aside>

            <div className="lg:col-span-8">
              <div className="rounded-3xl border border-navy/5 bg-white p-8 shadow-sm lg:p-12">
                <div className="mb-10">
                  <div className="h-1 overflow-hidden rounded-full bg-navy/10">
                    <motion.div animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }} transition={{ duration: 0.6, ease: EASE }} className="h-full gold-gradient" />
                  </div>
                  <div className="mt-4 text-[11px] uppercase tracking-[0.28em] text-graphite/50">Step {step + 1} of {STEPS.length} · {STEPS[step].label}</div>
                </div>
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }}>
                      <div className="grid gap-5 md:grid-cols-2">
                        <Field
                          label="Full name*"
                          value={form.fullName}
                          onChange={(v) => update('fullName', v)}
                          placeholder="Jane Chen"
                          inputMode="text"
                          pattern="^[A-Za-z\s.'-]+$"
                          title="Letters, spaces, apostrophes and hyphens only"
                          maxLength={80}
                        />
                        <Field
                          label="Work email*"
                          value={form.email}
                          onChange={(v) => update('email', v)}
                          placeholder="jane@company.com"
                          type="email"
                          inputMode="email"
                          pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                          title="Enter a valid email address"
                          maxLength={120}
                        />
                        <Field label="Company*" value={form.company} onChange={(v) => update('company', v)} placeholder="Global Foods Ltd." maxLength={120} />
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Phone</label>
                          <div className="flex gap-2">
                            <select
                              value={form.phoneCode}
                              onChange={(e) => update('phoneCode', e.target.value)}
                              className="w-24 flex-shrink-0 rounded-xl border border-navy/15 bg-ivory px-2 py-1.5 text-navy text-sm"
                            >
                              {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.dial_code} title={c.name}>
                                  {c.dial_code}
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              inputMode="tel"
                              pattern="^[+\d\s()-]{7,64}$"
                              title="Enter a valid phone number with digits only"
                              value={form.phone}
                              onChange={(e) => update('phone', e.target.value)}
                              placeholder="50 000 0000"
                              className="flex-1 min-w-0 rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }}>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Product of interest*</label>
                          <select value={form.productInterest} onChange={(e) => update('productInterest', e.target.value)} className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15">
                            <option value="">Select or type below…</option>
                            {PRODUCTS.map((p) => <option key={p.slug} value={p.name}>{p.name}</option>)}
                            <option value="Other / Custom">Other / Custom requirement</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Destination country*</label>
                          <CountrySelect value={form.country} onChange={(v) => update('country', v)} placeholder="Type to search…" />
                        </div>
                        <Field label="Estimated quantity" value={form.quantity} onChange={(v) => update('quantity', v)} placeholder="e.g. 2 x 40' FCL / 25 MT" />
                        <Field label="Packaging request" value={form.packaging} onChange={(v) => update('packaging', v)} placeholder="Retail pouches, bulk sacks, cartons" />
                        <Field label="Target price" value={form.targetPrice} onChange={(v) => update('targetPrice', v)} placeholder="USD 1.20 / kg" />
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Upload attachments</label>
                          <div className="flex flex-col gap-3 rounded-3xl border border-navy/15 bg-ivory p-4">
                            <div className="flex flex-wrap items-center gap-3">
                              <button
                                type="button"
                                onClick={() => document.getElementById('rfq-attachments-input')?.click()}
                                disabled={uploadingAttachment}
                                className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-deep disabled:opacity-60"
                              >
                                {uploadingAttachment ? 'Uploading…' : 'Add document'}
                              </button>
                              <span className="text-sm text-graphite/60">Supported: PDF, DOCX, XLSX, TXT, JPG, PNG</span>
                            </div>
                            <input
                              id="rfq-attachments-input"
                              type="file"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0]
                                if (file) uploadAttachment(file)
                                event.target.value = ''
                              }}
                            />
                            {form.attachments.length > 0 ? (
                              <ul className="space-y-2 text-sm text-navy">
                                {form.attachments.map((attachment) => (
                                  <li key={attachment.name} className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm shadow-navy/5">
                                    <div className="truncate">{attachment.name}</div>
                                    <div className="flex items-center gap-2">
                                      <a href={attachment.url} target="_blank" rel="noreferrer" className="text-sm text-navy/70 hover:text-navy underline">Open</a>
                                      <button type="button" onClick={() => removeAttachment(attachment.name)} className="text-sm text-rose-500 hover:text-rose-600">Remove</button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="text-sm text-graphite/60">No attachments uploaded yet.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }}>
                      <div className="grid gap-5 md:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Preferred Incoterms</label>
                          <select value={form.incoterms} onChange={(e) => update('incoterms', e.target.value)} className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15">
                            {['FOB', 'CIF', 'CFR', 'DAP', 'DDP', 'EXW'].map((x) => <option key={x} value={x}>{x}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Target port / destination</label>
                          <PortSelect value={form.targetPort} onChange={(v) => update('targetPort', v)} placeholder="Search major ports…" />
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Preferred currency</label>
                          <select value={form.preferredCurrency} onChange={(e) => update('preferredCurrency', e.target.value)} className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15">
                            {['USD', 'EUR', 'GBP', 'AED', 'INR', 'AUD', 'CAD'].map((currency) => (
                              <option key={currency} value={currency}>{currency}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Expected shipment date</label>
                          <input
                            type="date"
                            value={form.shipmentDate}
                            onChange={(e) => update('shipmentDate', e.target.value)}
                            className="w-full rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Additional requirements</label>
                          <textarea rows={4} value={form.message} onChange={(e) => update('message', e.target.value)} placeholder="Packaging preferences, labelling, certifications, delivery window…" className="w-full resize-none rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-graphite/60">Custom specifications</label>
                          <textarea rows={4} value={form.customSpecifications} onChange={(e) => update('customSpecifications', e.target.value)} placeholder="Describe custom formulation, certification needs, labelling, or packaging specs…" className="w-full resize-none rounded-xl border border-navy/15 bg-ivory px-4 py-3.5 text-navy transition focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {step === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4, ease: EASE }}>
                      <div className="space-y-4">
                        <div className="font-display text-2xl text-navy">Review your RFQ</div>
                        <div className="divide-y divide-navy/10 rounded-2xl border border-navy/10">
                          {[
                            ['Name', form.fullName],
                            ['Email', form.email],
                            ['Phone', form.phone || '—'],
                            ['Company', form.company],
                            ['Country', form.country],
                            ['Product', form.productInterest],
                            ['Quantity', form.quantity || '—'],
                            ['Packaging', form.packaging || '—'],
                            ['Target price', form.targetPrice || '—'],
                            ['Incoterms', form.incoterms],
                            ['Port', form.targetPort || '—'],
                            ['Currency', form.preferredCurrency],
                            ['Shipment date', form.shipmentDate || '—'],
                            ['Notes', form.message || '—'],
                            ['Custom specifications', form.customSpecifications || '—'],
                            ['Attachments', form.attachments.length ? form.attachments.map((attachment) => attachment.name).join(', ') : '—'],
                            ['Source page', form.sourcePage || '—'],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-start gap-6 px-5 py-3.5">
                              <div className="mt-1 w-32 flex-shrink-0 text-[11px] uppercase tracking-[0.24em] text-graphite/50">{label}</div>
                              <div className="font-medium text-navy">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-10 flex items-center justify-between">
                  <button onClick={back} disabled={step === 0} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-navy/70 transition hover:text-navy disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Back</button>
                  {step < STEPS.length - 1 ? (
                    <button onClick={next} className="group inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-deep">
                      Continue <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold text-navy transition-transform group-hover:translate-x-0.5"><ArrowRight className="h-4 w-4" /></span>
                    </button>
                  ) : (
                    <button onClick={submit} disabled={loading} className="group inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-navy transition hover:bg-[hsl(var(--gold-soft))] disabled:opacity-70">
                      {loading ? <>Submitting <Loader2 className="h-4 w-4 animate-spin" /></> : <>Submit RFQ <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-gold transition-transform group-hover:rotate-45"><ArrowUpRight className="h-4 w-4" /></span></>}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default function RFQPageClient() {
  return (
    <main>
      <RFQInner />
    </main>
  )
}
