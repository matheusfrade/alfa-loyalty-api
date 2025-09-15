import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

// Serve test files for browser execution
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Security: only allow specific test files
    const allowedFiles = [
      'mission-trigger-test.js',
      'trigger-validation-test.js'
    ]
    
    if (!allowedFiles.includes(filename)) {
      return new NextResponse('File not found', { status: 404 })
    }
    
    // Read test file
    const filePath = join(process.cwd(), 'tests', filename)
    const content = readFileSync(filePath, 'utf-8')
    
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
      },
    })
    
  } catch (error) {
    console.error('Error serving test file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}