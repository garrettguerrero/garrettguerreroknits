import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import { join } from 'path'
import PatternEditor from '@/components/admin/PatternEditor'

export default async function EditPatternPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: pattern, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pattern) {
    notFound()
  }

  // Load existing MDX content if it exists
  let mdxContent = ''
  if (pattern.mdx_content_path) {
    try {
      const mdxPath = join(process.cwd(), pattern.mdx_content_path)
      mdxContent = await readFile(mdxPath, 'utf-8')
    } catch (error) {
      console.error('Failed to load MDX content:', error)
      // Continue with empty content if file doesn't exist
    }
  }

  return <PatternEditor pattern={pattern} initialMdxContent={mdxContent} />
}
