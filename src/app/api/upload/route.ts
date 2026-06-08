import { v2 as cloudinary } from 'cloudinary'
import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Sin archivo' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Imagen demasiado grande (máx 5 MB)' }, { status: 413 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const url = await new Promise<string>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'nexouapa', resource_type: 'image' }, (err, result) => {
        if (err || !result) reject(err ?? new Error('Upload failed'))
        else resolve(result.secure_url)
      })
      .end(buffer)
  })

  return NextResponse.json({ url })
}
