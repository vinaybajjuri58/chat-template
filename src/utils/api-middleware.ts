import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { formatZodError } from "@/utils/validations"

// Updated to match Next.js 15 route context structure
type RouteContext = {
  params: Promise<Record<string, string | string[]>>
}

/**
 * Middleware for validating request bodies against a Zod schema
 * @param handler The API route handler function
 * @param schema The Zod schema to validate against
 * @returns A wrapped handler function with validation
 */
export function withValidation<T>(
  handler: (
    req: NextRequest,
    data: T,
    ctx?: RouteContext
  ) => Promise<NextResponse>,
  schema: z.ZodType<T>
) {
  return async (
    req: NextRequest,
    ctx?: RouteContext
  ): Promise<NextResponse> => {
    try {
      // Parse and validate the request body
      let body: unknown

      try {
        body = await req.json()
      } catch {
        return NextResponse.json(
          {
            error: "Invalid JSON in request body",
            status: "error",
          },
          { status: 400 }
        )
      }

      // Validate against schema
      try {
        const validatedData = schema.parse(body)
        return await handler(req, validatedData, ctx)
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            {
              error: "Validation failed",
              details: formatZodError(error),
              status: "error",
            },
            { status: 400 }
          )
        }
        throw error
      }
    } catch {
      return NextResponse.json(
        {
          error: "Internal server error",
          status: "error",
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Validates URL params against a Zod schema
 * @param params The URL params object
 * @param schema The Zod schema to validate against
 * @returns A validation result with data or errors
 */
export function validateParams<T>(
  params: Record<string, string | string[] | undefined>,
  schema: z.ZodType<T>
): { data: T | null; error: z.ZodError | null } {
  try {
    const validatedData = schema.parse(params)
    return { data: validatedData, error: null }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { data: null, error }
    }
    throw error
  }
}
