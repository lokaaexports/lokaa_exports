'use client'

import CRMSubNav from '@/components/admin/crm/CRMSubNav'

export default function CRMLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <CRMSubNav />
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}
