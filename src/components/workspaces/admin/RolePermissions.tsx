/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Plus, Edit3, Trash2, Save, X, Loader2, 
  Check, AlertCircle, RefreshCw, Users, Lock, Unlock
} from 'lucide-react';
import { api } from '../../../lib/api';

interface PermissionModule {
  name: string;
  label: string;
  icon: React.ReactNode;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, { enabled: boolean; view: boolean; create: boolean; edit: boolean; delete: boolean }>;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

const PERMISSION_MODULES: PermissionModule[] = [
  { name: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
  { name: 'students', label: 'Students', icon: <Users className="w-4 h-4" /> },
  { name: 'teachers', label: 'Teachers', icon: <Users className="w-4 h-4" /> },
  { name: 'parents', label: 'Parents', icon: <Users className="w-4 h-4" /> },
  { name: 'grades', label: 'Grades', icon: <Shield className="w-4 h-4" /> },
  { name: 'sections', label: 'Sections', icon: <Shield className="w-4 h-4" /> },
  { name: 'attendance', label: 'Attendance', icon: <Shield className="w-4 h-4" /> },
  { name: 'payments', label: 'Payments', icon: <Shield className="w-4 h-4" /> },
  { name: 'reports', label: 'Reports', icon: <Shield className="w-4 h-4" /> },
  { name: 'settings', label: 'Settings', icon: <Shield className="w-4 h-4" /> },
];

export const RolePermissionsManager: React.FC<{ triggerToast: (msg: string) => void }> = ({ triggerToast }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: {} as any });

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const rolesData = await api.getRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load roles:', error);
      triggerToast('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const initializePermissions = () => {
    const permissions: any = {};
    PERMISSION_MODULES.forEach(module => {
      permissions[module.name] = { enabled: false, view: false, create: false, edit: false, delete: false };
    });
    return permissions;
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const permissions = newRole.permissions && Object.keys(newRole.permissions).length > 0 
        ? newRole.permissions 
        : initializePermissions();
      
      await api.createRole({
        name: newRole.name,
        description: newRole.description,
        permissions
      });
      
      triggerToast('Role created successfully');
      setShowAddModal(false);
      setNewRole({ name: '', description: '', permissions: {} });
      await loadRoles();
    } catch (error) {
      console.error('Failed to create role:', error);
      triggerToast('Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (roleId: string, updates: any) => {
    setLoading(true);
    try {
      await api.updateRole(roleId, updates);
      triggerToast('Role updated successfully');
      await loadRoles();
    } catch (error) {
      console.error('Failed to update role:', error);
      triggerToast('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await api.deleteRole(roleId);
      triggerToast('Role deleted successfully');
      await loadRoles();
    } catch (error) {
      console.error('Failed to delete role:', error);
      triggerToast('Failed to delete role');
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (role: Role, moduleName: string, permission: string) => {
    const updatedPermissions = {
      ...role.permissions,
      [moduleName]: {
        ...role.permissions[moduleName],
        [permission]: !role.permissions[moduleName]?.[permission]
      }
    };
    
    handleUpdateRole(role.id, { permissions: updatedPermissions });
  };

  const toggleModuleEnabled = (role: Role, moduleName: string) => {
    const isEnabled = role.permissions[moduleName]?.enabled;
    const updatedPermissions = {
      ...role.permissions,
      [moduleName]: {
        ...role.permissions[moduleName],
        enabled: !isEnabled,
        // When disabling a module, disable all permissions
        ...(!isEnabled ? { view: false, create: false, edit: false, delete: false } : {})
      }
    };
    
    handleUpdateRole(role.id, { permissions: updatedPermissions });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Roles & Permissions
          </h2>
          <p className="text-xs text-slate-450">Manage user roles and their access permissions</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadRoles}
            className="h-8 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true);
              setNewRole({ name: '', description: '', permissions: initializePermissions() });
            }}
            className="h-8 px-3 bg-brand-blue hover:bg-brand-indigo text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Role</span>
          </button>
        </div>
      </div>

      {/* Roles List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brand-blue" />
          <span className="ml-2 text-sm text-slate-500">Loading roles...</span>
        </div>
      ) : roles.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Shield className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">No roles configured yet</p>
          <p className="text-xs text-slate-500 mt-1">Create your first role to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map((role) => (
            <div key={role.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    role.is_system_role ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {role.is_system_role ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">{role.name}</h3>
                    <p className="text-xs text-slate-500">{role.description || 'No description'}</p>
                    {role.is_system_role && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-blue/10 text-brand-blue text-[9px] font-bold font-mono uppercase rounded">
                        System Role
                      </span>
                    )}
                  </div>
                </div>
                {!role.is_system_role && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Permissions Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800">
                      <th className="text-left py-2 px-3 font-mono font-bold uppercase text-slate-450">Module</th>
                      <th className="text-center py-2 px-2 font-mono font-bold uppercase text-slate-450">Enabled</th>
                      <th className="text-center py-2 px-2 font-mono font-bold uppercase text-slate-450">View</th>
                      <th className="text-center py-2 px-2 font-mono font-bold uppercase text-slate-450">Create</th>
                      <th className="text-center py-2 px-2 font-mono font-bold uppercase text-slate-450">Edit</th>
                      <th className="text-center py-2 px-2 font-mono font-bold uppercase text-slate-450">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PERMISSION_MODULES.map((module) => {
                      const modulePermissions = role.permissions[module.name] || { enabled: false, view: false, create: false, edit: false, delete: false };
                      return (
                        <tr key={module.name} className="border-b border-slate-100 dark:border-slate-850">
                          <td className="py-2 px-3 flex items-center gap-2">
                            <span className="text-slate-400">{module.icon}</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{module.label}</span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => toggleModuleEnabled(role, module.name)}
                              disabled={false}
                              className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${
                                modulePermissions.enabled
                                  ? 'bg-brand-blue text-white dark:bg-brand-blue/80'
                                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                              }`}
                              title={modulePermissions.enabled ? 'Disable module' : 'Enable module'}
                            >
                              {modulePermissions.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </button>
                          </td>
                          {['view', 'create', 'edit', 'delete'].map((permission) => (
                            <td key={permission} className="py-2 px-2 text-center">
                              <button
                                onClick={() => togglePermission(role, module.name, permission)}
                                disabled={!modulePermissions.enabled}
                                className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${
                                  modulePermissions[permission]
                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                                } ${!modulePermissions.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={`${permission.charAt(0).toUpperCase() + permission.slice(1)} ${module.label.toLowerCase()}`}
                              >
                                {modulePermissions[permission] ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Add New Role
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                    placeholder="e.g., Department Head"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-mono text-slate-450 font-bold uppercase block">Description</label>
                  <input
                    type="text"
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg"
                    placeholder="Role description"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-450 font-bold uppercase block mb-2">Permissions</label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 rounded-lg p-3">
                  {PERMISSION_MODULES.map((module) => (
                    <div key={module.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{module.icon}</span>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{module.label}</span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const isEnabled = newRole.permissions[module.name]?.enabled;
                            const updatedPermissions = {
                              ...newRole.permissions,
                              [module.name]: {
                                ...newRole.permissions[module.name],
                                enabled: !isEnabled,
                                ...(!isEnabled ? { view: false, create: false, edit: false, delete: false } : {})
                              }
                            };
                            setNewRole({...newRole, permissions: updatedPermissions});
                          }}
                          className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                            newRole.permissions[module.name]?.enabled
                              ? 'bg-brand-blue text-white dark:bg-brand-blue/80'
                              : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                          }`}
                        >
                          {newRole.permissions[module.name]?.enabled ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        </button>
                        {['view', 'create', 'edit', 'delete'].map((permission) => (
                          <button
                            key={permission}
                            type="button"
                            onClick={() => {
                              const updatedPermissions = {
                                ...newRole.permissions,
                                [module.name]: {
                                  ...newRole.permissions[module.name],
                                  [permission]: !newRole.permissions[module.name]?.[permission]
                                }
                              };
                              setNewRole({...newRole, permissions: updatedPermissions});
                            }}
                            disabled={!newRole.permissions[module.name]?.enabled}
                            className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer transition-colors ${
                              newRole.permissions[module.name]?.[permission]
                                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600'
                            } ${!newRole.permissions[module.name]?.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            {newRole.permissions[module.name]?.[permission] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="h-10 px-4 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="h-10 px-4 bg-brand-blue hover:bg-brand-indigo text-white rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{loading ? 'Creating...' : 'Create Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
