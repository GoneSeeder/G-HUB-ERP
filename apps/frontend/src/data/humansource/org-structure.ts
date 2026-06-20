// Org-structure data layer (lifted from hr-org-structure.tsx in P2).
// This is the single source of truth for the org tree; other components import from here.
// Keep ORG_STRUCTURE_STORAGE_KEY unchanged so existing persisted data still hydrates.

export type OrgNodeType = 'company' | 'branch' | 'department' | 'team';

export type OrgNode = {
  id: string;
  name: string;
  type: OrgNodeType;
  code?: string;    // stable code for external references (optional, added P2)
  active?: boolean; // undefined treated as active
  children: OrgNode[];
};

export const ORG_STRUCTURE_STORAGE_KEY = 'g-hub.hr.org-structure';

export const ORG_STRUCTURE_SEED: OrgNode[] = [
  {
    id: 'org-ghub',
    name: 'G-HUB Enterprise',
    type: 'company',
    children: [
      {
        id: 'org-ghub-hq',
        name: 'สำนักงานใหญ่',
        type: 'branch',
        children: [
          { id: 'org-ghub-exec',  name: 'ฝ่ายบริหาร',                  type: 'department', children: [] },
          { id: 'org-ghub-hr',   name: 'ฝ่ายบุคคล',                   type: 'department', children: [] },
          { id: 'org-ghub-wh',   name: 'ฝ่ายคลังสินค้า',               type: 'department', children: [] },
          {
            id: 'org-ghub-sales',
            name: 'ฝ่ายขาย',
            type: 'department',
            children: [{ id: 'org-ghub-sales-bkk', name: 'ทีมขายกรุงเทพ', type: 'team', children: [] }],
          },
          { id: 'org-ghub-mkt',  name: 'ฝ่ายการตลาด',                  type: 'department', children: [] },
          { id: 'org-ghub-it',   name: 'ฝ่ายเทคโนโลยีสารสนเทศ',        type: 'department', children: [] },
          { id: 'org-ghub-acc',  name: 'ฝ่ายบัญชีและการเงิน',           type: 'department', children: [] },
        ],
      },
      {
        id: 'org-ghub-cnx',
        name: 'สาขาเชียงใหม่',
        type: 'branch',
        children: [
          { id: 'org-ghub-cnx-sales', name: 'ฝ่ายขาย',          type: 'department', children: [] },
          { id: 'org-ghub-cnx-svc',   name: 'ฝ่ายบริการลูกค้า', type: 'department', children: [] },
        ],
      },
      {
        id: 'org-ghub-hkt',
        name: 'สาขาภูเก็ต',
        type: 'branch',
        children: [
          { id: 'org-ghub-hkt-sales', name: 'ฝ่ายขาย', type: 'department', children: [] },
        ],
      },
    ],
  },
  {
    id: 'org-mhub',
    name: 'M-HUB Enterprise',
    type: 'company',
    children: [{ id: 'org-mhub-hq', name: 'สำนักงานใหญ่', type: 'branch', children: [] }],
  },
];

// ─── Immutable tree helpers ───────────────────────────────────────────────────

export function renameNode(nodes: OrgNode[], id: string, name: string): OrgNode[] {
  return nodes.map((node) =>
    node.id === id
      ? { ...node, name }
      : { ...node, children: renameNode(node.children, id, name) },
  );
}

export function addChildNode(nodes: OrgNode[], parentId: string, child: OrgNode): OrgNode[] {
  return nodes.map((node) =>
    node.id === parentId
      ? { ...node, children: [...node.children, child] }
      : { ...node, children: addChildNode(node.children, parentId, child) },
  );
}

export function removeNode(nodes: OrgNode[], id: string): OrgNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => ({ ...node, children: removeNode(node.children, id) }));
}

/** Find a node by id anywhere in the tree. */
export function findNode(nodes: OrgNode[], id: string): OrgNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/** Find the company-type ancestor of the given node id. Returns null if nodeId IS a company. */
export function findCompanyAncestor(nodes: OrgNode[], targetId: string): OrgNode | null {
  for (const node of nodes) {
    if (node.type === 'company') {
      if (findNode(node.children, targetId)) return node;
    }
  }
  return null;
}

/**
 * Reorder siblings within the same parent.
 * parentId === null means the root-level array.
 * Returns a new immutable tree with the node moved from fromIndex to toIndex.
 */
export function reorderSiblings(
  nodes: OrgNode[],
  parentId: string | null,
  fromIndex: number,
  toIndex: number,
): OrgNode[] {
  if (parentId === null) {
    const arr = [...nodes];
    const [item] = arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, item);
    return arr;
  }
  return nodes.map((node) => {
    if (node.id === parentId) {
      const arr = [...node.children];
      const [item] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, item);
      return { ...node, children: arr };
    }
    return { ...node, children: reorderSiblings(node.children, parentId, fromIndex, toIndex) };
  });
}
