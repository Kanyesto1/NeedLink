import { NextResponse } from "next/server"

export function requestId(): string {
  return crypto.randomUUID()
}

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      requestId: requestId(),
    },
    { status },
  )
}

export function fail(code: string, message: string, status = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: { code, message },
      timestamp: new Date().toISOString(),
      requestId: requestId(),
    },
    { status },
  )
}