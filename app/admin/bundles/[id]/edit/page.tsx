import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BundleEditor from '@/components/admin/BundleEditor'

export default async function EditBundlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch bundle with its items
  const { data: bundle, error } = await supabase
    .from('bundles')
    .select('*, bundle_items(product_id)')
    .eq('id', id)
    .single()

  if (error || !bundle) {
    notFound()
  }

  return <BundleEditor bundle={bundle} />
}
