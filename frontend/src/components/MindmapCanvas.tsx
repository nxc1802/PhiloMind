import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  Position,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface Concept {
  id: string;
  title: string;
  difficulty: string;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  orderIndex: number;
}

interface MindmapCanvasProps {
  concepts: Concept[];
  onSelectConcept: (conceptId: string) => void;
}

export default function MindmapCanvas({ concepts, onSelectConcept }: MindmapCanvasProps) {
  // Convert standard concepts array into React Flow nodes structure
  const initialNodes: Node[] = useMemo(() => {
    // Generate beautiful layout positions
    // Center node: Existentialism. Let's arrange concepts radially or in a custom tree format
    const nodesList: Node[] = [
      {
        id: 'core-hub',
        type: 'default',
        data: {
          label: (
            <div className="flex flex-col items-center justify-center p-3 select-none text-center">
              <span className="material-symbols-outlined text-secondary dark:text-primary-fixed-dim text-3xl mb-1">public</span>
              <span className="font-extrabold text-sm text-primary dark:text-white leading-tight">Existentialism</span>
              <span className="text-[9px] uppercase tracking-wider text-secondary font-black mt-1">Core Hub</span>
            </div>
          ),
        },
        position: { x: 350, y: 250 },
        style: {
          width: 140,
          height: 140,
          borderRadius: '9999px',
          background: 'var(--surface-container-lowest)',
          border: '4px solid var(--secondary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        },
      },
    ];

    // Radial layout vectors for child concept nodes
    const angles = [135, 225, 45, 315];
    const distance = 250;

    concepts.forEach((concept, idx) => {
      const angle = (angles[idx % angles.length] * Math.PI) / 180;
      const x = 350 + distance * Math.cos(angle) - 96; // Offset half node width (192px / 2 = 96)
      const y = 250 + distance * Math.sin(angle) - 40; // Offset half node height (80px / 2 = 40)

      let borderStyle = 'border-slate-300 dark:border-slate-700';
      let statusLabel = 'Locked';
      let labelClass = 'text-slate-400';
      let icon = 'lock';
      let iconClass = 'bg-slate-300 dark:bg-slate-700 text-slate-500';
      let isBreathing = false;
      let opacity = 'opacity-60 grayscale';

      if (concept.status === 'completed') {
        borderStyle = 'border-emerald-500';
        statusLabel = 'Completed';
        labelClass = 'text-emerald-500';
        icon = 'check';
        iconClass = 'bg-emerald-500 text-white';
        opacity = 'opacity-100';
      } else if (concept.status === 'in_progress') {
        borderStyle = 'border-purple-500';
        statusLabel = 'In Progress';
        labelClass = 'text-purple-500';
        icon = 'play_arrow';
        iconClass = 'bg-purple-500 text-white';
        isBreathing = true;
        opacity = 'opacity-100';
      } else if (concept.status === 'available') {
        borderStyle = 'border-indigo-500';
        statusLabel = 'Unlocked';
        labelClass = 'text-indigo-500';
        icon = 'lock_open';
        iconClass = 'border-2 border-indigo-500 text-indigo-500 bg-white dark:bg-slate-800';
        opacity = 'opacity-100';
      }

      nodesList.push({
        id: concept.id,
        type: 'default',
        data: {
          label: (
            <div
              className={`flex items-center gap-3 p-2.5 cursor-pointer ${opacity}`}
              onClick={() => {
                if (concept.status !== 'locked') {
                  onSelectConcept(concept.id);
                }
              }}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${iconClass}`}>
                <span className="material-symbols-outlined text-[15px]">{icon}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-bold text-xs text-primary dark:text-white truncate">{concept.title}</div>
                <div className={`text-[9px] uppercase tracking-widest font-black ${labelClass}`}>{statusLabel}</div>
              </div>
            </div>
          ),
        },
        position: { x, y },
        style: {
          width: 192,
          height: 60,
          borderRadius: '9999px',
          background: 'var(--surface-container-lowest)',
          borderWidth: '2px',
          borderStyle: 'solid',
          borderColor: 'transparent',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
        className: `${borderStyle} ${isBreathing ? 'node-breathing' : ''}`,
      });
    });

    return nodesList;
  }, [concepts, onSelectConcept]);

  const initialEdges: Edge[] = useMemo(() => {
    const edgesList: Edge[] = [];
    concepts.forEach((concept) => {
      // Connect hub directly to child roadmaps
      edgesList.push({
        id: `edge-hub-${concept.id}`,
        source: 'core-hub',
        target: concept.id,
        animated: concept.status === 'in_progress',
        style: {
          stroke: concept.status === 'locked' ? 'var(--node-locked)' : 'var(--accent-purple)',
          strokeWidth: concept.status === 'locked' ? 1.5 : 2.5,
          strokeDasharray: '4 4',
        },
      });
    });
    return edgesList;
  }, [concepts]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background color="#7c5dfa" gap={20} size={1} opacity={0.06} />
        <Controls showInteractive={false} className="glass-floating border border-glass-stroke rounded-xl overflow-hidden shadow-md" />
      </ReactFlow>
    </div>
  );
}
