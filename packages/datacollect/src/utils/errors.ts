export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    isOperational: boolean = true,
    details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, details)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', details?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, details)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`
    super(message, 'NOT_FOUND', 404, true)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'CONFLICT', 409, true, details)
    this.name = 'ConflictError'
  }
}

export class SyncError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'SYNC_ERROR', 409, true, details)
    this.name = 'SyncError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error', details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', 0, true, details)
    this.name = 'NetworkError'
  }
}

export const errorHandler = {
  isTrustedError: (error: Error): boolean => {
    if (error instanceof AppError) {
      return error.isOperational
    }
    return false
  },

  handleError: (error: Error): void => {
    if (errorHandler.isTrustedError(error)) {
      console.error('Operational error:', error.message)
    } else {
      console.error('Unhandled error:', error)
      // In production, you might want to send this to an error reporting service
    }
  },

  createErrorResponse: (error: Error) => {
    if (error instanceof AppError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details
        }
      }
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    }
  }
}