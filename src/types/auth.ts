export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  subscriptionStatus?: string;
}

export enum UserRole {
  STUDENT = 'STUDENT',
  COLLEGE_MENTOR = 'COLLEGE_MENTOR',
  HOD = 'HOD',
  PRINCIPAL = 'PRINCIPAL',
  COLLEGE_ADMIN = 'COLLEGE_ADMIN',
  DATA_ADMIN = 'DATA_ADMIN',
  CORE_DEV = 'CORE_DEV',
}

export interface AuthPermissions {
  canViewDashboard: boolean;
  canViewLabs: boolean;
  canAccessDepartmentOverview: boolean;
  canViewMasterAnalytics: boolean;
  canManageUsers: boolean;
  canModifyAssets: boolean;
  canAccessRootEngine: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, AuthPermissions> = {
  [UserRole.STUDENT]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: false,
    canViewMasterAnalytics: false,
    canManageUsers: false,
    canModifyAssets: false,
    canAccessRootEngine: false,
  },
  [UserRole.COLLEGE_MENTOR]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: false,
    canViewMasterAnalytics: false,
    canManageUsers: false,
    canModifyAssets: false,
    canAccessRootEngine: false,
  },
  [UserRole.HOD]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: true,
    canViewMasterAnalytics: false,
    canManageUsers: false,
    canModifyAssets: false,
    canAccessRootEngine: false,
  },
  [UserRole.PRINCIPAL]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: true,
    canViewMasterAnalytics: true,
    canManageUsers: false,
    canModifyAssets: false,
    canAccessRootEngine: false,
  },
  [UserRole.COLLEGE_ADMIN]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: true,
    canViewMasterAnalytics: true,
    canManageUsers: true,
    canModifyAssets: false,
    canAccessRootEngine: false,
  },
  [UserRole.DATA_ADMIN]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: true,
    canViewMasterAnalytics: true,
    canManageUsers: false,
    canModifyAssets: true,
    canAccessRootEngine: false,
  },
  [UserRole.CORE_DEV]: {
    canViewDashboard: true,
    canViewLabs: true,
    canAccessDepartmentOverview: true,
    canViewMasterAnalytics: true,
    canManageUsers: true,
    canModifyAssets: true,
    canAccessRootEngine: true,
  },
};
