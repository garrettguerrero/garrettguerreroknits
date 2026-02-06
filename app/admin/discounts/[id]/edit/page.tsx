import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import DiscountForm from '@/components/admin/DiscountForm'

export default async function EditDiscountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: discount, error } = await supabase
    .from('discount_codes')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !discount) {
    notFound()
  }

  return <DiscountForm discount={discount} />
}
