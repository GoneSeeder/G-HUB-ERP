'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { EditIcon, PlusIcon, SaveIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { DataPanel, PageHeader, PageShell } from '@/components/ui/page-shell';
import { useDialog } from '@/components/ui/dialog-provider';
import { apiFetch } from '@/lib/api';
import { preventEnterSubmit } from '@/lib/form-behavior';
import { queryOptions } from '@/lib/queries';

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
      { code: 'information-name-list', label: 'Name List' },
      { code: 'information-lecture-room', label: 'ห้องบรรยาย' },
      { code: 'information-report', label: 'รายงาน' },
    ],
  },
  {
    code: 'inventory',
    label: 'Supply Chain',
    children: [
      { code: 'inventory-stock', label: 'Inventory' },
    ],
  },
  {
    code: 'sales',
    label: 'Sales',
    children: [
      { code: 'sales-sales', label: 'Sales' },
      { code: 'sales-crm', label: 'CRM' },
      { code: 'sales-pos', label: 'Point Of Sale (POS)' },
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
  const { requestConfirmation } = useDialog();
  const { data: me } = useQuery(queryOptions.me);
  const { data: availableApps = [] } = useQuery(queryOptions.apps);
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
  }, []);

  useEffect(() => {
    setCurrentUserId(me?.sub ?? null);
  }, [me]);

  useEffect(() => {
    setApps(availableApps);
  }, [availableApps]);

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
    const confirmed = await requestConfirmation({
      message: `Delete user "${user.username}"?`,
      variant: 'danger',
    });
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
    <PageShell>
      <PageHeader
        eyebrow="Administration"
        title="Manage Users"
        description="Create users, assign roles, and control app visibility in Hub."
        actions={
          <button
            type="button"
            onClick={openCreateModal}
            className="toolbar-btn-primary"
          >
            <PlusIcon className="erp-action-icon" /> Create User
          </button>
        }
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}

      <DataPanel className="flex-1 overflow-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50">
            <tr>
              <th className="w-16 border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                No.
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                Username
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                Name
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                Password
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                Role
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-left text-xs font-bold uppercase text-slate-400">
                Visible Apps
              </th>
              <th className="border-b border-slate-200 px-4 py-2.5 text-right text-xs font-bold uppercase text-slate-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className="transition hover:bg-sky-50/50">
                <td className="border-b border-slate-100 px-4 py-2.5 text-slate-500">
                  {index + 1}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 font-semibold text-slate-900">
                  {user.username}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
                  {user.name}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 text-slate-600">
                  {user.password}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
                  {roleOptions.find((role) => role.code === user.roleCode)?.label ??
                    user.roleCode}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 text-slate-600">
                  {user.appCodes
                    .filter((code) => managedAppCodes.has(code))
                    .map((code) => appNameByCode.get(code) ?? code)
                    .join(', ') || '-'}
                </td>
                <td className="border-b border-slate-100 px-4 py-2.5 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(user)}
                      className="toolbar-btn min-h-9 px-3"
                    >
                      <EditIcon className="erp-action-icon" /> Edit
                    </button>
                    {user.id !== currentUserId ? (
                      <button
                        type="button"
                        onClick={() => onDeleteUser(user)}
                        className="toolbar-btn-danger min-h-9 px-3"
                      >
                        <TrashIcon className="erp-action-icon" /> Delete
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>

      {modalOpen ? (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={onSubmitUser}
            onKeyDown={preventEnterSubmit}
            className="erp-fade-in max-h-[92vh] w-full max-w-[640px] overflow-auto rounded-xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-xl font-semibold leading-tight text-slate-950">
                  {editingUser ? (
                    <EditIcon className="h-5 w-5 text-[#1478ff]" />
                  ) : (
                    <PlusIcon className="h-5 w-5 text-[#1478ff]" />
                  )}
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
                <XIcon className="erp-action-icon" /> Close
              </button>
            </div>

            {modalError ? (
              <div className="mx-5 mt-4 rounded-md border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {modalError}
              </div>
            ) : null}

            <div className="grid gap-4 px-5 py-4 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-700">
                  Username
                </span>
                <span className="flex h-11 rounded-lg border border-slate-200 bg-white transition focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
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
                <span className="flex h-11 rounded-lg border border-slate-200 bg-white transition focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
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
                <span className="flex h-11 rounded-lg border border-slate-200 bg-white transition focus-within:border-[#1478ff] focus-within:ring-4 focus-within:ring-[rgba(20,120,255,0.14)]">
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
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-[#1478ff] focus:ring-4 focus:ring-[rgba(20,120,255,0.14)]"
                >
                  {roleOptions.map((role) => (
                    <option key={role.code} value={role.code}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mx-5 rounded-lg border border-slate-200 bg-slate-50/60 p-4">
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
                        <span className="text-[#1478ff]">
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
                          className="h-4 w-4 accent-[#1478ff]"
                        />
                        <span>{group.label}</span>
                      </label>

                      {folderChecked ? (
                        <div className="space-y-1 border-t border-slate-200 bg-sky-50/45 px-8 py-3">
                          {group.children.map((child) => (
                            <label
                              key={child.code}
                              className="flex items-center gap-3 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-white"
                            >
                              <span className="text-[#1478ff]">
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
                                className="h-4 w-4 accent-[#1478ff]"
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

            <div className="mt-5 flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="toolbar-btn px-5"
              >
                <XIcon className="erp-action-icon" /> Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="toolbar-btn-primary px-5"
              >
                <SaveIcon className="erp-action-icon" /> {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </PageShell>
  );
}

