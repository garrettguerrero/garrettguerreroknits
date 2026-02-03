import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get data from request
    const body = await request.json()
    const { mdx_content, ...patternData } = body

    // Save MDX content to file if provided
    let mdx_path = null
    if (mdx_content && patternData.slug) {
      try {
        const patternsDir = join(process.cwd(), 'patterns-content', patternData.slug)
        await mkdir(patternsDir, { recursive: true })

        const mdxPath = join(patternsDir, 'index.mdx')
        await writeFile(mdxPath, mdx_content, 'utf-8')

        mdx_path = `patterns-content/${patternData.slug}/index.mdx`
      } catch (error) {
        console.error('Failed to save MDX file:', error)
      }
    }

    // Insert into database
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...patternData,
        mdx_content_path: mdx_path,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create pattern' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Create pattern error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
