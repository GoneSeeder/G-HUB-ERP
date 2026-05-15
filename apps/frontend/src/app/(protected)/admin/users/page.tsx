'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface UserItem {
  id: string;
  username: string;
  name: string;
  password: string;
  roleCode: RoleCode;
  appCodes: string[];
  appNames: string[];
}

interface AppItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
}

interface MeResponse {
  sub: string;
}

type RoleCode = 'admin' | 'user';

interface UserFormState {
  username: string;
  name: string;
  password: string;
  roleCode: RoleCode;
  appCodes: string[];
}

const roleOptions: Array<{ code: RoleCode; label: string }> = [
  { code: 'admin', label: 'Admin' },
  { code: 'user', label: 'User' },
];

const appTree = [
  {
    code: 'information',
    label: 'Information',
    children: [
      { code: 'information-member', label: 'บันทึกข้อมูลสมาชิก' },
      { code: 'information-bonus-card', label: 'บันทึกข้อมูลโบนัสการ์ด' },
      { code: 'information-booking', label: 'บันทึกการจองเข้าร้าน' },
    ],
  },
];

const emptyForm: UserFormState = {
  username: '',
  name: '',
  password: '',
  roleCode: 'user',
  appCodes: [],
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [apps, setApps] = useState<AppItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const appNameByCode = useMemo(
    () => new Map(apps.map((app) => [app.code, app.name])),
    [apps],
  );

  const managedAppCodes = useMemo(
    () =>
      new Set(appTree.flatMap((group) => [group.code, ...group.children.map((child) => child.code)])),
    [],
  );

  const loadUsers = () => {
    apiFetch<UserItem[]>('/api/users')
      .then((data) => setUsers(data))
      .catch(() => setError('You do not have access to manage users.'));
  };

  useEffect(() => {
    loadUsers();
    apiFetch<MeResponse>('/api/auth/me')
      .then((me) => setCurrentUserId(me.sub))
      .catch(() => setCurrentUserId(null));
    apiFetch<AppItem[]>('/api/apps')
      .then((data) => setApps(data))
      .catch(() => setApps([]));
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError(null);
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      name: user.name,
      password: '',
      roleCode: user.roleCode,
      appCodes: user.appCodes.filter((code) => managedAppCodes.has(code)),
    });
    setError(null);
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setModalError(null);
  };

  const setRoleCode = (roleCode: RoleCode) => {
    setForm((current) => ({
      ...current,
      roleCode,
    }));
  };

  const toggleFolder = (folderCode: string) => {
    setForm((current) => ({
      ...current,
      appCodes: current.appCodes.includes(folderCode)
        ? current.appCodes.filter(
            (code) =>
              code !== folderCode &&
              !appTree
                .find((group) => group.code === folderCode)
                ?.children.some((child) => child.code === code),
          )
        : [...current.appCodes, folderCode],
    }));
  };

  const toggleChildApp = (appCode: string) => {
    setForm((current) => ({
      ...current,
      appCodes: current.appCodes.includes(appCode)
        ? current.appCodes.filter((code) => code !== appCode)
        : [...current.appCodes, appCode],
    }));
  };

  const getValidAppCodes = () => {
    return form.appCodes.filter((code) => {
      const group = appTree.find(
        (item) =>
          item.code === code ||
          item.children.some((child) => child.code === code),
      );
      if (!group) {
        return false;
      }
      if (group.code === code) {
        return true;
      }
      return form.appCodes.includes(group.code);
    });
  };

  const onSubmitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setModalError(null);

    const body = {
      username: form.username,
      name: form.name,
      ...(form.password ? { password: form.password } : {}),
      roleCode: form.roleCode,
      appCodes: getValidAppCodes().filter((code) => managedAppCodes.has(code)),
    };

    try {
      if (editingUser) {
        await apiFetch<UserItem>(`/api/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        });
      } else {
        await apiFetch<UserItem>('/api/users', {
          method: 'POST',
          body: JSON.stringify({ ...body, password: form.password }),
        });
      }
      closeModal();
      loadUsers();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : 'Failed to save user.';
      setModalError(
        message.includes('Username already used') || message.includes('409')
          ? 'Username already used'
          : message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteUser = async (user: UserItem) => {
    const confirmed = window.confirm(`Delete user "${user.username}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(`/api/users/${user.id}`, { method: 'DELETE' });
      loadUsers();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Failed to delete user.',
      );
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold text-slate-950">Manage Users</h1>
          <p className="mt-2 text-sm text-slate-600">
            Create users, assign roles, and control app visibility in Hub.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="toolbar-btn-primary uppercase tracking-wide"
        >
          Create User
        </button>
      </div>

      {error ? (
        <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="overflow-hidden border border-white/60 bg-white/60 shadow-[0_12px_26px_rgba(98,56,42,0.12)] backdrop-blur-sm">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 text-left">
                Username
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left">
                Name
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left">
                Password
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left">
                Role
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-left">
                Visible Apps
              </th>
              <th className="border-b border-slate-200 px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border-b border-slate-100 px-4 py-3 font-medium text-slate-900">
                  {user.username}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                  {user.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                  {user.password}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
                  {roleOptions.find((role) => role.code === user.roleCode)?.label ??
                    user.roleCode}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-slate-600">
                  {user.appCodes
                    .filter((code) => managedAppCodes.has(code))
                    .map((code) => appNameByCode.get(code) ?? code)
                    .join(', ') || '-'}
                </td>
                <td className="border-b border-slate-100 px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="toolbar-btn min-h-9 px-3"
                    >
                      Edit
                    </button>
                    {user.id !== currentUserId ? (
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="toolbar-btn-danger min-h-9 px-3"
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={onSubmitUser}
            className="max-h-[92vh] w-full max-w-[560px] overflow-auto rounded-[10px] border border-slate-200/80 bg-white/95 px-7 py-7 shadow-[0_24px_70px_rgba(15,23,42,0.18)] backdrop-blur"
          >
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[26px] font-semibold leading-tight text-slate-950">
                  {editingUser ? 'Edit User' : 'Create User'}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set credentials, permission, and Hub access.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="toolbar-btn"
              >
                Close
              </button>
            </div>

            {modalError ? (
              <div className="mb-5 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {modalError}
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Username
                </span>
                <span className="flex h-12 rounded-md border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="flex w-11 items-center justify-center text-slate-400">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
                    </svg>
                  </span>
                  <input
                    required
                    value={form.username}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        username: event.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </span>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Name
                </span>
                <span className="flex h-12 rounded-md border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="flex w-11 items-center justify-center text-slate-400">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M12 12c2.21 0 4-1.57 4-3.5S14.21 5 12 5 8 6.57 8 8.5 9.79 12 12 12Zm0 2c-3.31 0-6 1.57-6 3.5V19h12v-1.5c0-1.93-2.69-3.5-6-3.5Z" />
                    </svg>
                  </span>
                  <input
                    required
                    value={form.name}
                    placeholder="Person name"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </span>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Password
                </span>
                <span className="flex h-12 rounded-md border border-slate-200 bg-white transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                  <span className="flex w-11 items-center justify-center text-slate-400">
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                      <path d="M17 8h-1V6c0-2.76-1.79-5-4-5S8 3.24 8 6v2H7c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-7-2c0-1.66.9-3 2-3s2 1.34 2 3v2h-4V6Z" />
                    </svg>
                  </span>
                  <input
                    required={!editingUser}
                    type="password"
                    value={form.password}
                    placeholder={editingUser ? 'Leave blank to keep current' : ''}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none"
                  />
                </span>
              </label>

              <label className="block space-y-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  Permission
                </span>
                <select
                  value={form.roleCode}
                  onChange={(event) => setRoleCode(event.target.value as RoleCode)}
                  className="h-12 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {roleOptions.map((role) => (
                    <option key={role.code} value={role.code}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 rounded-[8px] border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Apps visible in Hub
              </p>
              <div className="mt-3 space-y-2">
                {appTree.map((group) => {
                  const folderChecked = form.appCodes.includes(group.code);

                  return (
                    <div
                      key={group.code}
                      className="overflow-hidden rounded-md border border-slate-200 bg-white"
                    >
                      <label className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-800">
                        <span className="text-blue-700">
                          <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            className="h-5 w-5 fill-current"
                          >
                            <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h4.1c.84 0 1.63.38 2.15 1.04l.72.92c.24.31.61.49 1 .49h4.53A2.75 2.75 0 0 1 21 9.2v8.05A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Z" />
                          </svg>
                        </span>
                        <input
                          type="checkbox"
                          checked={folderChecked}
                          onChange={() => toggleFolder(group.code)}
                          className="h-4 w-4 accent-blue-700"
                        />
                        <span>{group.label}</span>
                      </label>

                      {folderChecked ? (
                        <div className="space-y-1 border-t border-slate-200 bg-blue-50/40 px-8 py-3">
                          {group.children.map((child) => (
                            <label
                              key={child.code}
                              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white"
                            >
                              <span className="text-blue-700">
                                <svg
                                  aria-hidden="true"
                                  viewBox="0 0 24 24"
                                  className="h-4 w-4 fill-current"
                                >
                                  <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Zm3 1.25v2.5h10v-2.5H7Zm0 5v1.5h10v-1.5H7Zm0 4v1.5h6v-1.5H7Z" />
                                </svg>
                              </span>
                              <input
                                type="checkbox"
                                checked={form.appCodes.includes(child.code)}
                                onChange={() => toggleChildApp(child.code)}
                                className="h-4 w-4 accent-blue-700"
                              />
                              <span>{appNameByCode.get(child.code) ?? child.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="toolbar-btn px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="toolbar-btn-primary px-5"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}

