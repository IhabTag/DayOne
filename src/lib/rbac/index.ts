// Route guards
export {
    requiresAuth,
    requiresVerifiedEmail,
    requiresSuperadmin,
    guardPage,
    guardApi,
    isGuardError,
} from './guards';
export type { GuardResult } from './guards';

// Plan entitlements
export {
    getPlanFeatures,
    canAccessFeature,
    getFeatureLimit,
    hasReachedLimit,
    getPlanDisplayName,
    getPlanComparison,
} from './entitlements';
export type { Feature, PlanComparisonItem } from './entitlements';
