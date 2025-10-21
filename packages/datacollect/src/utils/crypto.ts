import CryptoJS from 'crypto-js'

export interface EncryptionConfig {
  algorithm: 'AES' | 'DES' | 'TripleDES'
  key: string
  iv?: string
}

export class CryptoUtils {
  private static config: EncryptionConfig = {
    algorithm: 'AES',
    key: process.env.ENCRYPTION_KEY || 'default-key-change-in-production'
  }

  static setConfig(config: EncryptionConfig): void {
    this.config = config
  }

  static encrypt(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.config.key).toString()
      return encrypted
    } catch (error) {
      throw new Error(`Encryption failed: ${error}`)
    }
  }

  static decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.config.key)
      return decrypted.toString(CryptoJS.enc.Utf8)
    } catch (error) {
      throw new Error(`Decryption failed: ${error}`)
    }
  }

  static hash(data: string, algorithm: 'SHA256' | 'SHA1' | 'MD5' = 'SHA256'): string {
    try {
      let hash: CryptoJS.WordArray

      switch (algorithm) {
        case 'SHA256':
          hash = CryptoJS.SHA256(data)
          break
        case 'SHA1':
          hash = CryptoJS.SHA1(data)
          break
        case 'MD5':
          hash = CryptoJS.MD5(data)
          break
        default:
          throw new Error(`Unsupported hash algorithm: ${algorithm}`)
      }

      return hash.toString()
    } catch (error) {
      throw new Error(`Hashing failed: ${error}`)
    }
  }

  static generateRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  static generateUUID(): string {
    return crypto.randomUUID()
  }

  static generateSecureToken(length: number = 64): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
}