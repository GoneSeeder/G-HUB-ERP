'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { publicApiFetch } from '@/lib/api';
import { type Employee } from '@/data/humansource/mock';
import { type OrgNode } from '@/data/humansource/org-structure';

type ApiJobLevel = { id: string; nameTh: string; nameEn: string; rank: number };
type ApiPosition = { id: string; nameTh: string; jobLevelId: string };

type ChartMode = 'reporting' | 'org-unit';

function findOrgPath(nodes: OrgNode[], targetId: string, path: OrgNode[] = []): OrgNode[] | null {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.id === targetId) return nextPath;
    const found = findOrgPath(node.children, targetId, nextPath);
    if (found) return found;
  }
  return null;
}

function buildReportingChain(target: Employee, employees: Employee[]): Employee[] {
  const byId = new Map(employees.map((e) => [e.id, e]));
  const chain: Employee[] = [target];
  let current = target;
  const seen = new Set([target.id]);
  while (current.supervisorId && byId.has(current.supervisorId) && !seen.has(current.supervisorId)) {
    const supervisor = byId.get(current.supervisorId)!;
    chain.unshift(supervisor);
    seen.add(supervisor.id);
    current = supervisor;
  }
  return chain;
}

function JobLevelHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="hr-emp-orgchart-tier__header">
      <span className="hr-emp-orgchart-tier__header-label">{label}</span>
      {count !== undefined ? <span className="hr-emp-orgchart-tier__header-count">{count}/{count}</span> : null}
    </div>
  );
}

function PersonCard({ person, self }: { person: Employee; self?: boolean }) {
  const initial = person.name.trim().charAt(0) || '?';
  return (
    <div className={`hr-emp-orgchart-person${self ? ' hr-emp-orgchart-person--self' : ''}`}>
      <span className="hr-emp-orgchart-person__avatar">{initial}</span>
      <span className="hr-emp-orgchart-person__name">{person.name}</span>
    </div>
  );
}

function Connector() {
  return <div className="hr-emp-orgchart-connector" aria-hidden />;
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" />
    </svg>
  );
}

function RecenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

