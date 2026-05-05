import { createElement } from 'react';
import type { ReactElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import type { DocumentProps } from '@react-pdf/renderer';
import CanvasPdfDocument from '../components/CanvasPdfDocument';
import type { Project } from '../hooks/useCanvases';

/**
 * Generates a real PDF from the given canvas project and triggers a browser
 * download. Uses @react-pdf/renderer entirely client-side – no print dialog.
 */
export async function exportCanvasToPdf(project: Project): Promise<void> {
  // CanvasPdfDocument renders a <Document> at its root, satisfying the
  // react-pdf pdf() contract. The cast bridges the generic component type.
  const doc = createElement(CanvasPdfDocument, { project }) as ReactElement<DocumentProps>;
  const blob = await pdf(doc).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `canvas-${project.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
