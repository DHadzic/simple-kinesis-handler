"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapStorage = exports.AbstractStorage = void 0;
class AbstractStorage {
}
exports.AbstractStorage = AbstractStorage;
class MapStorage extends AbstractStorage {
    constructor() {
        super(...arguments);
        this.storage = new Map();
    }
    get(key) {
        return this.storage.get(key);
    }
    set(key, value) {
        this.storage.set(key, value);
    }
    delete(key) {
        this.storage.delete(key);
    }
    has(key) {
        return this.storage.has(key);
    }
}
exports.MapStorage = MapStorage;
