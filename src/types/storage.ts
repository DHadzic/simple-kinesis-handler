import { UserLimit } from './user-limit';

export abstract class AbstractStorage {
  abstract get(key: string): Promise<UserLimit | undefined> | (UserLimit | undefined);
  abstract set(key: string, value: UserLimit): Promise<void> | void;
  abstract delete(key: string): Promise<void> | void;
  abstract has(key: string): Promise<boolean> | boolean;
}

export class MapStorage extends AbstractStorage {
  private storage = new Map<string, UserLimit>();

  get(key: string): UserLimit | undefined {
    return this.storage.get(key);
  }

  set(key: string, value: UserLimit): void {
    this.storage.set(key, value);
  }

  delete(key: string): void {
    this.storage.delete(key);
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }
}
