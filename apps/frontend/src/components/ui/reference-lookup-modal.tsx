'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { EditIcon, PlusIcon, SearchIcon, TrashIcon, XIcon } from '@/components/ui/icons';
import { useDialog } from '@/components/ui/dialog-provider';
import { apiFetch } from '@/lib/api';
import { getFallbackReferenceItems } from '@/lib/reference-lookup-fallback';

export type ReferenceLookupType = 'nation' | 'province' | 'busType' | 'charterCode';

export type ReferenceItem = {
  id: string;
  type: ReferenceLookupType;
  code: string;
  name: string;
  secondaryName?: string;
  nationCode: string;
};

const lookupTitles: Record<ReferenceLookupType, string> = {
  nation: 'Nation Code',
  province: 'Province',
  busType: 'Car-type',
  charterCode: 'Charter Code',
};

function isReferenceApiUnavailable(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.includes('Cannot GET') || message.includes('Cannot POST') || message.includes('Cannot PATCH') || message.includes('Cannot DELETE') || message.includes('status 404');
}

type EditorState = {
  mode: 'add' | 'edit';
  id?: string;
  code: string;
  name: string;
  secondaryName: string;
  nationCode: string;
};

export function ReferenceLookupModal({
  type,
  value,
  canManage,
  nationCode = '',
  onSelect,
  onClose,
}: {
  type: ReferenceLookupType;
  value: string;
  canManage: boolean;
  nationCode?: string;
  onSelect: (item: ReferenceItem) => void;
  onClose: () => void;
}) {
  const { notify, requestConfirmation } = useDialog();
  const [items, setItems] = useState<ReferenceItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [usingFallback, setUsingFallback] = useState(false);

  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);

  const loadItems = async (needle = search) => {
    setLoading(true);
    setError(null);
    const applyRows = (rows: ReferenceItem[]) => {
      setItems(rows);
      const current = rows.find((item) => item.code.toUpperCase() === value.trim().toUpperCase()) ?? rows[0] ?? null;
      setSelectedId(current?.id ?? '');
    };
    try {
      const params = new URLSearchParams();
      if (needle.trim()) params.set('search', needle.trim());
      if (type === 'province' && nationCode.trim()) params.set('nationCode', nationCode.trim());
      const suffix = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch<ReferenceItem[]>(`/api/reference-data/${type}${suffix}`);
      setUsingFallback(false);
      applyRows(data);
    } catch (loadError) {
      setUsingFallback(true);
      setError(null);
      applyRows(getFallbackReferenceItems(type, { search: needle, nationCode }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, nationCode]);

  const submitSelection = (item = selectedItem) => {
    if (!item) return;
    onSelect(item);
    onClose();
  };

  const openAdd = () => {
    setEditor({ mode: 'add', code: '', name: '', secondaryName: '', nationCode: type === 'province' ? nationCode : '' });
  };

  const openEdit = () => {
    if (!selectedItem) {
      notify('Please select a reference row first.', 'info');
      return;
    }
    setEditor({
      mode: 'edit',
      id: selectedItem.id,
      code: selectedItem.code,
      name: selectedItem.name,
      secondaryName: selectedItem.secondaryName ?? '',
      nationCode: selectedItem.nationCode,
    });
  };

  const saveEditor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    const code = editor.code.trim().toUpperCase();
    const name = editor.name.trim();
    const itemNationCode = type === 'province' ? editor.nationCode.trim().toUpperCase() : '';
    if (!code || !name) {
      notify('Code and Name are required.', 'error');
      return;
    }
    const duplicate = items.find(
      (item) =>
        item.code.toUpperCase() === code &&
        item.nationCode.toUpperCase() === itemNationCode &&
        item.id !== editor.id,
    );
    if (duplicate) {
      notify('Reference code already exists.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = JSON.stringify({ code, name, secondaryName: editor.secondaryName.trim(), nationCode: itemNationCode });
      const saved =
        editor.mode === 'edit' && editor.id
          ? await apiFetch<ReferenceItem>(`/api/reference-data/${type}/${editor.id}`, { method: 'PATCH', body: payload })
          : await apiFetch<ReferenceItem>(`/api/reference-data/${type}`, { method: 'POST', body: payload });
      setEditor(null);
      notify(editor.mode === 'edit' ? 'Reference item updated.' : 'Reference item added.', 'success');
      await loadItems(search);
      setSelectedId(saved.id);
    } catch (saveError) {
      if (isReferenceApiUnavailable(saveError)) {
        const localItem: ReferenceItem = {
          id: editor.id ?? `local-${type}-${Date.now()}`,
          type,
          code,
          name,
          secondaryName: editor.secondaryName.trim(),
          nationCode: itemNationCode,
        };
        setItems((current) =>
          editor.mode === 'edit' && editor.id
            ? current.map((item) => (item.id === editor.id ? localItem : item))
            : [...current, localItem].sort((a, b) => a.code.localeCompare(b.code) || a.name.localeCompare(b.name)),
        );
        setSelectedId(localItem.id);
        setEditor(null);
        setUsingFallback(true);
        notify('Reference API is unavailable. Change is kept locally for this session.', 'info');
      } else {
        notify(saveError instanceof Error ? saveError.message : 'Failed to save reference item.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteSelected = async () => {
    if (!selectedItem) {
      notify('Please select a reference row first.', 'info');
      return;
    }
    if (
      !(await requestConfirmation({
        title: 'Delete reference item',
        message: `Delete ${selectedItem.code} - ${selectedItem.name}?`,
        confirmText: 'Delete',
        variant: 'danger',
      }))
    ) {
      return;
    }
    try {
      await apiFetch(`/api/reference-data/${type}/${selectedItem.id}`, { method: 'DELETE' });
      notify('Reference item deleted.', 'success');
      await loadItems(search);
    } catch (deleteError) {
      if (isReferenceApiUnavailable(deleteError)) {
        setItems((current) => current.filter((item) => item.id !== selectedItem.id));
        setSelectedId('');
        setUsingFallback(true);
        notify('Reference API is unavailable. Row was removed locally for this session.', 'info');
      } else {
        notify(deleteError instanceof Error ? deleteError.message : 'Failed to delete reference item.', 'error');
      }
    }
  };

  return (
    <div className="modal-backdrop fixed inset-0 z-[80] flex items-center justify-center px-4 py-6">
      <div className="modal-pop flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Reference Lookup</p>
            <h2 className="text-base font-semibold text-slate-900">{lookupTitles[type]}</h2>
            {usingFallback ? <p className="mt-0.5 text-xs text-slate-400">Using local reference data</p> : null}
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={onClose}
            aria-label="Close reference lookup"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <label className="min-w-[260px] flex-1 space-y-1">
            <span className="text-xs font-medium text-slate-600">Find in Grid</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  loadItems(search);
                }
              }}
              className="form-input h-9 rounded-lg text-sm"
              placeholder="Search code or name..."
            />
          </label>
          <button type="button" className="toolbar-btn-primary mt-5 min-h-9" onClick={() => loadItems(search)}>
            <SearchIcon className="erp-action-icon" /> Search
          </button>
          {canManage ? (
            <div className="mt-5 flex items-center gap-1.5">
              <button type="button" className="toolbar-btn min-h-9 px-3" onClick={openAdd}>
                <PlusIcon className="erp-action-icon" /> Add
              </button>
              <button type="button" className="toolbar-btn min-h-9 px-3" onClick={openEdit} disabled={!selectedItem}>
                <EditIcon className="erp-action-icon" /> Edit
              </button>
              <button type="button" className="toolbar-btn min-h-9 px-3 text-red-600" onClick={deleteSelected} disabled={!selectedItem}>
                <TrashIcon className="erp-action-icon" /> Delete
              </button>
            </div>
          ) : null}
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-4">
          {error ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          ) : loading ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">Loading reference data...</div>
          ) : items.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-8 text-center text-sm text-slate-500">No reference rows found.</div>
          ) : (
            <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-lg border border-slate-200 text-sm">
              <thead>
                <tr className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {type === 'province' ? (
                    <>
                      <th className="w-36 border-b border-slate-200 px-3 py-2">Province_Code</th>
                      <th className="border-b border-slate-200 px-3 py-2">Province_Name</th>
                      <th className="border-b border-slate-200 px-3 py-2">Province_Thai</th>
                      <th className="w-28 border-b border-slate-200 px-3 py-2">Nation_Code</th>
                    </>
                  ) : (
                    <>
                      <th className="w-44 border-b border-slate-200 px-3 py-2">Code</th>
                      <th className="border-b border-slate-200 px-3 py-2">Name</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer transition-colors duration-150 ${
                      selectedId === item.id ? 'bg-sky-50 text-slate-950 ring-1 ring-inset ring-sky-100' : 'bg-white hover:bg-slate-50'
                    }`}
                    onClick={() => setSelectedId(item.id)}
                    onDoubleClick={() => submitSelection(item)}
                  >
                    {type === 'province' ? (
                      <>
                        <td className="border-b border-slate-100 px-3 py-2 font-semibold text-slate-800">{item.code}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{item.secondaryName || '-'}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{item.name}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-500">{item.nationCode}</td>
                      </>
                    ) : (
                      <>
                        <td className="border-b border-slate-100 px-3 py-2 font-semibold text-slate-800">{item.code}</td>
                        <td className="border-b border-slate-100 px-3 py-2 text-slate-700">{item.name}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {editor ? (
          <form onSubmit={saveEditor} className="border-t border-slate-100 bg-slate-50/80 px-4 py-3">
            <div className={`grid gap-2 ${type === 'province' ? 'md:grid-cols-[110px_120px_1fr_1fr_auto]' : 'md:grid-cols-[140px_1fr_auto]'}`}>
              {type === 'province' ? (
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Nation</span>
                  <input
                    value={editor.nationCode}
                    onChange={(event) => setEditor({ ...editor, nationCode: event.target.value.toUpperCase() })}
                    className="form-input h-9 rounded-lg text-sm"
                  />
                </label>
              ) : null}
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">{type === 'province' ? 'Province Code' : 'Code'}</span>
                <input
                  value={editor.code}
                  onChange={(event) => setEditor({ ...editor, code: event.target.value.toUpperCase() })}
                  className="form-input h-9 rounded-lg text-sm"
                  autoFocus
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-slate-600">{type === 'province' ? 'Province Thai' : 'Name'}</span>
                <input
                  value={editor.name}
                  onChange={(event) => setEditor({ ...editor, name: event.target.value })}
                  className="form-input h-9 rounded-lg text-sm"
                />
              </label>
              {type === 'province' ? (
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-600">Province Name</span>
                  <input
                    value={editor.secondaryName}
                    onChange={(event) => setEditor({ ...editor, secondaryName: event.target.value })}
                    className="form-input h-9 rounded-lg text-sm"
                  />
                </label>
              ) : null}
              <div className="flex items-end gap-2">
                <button type="button" className="toolbar-btn min-h-9 px-3" onClick={() => setEditor(null)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="toolbar-btn-primary min-h-9 px-3" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        ) : null}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-4 py-3">
          <button type="button" className="toolbar-btn min-h-9 px-4" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="toolbar-btn-primary min-h-9 px-4" onClick={() => submitSelection()} disabled={!selectedItem}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
