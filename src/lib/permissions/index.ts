import { Role, PermissionCheck } from '@/types';

// ============================================================
// ROLE LEVEL HIERARCHY
// ============================================================

const ROLE_LEVELS: Record<Role, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[minRole];
}

// ============================================================
// WORKSPACE PERMISSIONS
// ============================================================

export function canManageWorkspace(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can manage workspace settings.' };
  }
  return { allowed: true };
}

export function canDeleteWorkspace(userRole: Role): PermissionCheck {
  if (userRole !== 'owner') {
    return { allowed: false, reason: 'Only the workspace owner can delete the workspace.' };
  }
  return { allowed: true };
}

export function canManageMembers(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can manage members.' };
  }
  return { allowed: true };
}

export function canInviteMembers(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can invite members.' };
  }
  return { allowed: true };
}

export function canChangeRole(userRole: Role, targetRole: Role, newRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can change roles.' };
  }
  if (ROLE_LEVELS[targetRole] >= ROLE_LEVELS[userRole]) {
    return { allowed: false, reason: 'Cannot change role of a member with equal or higher role.' };
  }
  if (ROLE_LEVELS[newRole] >= ROLE_LEVELS[userRole]) {
    return { allowed: false, reason: 'Cannot assign a role equal to or higher than your own.' };
  }
  return { allowed: true };
}

export function canRemoveMember(userRole: Role, targetRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can remove members.' };
  }
  if (ROLE_LEVELS[targetRole] >= ROLE_LEVELS[userRole]) {
    return { allowed: false, reason: 'Cannot remove a member with equal or higher role.' };
  }
  return { allowed: true };
}

// ============================================================
// PROJECT PERMISSIONS
// ============================================================

export function canCreateProject(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot create projects.' };
  }
  return { allowed: true };
}

export function canEditProject(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot edit projects.' };
  }
  return { allowed: true };
}

export function canDeleteProject(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can delete projects.' };
  }
  return { allowed: true };
}

export function canManageProjectMembers(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can manage project members.' };
  }
  return { allowed: true };
}

// ============================================================
// TASK PERMISSIONS
// ============================================================

export function canCreateTask(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot create tasks.' };
  }
  return { allowed: true };
}

export function canEditTask(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot edit tasks.' };
  }
  return { allowed: true };
}

export function canDeleteTask(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can delete tasks.' };
  }
  return { allowed: true };
}

export function canMoveTask(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot move tasks.' };
  }
  return { allowed: true };
}

export function canAssignTask(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot assign tasks.' };
  }
  return { allowed: true };
}

// ============================================================
// COMMENT PERMISSIONS
// ============================================================

export function canCreateComment(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot create comments.' };
  }
  return { allowed: true };
}

export function canEditComment(userRole: Role, commentAuthorId: string, currentUserId: string): PermissionCheck {
  if (commentAuthorId !== currentUserId && !hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'You can only edit your own comments.' };
  }
  return { allowed: true };
}

export function canDeleteComment(userRole: Role, commentAuthorId: string, currentUserId: string): PermissionCheck {
  if (commentAuthorId !== currentUserId && !hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'You can only delete your own comments.' };
  }
  return { allowed: true };
}

// ============================================================
// BULK PERMISSIONS
// ============================================================

export function canBulkEdit(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'member')) {
    return { allowed: false, reason: 'Viewers cannot perform bulk operations.' };
  }
  return { allowed: true };
}

export function canBulkDelete(userRole: Role): PermissionCheck {
  if (!hasMinRole(userRole, 'admin')) {
    return { allowed: false, reason: 'Only admins and owners can bulk delete.' };
  }
  return { allowed: true };
}

// ============================================================
// UTILITY: Get user role for workspace
// ============================================================

export function getUserWorkspaceRole(
  userId: string,
  workspaceMembers: { userId: string; role: Role }[]
): Role | null {
  const member = workspaceMembers.find(m => m.userId === userId);
  return member?.role ?? null;
}

export function getUserProjectRole(
  userId: string,
  projectMembers: { userId: string; role: Role }[]
): Role | null {
  const member = projectMembers.find(m => m.userId === userId);
  return member?.role ?? null;
}