export function EmployeeOrgChartTab({ employee }: { employee: Employee }) {
  const [mode, setMode] = useState<ChartMode>('reporting');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [jobLevels, setJobLevels] = useState<ApiJobLevel[]>([]);
  const [positions, setPositions] = useState<ApiPosition[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      publicApiFetch<Employee[]>('/api/humansource/employees'),
      publicApiFetch<ApiJobLevel[]>('/api/humansource/job-levels'),
      publicApiFetch<ApiPosition[]>('/api/humansource/positions'),
    ])
      .then(([e, jl, p]) => {
        if (!alive) return;
        setEmployees(e);
        setJobLevels(jl);
        setPositions(p);
      })
      .catch(() => { /* keep empty — chart shows the loading/empty state */ })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (mode !== 'org-unit' || orgTree.length > 0) return;
    publicApiFetch<OrgNode[]>('/api/humansource/org-structure/tree')
      .then((tree) => setOrgTree(tree))
      .catch(() => { /* keep empty */ });
  }, [mode, orgTree.length]);

  useEffect(() => {
    setZoom(1);
    window.requestAnimationFrame(() => {
      treeRef.current?.querySelector('[data-self="true"]')?.scrollIntoView({ block: 'center', inline: 'center' });
    });
  }, [mode, employee.id]);

  useEffect(() => {
    if (!fullscreen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setFullscreen(false); };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [fullscreen]);

  const positionById = useMemo(() => new Map(positions.map((p) => [p.id, p])), [positions]);
  const jobLevelById = useMemo(() => new Map(jobLevels.map((jl) => [jl.id, jl])), [jobLevels]);

  function jobLevelLabel(person: Employee) {
    const position = positionById.get(person.positionId);
    const jobLevel = position ? jobLevelById.get(position.jobLevelId) : undefined;
    return jobLevel ? `${person.position} (${jobLevel.nameEn})` : person.position;
  }

  function recenter() {
    setZoom(1);
    treeRef.current?.querySelector('[data-self="true"]')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
  }

  async function downloadAsImage() {
    if (!treeRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(treeRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = `org-chart-${employee.code}.png`;
    link.href = dataUrl;
    link.click();
  }

  const reportingChain = useMemo(
    () => (employees.length ? buildReportingChain(employee, employees) : []),
    [employees, employee],
  );
  const directReports = useMemo(
    () => employees.filter((e) => e.supervisorId === employee.id),
    [employees, employee.id],
  );

  const orgPath = useMemo(
    () => (orgTree.length ? findOrgPath(orgTree, employee.departmentNodeId) : null),
    [orgTree, employee.departmentNodeId],
  );
  const orgUnitMembers = useMemo(() => {
    if (!orgPath || orgPath.length === 0) return [];
    const leaf = orgPath[orgPath.length - 1];
    return employees.filter((e) => e.departmentNodeId === leaf.id);
  }, [orgPath, employees]);

  const body = loading ? (
    <p className="hr-emp-orgchart-loading">กำลังโหลด...</p>
  ) : mode === 'reporting' ? (
    reportingChain.length === 0 ? (
      <p className="hr-emp-orgchart-loading">ไม่พบข้อมูลสายบังคับบัญชา</p>
    ) : (
      <div className="hr-emp-orgchart-tree" ref={treeRef}>
        {reportingChain.map((person, index) => {
          const isSelf = index === reportingChain.length - 1;
          const nextPerson = reportingChain[index + 1];
          return (
            <div key={person.id} className="hr-emp-orgchart-tier">
              <JobLevelHeader label={jobLevelLabel(person)} />
              <div data-self={isSelf ? 'true' : undefined}>
                <PersonCard person={person} self={isSelf} />
              </div>
              {!isSelf ? (
                <>
                  <Connector />
                  <div className="hr-emp-orgchart-divider">
                    <span>{nextPerson.department}</span>
                  </div>
                  <Connector />
                </>
              ) : null}
            </div>
          );
        })}
        {directReports.length > 0 ? (
          <div className="hr-emp-orgchart-tier">
            <Connector />
            <div className="hr-emp-orgchart-divider">
              <span>{directReports[0].department}</span>
              <span className="hr-emp-orgchart-divider__count">{directReports.length}/{directReports.length}</span>
            </div>
            <Connector />
            <JobLevelHeader label={jobLevelLabel(directReports[0])} />
            <div className="hr-emp-orgchart-reports-row">
              {directReports.map((report) => <PersonCard key={report.id} person={report} />)}
            </div>
          </div>
        ) : (
          <p className="hr-emp-orgchart-loading">ไม่มีลูกน้องในสายบังคับบัญชา</p>
        )}
      </div>
    )
  ) : !orgPath ? (
    <p className="hr-emp-orgchart-loading">กำลังโหลด...</p>
  ) : (
    <div className="hr-emp-orgchart-tree" ref={treeRef}>
      {orgPath.map((node, index) => (
        <div key={node.id} className="hr-emp-orgchart-tier">
          <JobLevelHeader label={node.name} />
          {index < orgPath.length - 1 ? <Connector /> : null}
        </div>
      ))}
      <Connector />
      <div className="hr-emp-orgchart-reports-row">
        {orgUnitMembers.map((member) => (
          <div key={member.id} data-self={member.id === employee.id ? 'true' : undefined}>
            <PersonCard person={member} self={member.id === employee.id} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="hr-profile-body">
      <div className={`hr-emp-orgchart-wrap${fullscreen ? ' hr-emp-orgchart-wrap--fullscreen' : ''}`}>
        <div className="hr-emp-orgchart-toolbar">
          <p className="hr-emp-orgchart-title">โครงสร้างองค์กร</p>
          <div className="hr-emp-orgchart-toggle">
            <button
              type="button"
              className={`hr-emp-orgchart-toggle__btn${mode === 'reporting' ? ' hr-emp-orgchart-toggle__btn--active' : ''}`}
              onClick={() => setMode('reporting')}
            >
              สายบังคับบัญชา
            </button>
            <button
              type="button"
              className={`hr-emp-orgchart-toggle__btn${mode === 'org-unit' ? ' hr-emp-orgchart-toggle__btn--active' : ''}`}
              onClick={() => setMode('org-unit')}
            >
              สังกัด
            </button>
          </div>
          <div className="hr-emp-orgchart-controls">
            <button type="button" className="hr-emp-orgchart-icon-btn" onClick={downloadAsImage} aria-label="ดาวน์โหลด" title="ดาวน์โหลด">
              <DownloadIcon /> ดาวน์โหลด
            </button>
          </div>
        </div>

        <div ref={canvasRef} className="hr-emp-orgchart-canvas">
          <div className="hr-emp-orgchart-canvas__inner" style={{ transform: `scale(${zoom})` }}>
            {body}
          </div>
          <div className="hr-emp-orgchart-floating-controls">
            <button type="button" className="hr-emp-orgchart-fab" onClick={() => setFullscreen((v) => !v)} aria-label="เต็มจอ" title="เต็มจอ">
              <FullscreenIcon />
            </button>
            <button type="button" className="hr-emp-orgchart-fab" onClick={recenter} aria-label="จัดกึ่งกลาง" title="จัดกึ่งกลาง">
              <RecenterIcon />
            </button>
            <button type="button" className="hr-emp-orgchart-fab" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(1)))} aria-label="ขยาย">+</button>
            <button type="button" className="hr-emp-orgchart-fab" onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))} aria-label="ย่อ">−</button>
          </div>
        </div>
      </div>
    </div>
  );
}
