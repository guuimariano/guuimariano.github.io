import { createDefaultFights } from './default-data.js';

const STORAGE_KEY = 'tournamentState';
const LEGACY_KEY = 'taekwondoData';
const SCHEMA_VERSION = '1.0.0';

const migrationPipeline = [];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createBaseState(overrides = {}) {
    return {
        schemaVersion: SCHEMA_VERSION,
        lastSyncedAt: new Date().toISOString(),
        athletes: [],
        coaches: [],
        trainingLocations: [],
        fights: createDefaultFights(),
        penaltyTypes: [],
        analyticsCache: null,
        ...overrides
    };
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.warn(`Unable to access localStorage key "${key}"`, error);
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Failed to persist localStorage key "${key}"`, error);
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`Unable to remove localStorage key "${key}"`, error);
    }
}

function parseState(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (error) {
        console.error('Failed to parse stored tournament state, falling back to default.', error);
        return null;
    }
}

function applyMigrations(state) {
    return migrationPipeline.reduce((acc, migrateFn) => {
        try {
            const next = migrateFn(acc);
            return next ? next : acc;
        } catch (error) {
            console.error('Migration failed, continuing with previous state.', error);
            return acc;
        }
    }, state);
}

function loadLegacyState(rawLegacy) {
    try {
        const fights = JSON.parse(rawLegacy);
        if (Array.isArray(fights)) {
            return createBaseState({ fights });
        }
    } catch (error) {
        console.warn('Legacy taekwondoData value invalid, ignoring.', error);
    }
    return null;
}

export function getDefaultTournamentState() {
    return createBaseState();
}

export function registerMigration(migrateFn) {
    if (typeof migrateFn === 'function') {
        migrationPipeline.push(migrateFn);
    }
}

export function loadTournamentState() {
    const stored = parseState(readStorage(STORAGE_KEY));
    if (stored) {
        const migrated = applyMigrations(stored);
        return {
            ...createBaseState(),
            ...migrated,
            schemaVersion: SCHEMA_VERSION
        };
    }

    const legacyRaw = readStorage(LEGACY_KEY);
    if (legacyRaw) {
        const legacyState = loadLegacyState(legacyRaw);
        if (legacyState) {
            removeStorage(LEGACY_KEY);
            return saveTournamentState(legacyState);
        }
    }

    const fallback = getDefaultTournamentState();
    return saveTournamentState(fallback);
}

export function saveTournamentState(state) {
    const payload = {
        ...createBaseState(),
        ...deepClone(state),
        schemaVersion: SCHEMA_VERSION,
        lastSyncedAt: new Date().toISOString()
    };
    writeStorage(STORAGE_KEY, JSON.stringify(payload));
    return deepClone(payload);
}

export function resetTournamentState() {
    const defaultState = getDefaultTournamentState();
    writeStorage(STORAGE_KEY, JSON.stringify(defaultState));
    removeStorage(LEGACY_KEY);
    return deepClone(defaultState);
}

export { STORAGE_KEY, SCHEMA_VERSION };
