export interface User {
  id: string
  username: string
  email?: string
  roles: string[]
  permissions: string[]
  profile?: Record<string, any>
}

export interface Session {
  user: User
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresAt: Date
  issuedAt: Date
}

export interface AuthTokens {
  accessToken: string
  refreshToken?: string
  idToken?: string
  expiresIn: number
}

export class SessionManager {
  private static instance: SessionManager | null = null
  private session: Session | null = null
  private refreshTimer: NodeJS.Timeout | null = null

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  getSession(): Session | null {
    return this.session
  }

  getUser(): User | null {
    return this.session?.user || null
  }

  getAccessToken(): string | null {
    return this.session?.accessToken || null
  }

  isAuthenticated(): boolean {
    if (!this.session) return false

    // Check if token is expired
    return new Date() < this.session.expiresAt
  }

  setSession(tokens: AuthTokens, user: User): void {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + (tokens.expiresIn * 1000))

    this.session = {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      idToken: tokens.idToken,
      expiresAt,
      issuedAt: now
    }

    this.scheduleTokenRefresh(tokens.expiresIn)
    this.saveToStorage()
  }

  clearSession(): void {
    this.session = null
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
    this.clearStorage()
  }

  async refreshTokens(): Promise<AuthTokens | null> {
    if (!this.session?.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      // This would call your auth service to refresh tokens
      // For now, return null to indicate refresh is needed
      return null
    } catch (error) {
      this.clearSession()
      throw error
    }
  }

  hasPermission(permission: string): boolean {
    return this.session?.user.permissions.includes(permission) || false
  }

  hasRole(role: string): boolean {
    return this.session?.user.roles.includes(role) || false
  }

  private scheduleTokenRefresh(expiresInSeconds: number): void {
    // Refresh 5 minutes before expiry
    const refreshTime = Math.max(0, (expiresInSeconds - 300) * 1000)

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
    }

    this.refreshTimer = setTimeout(async () => {
      try {
        const tokens = await this.refreshTokens()
        if (tokens && this.session) {
          this.setSession(tokens, this.session.user)
        }
      } catch (error) {
        console.error('Failed to refresh tokens:', error)
        this.clearSession()
      }
    }, refreshTime)
  }

  private saveToStorage(): void {
    if (this.session && typeof window !== 'undefined') {
      localStorage.setItem('auth_session', JSON.stringify({
        user: this.session.user,
        accessToken: this.session.accessToken,
        refreshToken: this.session.refreshToken,
        idToken: this.session.idToken,
        expiresAt: this.session.expiresAt.toISOString(),
        issuedAt: this.session.issuedAt.toISOString()
      }))
    }
  }

  private clearStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_session')
    }
  }

  // Restore session from storage on initialization
  restoreFromStorage(): boolean {
    if (typeof window === 'undefined') return false

    try {
      const stored = localStorage.getItem('auth_session')
      if (!stored) return false

      const data = JSON.parse(stored)
      const expiresAt = new Date(data.expiresAt)
      const issuedAt = new Date(data.issuedAt)

      if (new Date() >= expiresAt) {
        this.clearStorage()
        return false
      }

      this.session = {
        user: data.user,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        idToken: data.idToken,
        expiresAt,
        issuedAt
      }

      // Schedule refresh for remaining time
      const remainingSeconds = Math.floor((expiresAt.getTime() - new Date().getTime()) / 1000)
      this.scheduleTokenRefresh(remainingSeconds)

      return true
    } catch (error) {
      console.error('Failed to restore session:', error)
      this.clearStorage()
      return false
    }
  }
}