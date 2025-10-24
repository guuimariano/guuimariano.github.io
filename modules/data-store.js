import { createDefaultFights } from './default-data.js';

const STORAGE_KEY = 'tournamentState';
const LEGACY_KEY = 'taekwondoData';
const SCHEMA_VERSION = '1.1.0';

const migrationPipeline = [];

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createBaseState(overrides = {}) {
    const analyticsCache = {
        totals: null,
        winsByCategory: null,
        winsByPhase: null,
        performanceByAthlete: null,
        averagePointsPerRound: null,
        penaltiesByCoach: null,
        penaltiesByAthlete: null
    };
    return {
        schemaVersion: SCHEMA_VERSION,
        lastSyncedAt: new Date().toISOString(),
        athletes: [],
        coaches: [],
        trainingLocations: [],
        fights: createDefaultFights(),
        penaltyTypes: [],
        analyticsCache,
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

registerMigration((state) => {
    const s = state || {};
    if (!Array.isArray(s.coaches)) s.coaches = [];
    if (!Array.isArray(s.trainingLocations)) s.trainingLocations = [];
    if (!Array.isArray(s.penaltyTypes)) s.penaltyTypes = [];
    if (!s.analyticsCache || typeof s.analyticsCache !== 'object' || !('totals' in s.analyticsCache)) {
        s.analyticsCache = {
            totals: null,
            winsByCategory: null,
            winsByPhase: null,
            performanceByAthlete: null,
            averagePointsPerRound: null,
            penaltiesByCoach: null,
            penaltiesByAthlete: null,
        };
    }
    return s;
});

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

export function computeAnalytics(snapshot) {
    const fights = snapshot.fights || [];

    const totals = {
        fights: fights.length,
        wins: 0,
        losses: 0,
        pending: 0,
        athletes: 0,
    };

    const winsByCategory = new Map();
    const winsByPhase = new Map();
    const athleteSummary = new Map();
    const roundSummary = new Map();
    const coachPenalties = new Map();
    const athletePenalties = new Map();

    const bucketMap = {
        VITÓRIA: 'wins',
        DERROTA: 'losses',
        'A Definir': 'pending',
    };

    const athleteIds = new Set();

    fights.forEach((fight) => {
        const resultKey = bucketMap[fight.fight_result] || 'pending';
        totals[resultKey] += 1;

        const categoryKey = fight.category || 'Desconhecido';
        const categoryBucket = winsByCategory.get(categoryKey) || { wins: 0, losses: 0, pending: 0 };
        categoryBucket[resultKey] += 1;
        winsByCategory.set(categoryKey, categoryBucket);

        const phaseKey = fight.stage || 'Desconhecida';
        const phaseBucket = winsByPhase.get(phaseKey) || { wins: 0, losses: 0, pending: 0 };
        phaseBucket[resultKey] += 1;
        winsByPhase.set(phaseKey, phaseBucket);

        const athleteKey = fight.athlete_name || 'Sem atleta';
        athleteIds.add(athleteKey);
        const athleteEntry = athleteSummary.get(athleteKey) || { wins: 0, total: 0 };
        if (resultKey === 'wins') athleteEntry.wins += 1;
        athleteEntry.total += 1;
        athleteSummary.set(athleteKey, athleteEntry);

        const coachKey = fight.coach || 'Sem técnico';
        const coachEntry = coachPenalties.get(coachKey) || { accepted: 0, overturned: 0 };
        const ensureCoachEntry = () => {
            if (!coachPenalties.has(coachKey)) {
                coachPenalties.set(coachKey, { accepted: 0, overturned: 0 });
            }
            return coachPenalties.get(coachKey);
        };
        const applyCoachPenalty = (accepted) => {
            if (!coachKey || coachKey === 'Sem técnico') {
                return;
            }
            const entry = ensureCoachEntry();
            if (accepted === false) {
                entry.overturned += 1;
            } else {
                entry.accepted += 1;
            }
            coachPenalties.set(coachKey, entry);
        };
        const penaltySummary = fight.penaltySummary || fight.penalty_summary || [];
        penaltySummary.forEach((penalty) => {
            applyCoachPenalty(penalty.accepted);
            const assessed = penalty.assessedAgainst || penalty.assessed_against || 'UNKNOWN';
            if (assessed === 'ATHLETE') {
                const athletePenEntry = athletePenalties.get(athleteKey) || { penalties: 0, fights: 0 };
                athletePenEntry.penalties += 1;
                athletePenalties.set(athleteKey, athletePenEntry);
            }
        });

        const athletePenEntry = athletePenalties.get(athleteKey) || { penalties: 0, fights: 0 };
        athletePenEntry.fights += 1;
        athletePenalties.set(athleteKey, athletePenEntry);

        (fight.rounds || []).forEach((round) => {
            const roundNumber = Number.isFinite(round.round_number) ? round.round_number : 1;
            const roundEntry = roundSummary.get(roundNumber) || { our: 0, opp: 0, count: 0 };
            if (Number.isFinite(round.score_our_athlete)) {
                roundEntry.our += round.score_our_athlete;
            }
            if (Number.isFinite(round.score_opponent)) {
                roundEntry.opp += round.score_opponent;
            }
            roundEntry.count += 1;
            roundSummary.set(roundNumber, roundEntry);

            (round.penalties || []).forEach((penalty) => {
                applyCoachPenalty(penalty.accepted);
                const assessed = penalty.assessedAgainst || penalty.assessed_against || 'UNKNOWN';
                if (assessed === 'ATHLETE') {
                    const athletePen = athletePenalties.get(athleteKey) || { penalties: 0, fights: 0 };
                    athletePen.penalties += 1;
                    athletePenalties.set(athleteKey, athletePen);
                }
            });
        });
    });

    const winsByCategoryList = Array.from(winsByCategory.entries()).map(([category, stats]) => ({
        category,
        ...stats,
    }));
    const winsByPhaseList = Array.from(winsByPhase.entries()).map(([phase, stats]) => ({
        phase,
        ...stats,
    }));
    const performanceByAthlete = Array.from(athleteSummary.entries()).map(([athlete, stats]) => ({
        athlete,
        winRate: stats.total ? stats.wins / stats.total : 0,
        fights: stats.total,
    }));
    const averagePointsPerRound = Array.from(roundSummary.entries()).map(([roundNumber, stats]) => ({
        roundNumber,
        ourAvg: stats.count ? stats.our / stats.count : 0,
        opponentAvg: stats.count ? stats.opp / stats.count : 0,
    }));
    const penaltiesByCoach = Array.from(coachPenalties.entries()).map(([coach, stats]) => ({
        coach,
        accepted: stats.accepted,
        overturned: stats.overturned,
    }));
    const penaltiesByAthlete = Array.from(athletePenalties.entries()).map(([athlete, stats]) => ({
        athlete,
        penalties: stats.penalties,
        fights: stats.fights,
    }));

    totals.athletes = athleteIds.size;

    return {
        totals,
        winsByCategory: winsByCategoryList,
        winsByPhase: winsByPhaseList,
        performanceByAthlete,
        averagePointsPerRound,
        penaltiesByCoach,
        penaltiesByAthlete,
    };
}

function invalidateAnalyticsCache(snapshot) {
    if (!snapshot.analyticsCache) return snapshot;
    snapshot.analyticsCache = {
        totals: null,
        winsByCategory: null,
        winsByPhase: null,
        performanceByAthlete: null,
        averagePointsPerRound: null,
        penaltiesByCoach: null,
        penaltiesByAthlete: null,
    };
    return snapshot;
}

function ensureAnalytics(snapshot) {
    if (!snapshot.analyticsCache || !snapshot.analyticsCache.totals) {
                const analytics = computeAnalytics(snapshot);
        snapshot.analyticsCache = analytics;
    }
    return snapshot.analyticsCache;
}

export function getTotals(snapshot) {
    return ensureAnalytics(snapshot).totals;
}

export function getWinsByCategory(snapshot) {
    return ensureAnalytics(snapshot).winsByCategory;
}

export function getWinsByPhase(snapshot) {
    return ensureAnalytics(snapshot).winsByPhase;
}

export function getPerformanceByAthlete(snapshot) {
    return ensureAnalytics(snapshot).performanceByAthlete;
}

export function getAveragePointsPerRound(snapshot) {
    return ensureAnalytics(snapshot).averagePointsPerRound;
}

export function getPenaltiesByCoach(snapshot) {
    return ensureAnalytics(snapshot).penaltiesByCoach;
}

export function getPenaltiesByAthlete(snapshot) {
    return ensureAnalytics(snapshot).penaltiesByAthlete;
}

export function computeTotals(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.totals);
}

export function computeWinsByCategory(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.winsByCategory);
}

export function computeWinsByPhase(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.winsByPhase);
}

export function computePerformanceByAthlete(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.performanceByAthlete);
}

export function computeAveragePointsPerRound(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.averagePointsPerRound);
}

export function computePenaltiesByCoach(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.penaltiesByCoach);
}

export function computePenaltiesByAthlete(snapshot) {
    ensureAnalytics(snapshot);
    return deepClone(snapshot.analyticsCache.penaltiesByAthlete);
}

export function withAnalytics(snapshot) {
    const cloned = deepClone(snapshot);
    ensureAnalytics(cloned);
    return cloned;
}
