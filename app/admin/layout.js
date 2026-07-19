// app/admin/layout.js
// Admin Portal Layout - Main wrapper for all admin pages

import AdminLayout from '@/components/admin/layout/AdminLayout'

export const metadata = {
  title: 'Admin Portal - Lokaa Exports',
  description: 'Enterprise admin dashboard and management portal',
}

export default function AdminPortalLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>
}
