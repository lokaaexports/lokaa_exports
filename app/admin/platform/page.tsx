import SectionPage from '@/components/admin/platform/SectionPage'

const highlights = [
  { title: 'PIM', description: 'Products, categories, templates, attributes, variants, packaging, certifications, SEO, and media.' },
  { title: 'DAM', description: 'Images, videos, PDFs, brochures, catalogues, certificates, and reusable assets.' },
  { title: 'Workflow', description: 'Draft → Pending Review → Approved → Published → Archived lifecycle.' },
  { title: 'Approval Engine', description: 'Employee, manager, and admin approval gates for controlled publishing.' },
  { title: 'Global Search', description: 'Search across products, customers, users, RFQs, categories, and countries.' },
  { title: 'Notifications', description: 'Bell center for RFQs, assignments, orders, shipments, OTPs, and errors.' },
]

export default function PlatformPage() {
  return (
    <SectionPage
      subtitle="Platform Console"
      title="Enterprise business platform"
      description="This is the operational front door for the updated Lokaa Exports system. It connects PIM, DAM, workflow, approvals, notifications, search, and the rest of the business domains."
      links={[
        { href: '/admin/catalog', label: 'Open PIM' },
        { href: '/admin/media', label: 'Open DAM' },
        { href: '/admin/search', label: 'Global Search' },
        { href: '/admin/notifications', label: 'Notifications' },
        { href: '/admin/approvals', label: 'Approvals' },
      ]}
      stats={[
        { label: 'Domains', value: '15+' },
        { label: 'Workflow stages', value: '5' },
        { label: 'Unified search', value: 'Yes' },
        { label: 'Reusable assets', value: 'Centralized' },
      ]}
      highlights={highlights}
    />
  )
}
