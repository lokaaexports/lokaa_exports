import { TableSkeleton, HeaderSkeleton } from '@/components/admin/LoadingSkeleton'

export default function AdminLoading() {
  return (
    <div className="flex-1 p-8">
      <HeaderSkeleton />
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}
