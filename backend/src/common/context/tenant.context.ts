import { AsyncLocalStorage } from 'async_hooks';

export interface TenantStore {
  schoolId: string;
  userId?: string;
}

export class TenantContext {
  private static storage = new AsyncLocalStorage<TenantStore>();

  /**
   * Run a callback within the context of a specific school's tenant ID
   */
  static run(schoolId: string, callback: () => any) {
    return this.storage.run({ schoolId }, callback);
  }

  /**
   * Run a callback within the context of a specific school's tenant ID and user ID
   */
  static runWithUser(schoolId: string, userId: string, callback: () => any) {
    return this.storage.run({ schoolId, userId }, callback);
  }

  /**
   * Retrieve the active school tenant ID from the current async execution context
   */
  static getSchoolId(): string | null {
    const store = this.storage.getStore();
    return store ? store.schoolId : null;
  }

  /**
   * Retrieve the active user ID from the current async execution context
   */
  static getUserId(): string | null {
    const store = this.storage.getStore();
    return store ? store.userId || null : null;
  }
}
