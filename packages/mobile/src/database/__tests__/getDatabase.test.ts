import { beforeEach, describe, expect, it, vi } from 'vitest'

const { createRxDatabase } = vi.hoisted(() => ({
  createRxDatabase: vi.fn(),
}))

vi.mock('rxdb', () => ({
  createRxDatabase: (...args: unknown[]) => createRxDatabase(...args),
  addRxPlugin: vi.fn(),
  removeRxDatabase: vi.fn(async () => []),
}))

vi.mock('rxdb/plugins/storage-dexie', () => ({
  getRxStorageDexie: () => ({ name: 'dexie' }),
}))

vi.mock('rxdb/plugins/encryption-crypto-js', () => ({
  wrappedKeyEncryptionCryptoJsStorage: ({ storage }: { storage: unknown }) => storage,
}))

vi.mock('rxdb/plugins/replication', () => ({
  replicateRxCollection: vi.fn(),
}))

vi.mock('rxdb/plugins/update', () => ({ RxDBUpdatePlugin: {} }))
vi.mock('rxdb/plugins/cleanup', () => ({ RxDBCleanupPlugin: {} }))
vi.mock('rxdb/plugins/leader-election', () => ({ RxDBLeaderElectionPlugin: {} }))
vi.mock('rxdb/plugins/migration-schema', () => ({ RxDBMigrationSchemaPlugin: {} }))
vi.mock('rxdb/plugins/dev-mode', () => ({ RxDBDevModePlugin: {} }))
vi.mock('rxdb/plugins/validate-ajv', () => ({
  getAjv: () => ({ addFormat: vi.fn() }),
  wrappedValidateAjvStorage: ({ storage }: { storage: unknown }) => storage,
}))

vi.mock('@/services/SecureStorageService', () => ({
  SecureStorageService: {
    get: vi.fn(async () => 'test-password'),
    set: vi.fn(async () => undefined),
    clear: vi.fn(async () => undefined),
    remove: vi.fn(async () => undefined),
  },
}))

describe('getDatabase', () => {
  beforeEach(() => {
    vi.resetModules()
    createRxDatabase.mockReset()
    localStorage.clear()
    localStorage.setItem('app_installed', 'true')
    createRxDatabase.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 15))
      return {
        addCollections: vi.fn(async () => undefined),
        close: vi.fn(async () => undefined),
      }
    })
  })

  it('shares one instance across concurrent and later callers', async () => {
    const { getDatabase } = await import('@/database')

    const [first, second] = await Promise.all([getDatabase(), getDatabase()])
    const third = await getDatabase()

    expect(first).toBe(second)
    expect(third).toBe(first)
    expect(createRxDatabase).toHaveBeenCalledTimes(1)
    expect(createRxDatabase.mock.calls[0]?.[0]).not.toHaveProperty('ignoreDuplicate')
  })
})
