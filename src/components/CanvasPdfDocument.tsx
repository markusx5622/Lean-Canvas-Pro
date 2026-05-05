import React from 'react';
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import type { Project } from '../hooks/useCanvases';

// ── Block metadata ───────────────────────────────────────────────────────────

interface BlockMeta {
  id: number;
  order: number;
  title: string;
  accent: string;
}

const BLOCK_META: BlockMeta[] = [
  { id: 1, order: 1,  title: 'Problema',         accent: '#f43f5e' }, // rose-500
  { id: 4, order: 2,  title: 'Solución',          accent: '#f59e0b' }, // amber-500
  { id: 3, order: 3,  title: 'Propuesta Única',   accent: '#8b5cf6' }, // violet-500
  { id: 9, order: 4,  title: 'Ventaja Injusta',   accent: '#3b82f6' }, // blue-500
  { id: 2, order: 5,  title: 'Segmentos',         accent: '#10b981' }, // emerald-500
  { id: 8, order: 6,  title: 'Métricas Clave',    accent: '#f97316' }, // orange-500
  { id: 5, order: 7,  title: 'Canales',           accent: '#14b8a6' }, // teal-500
  { id: 7, order: 8,  title: 'Costes',            accent: '#64748b' }, // slate-500
  { id: 6, order: 9,  title: 'Flujo de Ingresos', accent: '#06b6d4' }, // cyan-500
];

function getMeta(id: number): BlockMeta {
  return BLOCK_META.find((b) => b.id === id)!;
}

// ── Styles ───────────────────────────────────────────────────────────────────

const BORDER_RADIUS = 6;
const GAP = 5;
const CONTENT_FONT = 'Helvetica';
const LABEL_FONT = 'Helvetica-Bold';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f8fafc',
    padding: 20,
    fontFamily: CONTENT_FONT,
  },
  // Header
  header: {
    marginBottom: 10,
    borderBottom: '1pt solid #e2e8f0',
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontFamily: LABEL_FONT,
    fontSize: 18,
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontFamily: LABEL_FONT,
    fontSize: 7,
    color: '#94a3b8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  headerMeta: {
    fontFamily: CONTENT_FONT,
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'right',
  },
  // Main grid row (top area)
  gridRow: {
    flexDirection: 'row',
    flex: 1,
    gap: GAP,
  },
  // Bottom row
  bottomRow: {
    flexDirection: 'row',
    height: 120,
    gap: GAP,
    marginTop: GAP,
  },
  // Column wrappers in the top grid
  colSingle: {
    flex: 2,
    flexDirection: 'column',
  },
  colDouble: {
    flex: 2,
    flexDirection: 'column',
    gap: GAP,
  },
  // Block card
  block: {
    flex: 1,
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#ffffff',
    border: '0.75pt solid #e2e8f0',
    padding: 8,
    overflow: 'hidden',
  },
  blockHalf: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#ffffff',
    border: '0.75pt solid #e2e8f0',
    padding: 8,
    flex: 1,
  },
  blockBottom: {
    borderRadius: BORDER_RADIUS,
    backgroundColor: '#ffffff',
    border: '0.75pt solid #e2e8f0',
    padding: 8,
    flex: 1,
  },
  // Accent bar at the top of each block
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  // Block order badge
  orderBadge: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginTop: 2,
  },
  orderBadgeText: {
    fontFamily: LABEL_FONT,
    fontSize: 7,
    color: '#ffffff',
  },
  blockTitle: {
    fontFamily: LABEL_FONT,
    fontSize: 8,
    color: '#1e293b',
    marginBottom: 5,
    letterSpacing: 0.3,
  },
  blockContent: {
    fontFamily: CONTENT_FONT,
    fontSize: 7.5,
    color: '#334155',
    lineHeight: 1.55,
  },
  blockEmpty: {
    fontFamily: CONTENT_FONT,
    fontSize: 7,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  // Footer
  footer: {
    marginTop: 8,
    borderTop: '0.75pt solid #e2e8f0',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: CONTENT_FONT,
    fontSize: 6.5,
    color: '#94a3b8',
  },
});

// ── Sub-components ────────────────────────────────────────────────────────────

interface BlockCardProps {
  id: number;
  content: string;
  style?: Style;
}

const BlockCard: React.FC<BlockCardProps> = ({ id, content, style }) => {
  const meta = getMeta(id);
  const cardStyle: Style[] = [styles.block];
  if (style) cardStyle.push(style);
  return (
    <View style={cardStyle}>
      <View style={[styles.accentBar, { backgroundColor: meta.accent }]} />
      <View style={[styles.orderBadge, { backgroundColor: meta.accent, marginTop: 6 }]}>
        <Text style={styles.orderBadgeText}>{meta.order}</Text>
      </View>
      <Text style={styles.blockTitle}>{meta.title.toUpperCase()}</Text>
      {content ? (
        <Text style={styles.blockContent}>{content}</Text>
      ) : (
        <Text style={styles.blockEmpty}>Sin completar</Text>
      )}
    </View>
  );
};

// ── Document ──────────────────────────────────────────────────────────────────

interface Props {
  project: Project;
}

const CanvasPdfDocument: React.FC<Props> = ({ project }) => {
  const d = project.data;
  const get = (id: number) => (d[id] ?? '').toString();
  const date = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document
      title={project.name}
      author="Lean Canvas Pro"
      subject="Lean Canvas"
      keywords="lean canvas, startup, business model"
    >
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{project.name}</Text>
            <Text style={styles.headerSub}>Lean Canvas · Modelo de Negocio</Text>
          </View>
          <Text style={styles.headerMeta}>
            Generado el {date} · Lean Canvas Pro
          </Text>
        </View>

        {/* ── Top grid (5 column groups, 2 rows each) ── */}
        <View style={styles.gridRow}>
          {/* Column A: Problema (full height) */}
          <View style={styles.colSingle}>
            <BlockCard id={1} content={get(1)} />
          </View>

          {/* Column B: Solución (top) + Métricas Clave (bottom) */}
          <View style={styles.colDouble}>
            <BlockCard id={4} content={get(4)} style={styles.blockHalf} />
            <BlockCard id={8} content={get(8)} style={styles.blockHalf} />
          </View>

          {/* Column C: Propuesta Única (full height) */}
          <View style={styles.colSingle}>
            <BlockCard id={3} content={get(3)} />
          </View>

          {/* Column D: Ventaja Injusta (top) + Canales (bottom) */}
          <View style={styles.colDouble}>
            <BlockCard id={9} content={get(9)} style={styles.blockHalf} />
            <BlockCard id={5} content={get(5)} style={styles.blockHalf} />
          </View>

          {/* Column E: Segmentos (full height) */}
          <View style={styles.colSingle}>
            <BlockCard id={2} content={get(2)} />
          </View>
        </View>

        {/* ── Bottom row: Costes + Flujo de Ingresos ── */}
        <View style={styles.bottomRow}>
          <BlockCard id={7} content={get(7)} style={styles.blockBottom} />
          <BlockCard id={6} content={get(6)} style={styles.blockBottom} />
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Lean Canvas Pro · lean-canvas-pro.app</Text>
          <Text style={styles.footerText}>
            {Object.values(project.data).filter((v) => v && String(v).trim()).length} / 9 bloques completados
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default CanvasPdfDocument;
