import { redirect } from 'next/navigation'

export default function ProductsRedirectPage() {
  // Deprecated legacy catalog entrypoint. Keep redirecting to the DynamicProduct-backed admin PIM.
  redirect('/admin/pim')
}
