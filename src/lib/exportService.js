/**
 * Export inventory to CSV and PDF (Feature 8)
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { t } from './i18n';

// ── CSV ──────────────────────────────────────────────────────────────────────

export function exportCSV(items, lang = 'en') {
  const headers = [
    t(lang, 'pdfItem'),
    t(lang, 'pdfQty'),
    t(lang, 'pdfUnit'),
    t(lang, 'pdfCategory'),
  ];
  const rows = items.map((item) => [
    item.name_am + (item.name_en ? ` / ${item.name_en}` : ''),
    item.quantity,
    item.unit || 'ቁጥር',
    item.category || t(lang, 'noCategory'),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hagere-voice-inventory-${formatDateForFilename()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── PDF ──────────────────────────────────────────────────────────────────────

export function exportPDF(items, commands = [], lang = 'en') {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const now = new Date();

  // ── Header bar ──
  doc.setFillColor(123, 45, 78); // --primary
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HAGERE VOICE', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(t(lang, 'pdfTitle').replace('HAGERE VOICE — ', ''), 14, 20);

  // Date on the right
  doc.setFontSize(8);
  doc.text(`${t(lang, 'pdfGenerated')}: ${now.toLocaleString()}`, pageWidth - 14, 20, { align: 'right' });

  // ── Summary boxes ──
  const totalItems = items.length;
  const totalQty = items.reduce((s, i) => s + (i.quantity || 0), 0);
  const lowStockCount = items.filter((i) => (i.quantity || 0) <= 3).length;

  drawSummaryBox(doc, 14, 34, 55, 20, totalItems, lang === 'am' ? 'ዓይነቶች' : 'Item Types', '#7b2d4e');
  drawSummaryBox(doc, 77, 34, 55, 20, totalQty, lang === 'am' ? 'ጠቅላላ ብዛት' : 'Total Qty', '#2d6a4f');
  drawSummaryBox(doc, 140, 34, 55, 20, lowStockCount, lang === 'am' ? 'ያለቀ ተቃርቧል' : 'Low Stock', '#b91c1c');

  // ── Inventory table ──
  doc.setTextColor(45, 32, 24);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(lang === 'am' ? 'እቃ ዝርዝር' : 'Inventory List', 14, 63);

  autoTable(doc, {
    startY: 67,
    head: [[
      '#',
      t(lang, 'pdfItem'),
      t(lang, 'pdfQty'),
      t(lang, 'pdfUnit'),
      t(lang, 'pdfCategory'),
    ]],
    body: items.map((item, idx) => [
      idx + 1,
      item.name_am + (item.name_en ? `\n${item.name_en}` : ''),
      item.quantity,
      item.unit || 'ቁጥር',
      item.category || t(lang, 'noCategory'),
    ]),
    headStyles: {
      fillColor: [123, 45, 78],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: [45, 32, 24] },
    alternateRowStyles: { fillColor: [250, 247, 242] },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      2: { halign: 'center', fontStyle: 'bold' },
    },
    didDrawCell: (data) => {
      // Red highlight for low-stock rows
      if (data.section === 'body' && data.column.index === 2) {
        const qty = items[data.row.index]?.quantity ?? 999;
        if (qty <= 3) {
          doc.setFillColor(254, 226, 226);
          doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          doc.setTextColor(185, 28, 28);
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.text(String(qty), data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ── Recent commands table ──
  if (commands.length > 0) {
    const afterInventory = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(45, 32, 24);
    doc.text(lang === 'am' ? 'የቅርብ ጊዜ ትዕዛዞች' : 'Recent Commands', 14, afterInventory);

    const ACTION_LABELS = {
      add: lang === 'am' ? 'ጨመረ' : 'Added',
      subtract: lang === 'am' ? 'ቀነሰ' : 'Subtracted',
      set: lang === 'am' ? 'ቀምሯል' : 'Set',
    };

    autoTable(doc, {
      startY: afterInventory + 4,
      head: [[
        lang === 'am' ? 'ትዕዛዝ' : 'Command',
        lang === 'am' ? 'እቃ' : 'Item',
        lang === 'am' ? 'ድርጊት' : 'Action',
        lang === 'am' ? 'ከ→ወደ' : 'Before→After',
        lang === 'am' ? 'ቀን' : 'Date',
      ]],
      body: commands.slice(0, 15).map((cmd) => [
        cmd.raw_transcript || '',
        cmd.parsed_item || '',
        ACTION_LABELS[cmd.parsed_action] || cmd.parsed_action || '',
        cmd.quantity_before != null ? `${cmd.quantity_before}→${cmd.quantity_after}` : '—',
        cmd.created_at ? new Date(cmd.created_at).toLocaleString() : '—',
      ]),
      headStyles: {
        fillColor: [212, 165, 116],
        textColor: [45, 32, 24],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: [45, 32, 24] },
      alternateRowStyles: { fillColor: [253, 242, 247] },
      margin: { left: 14, right: 14 },
    });
  }

  // ── Footer ──
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(107, 92, 82);
    doc.text(
      `HAGERE VOICE  •  ${now.toLocaleDateString()}  •  ${lang === 'am' ? 'ገጽ' : 'Page'} ${i} / ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 6,
      { align: 'center' }
    );
  }

  doc.save(`hagere-voice-inventory-${formatDateForFilename()}.pdf`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function drawSummaryBox(doc, x, y, w, h, value, label, color) {
  const [r, g, b] = hexToRgb(color);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');

  doc.setTextColor(r, g, b);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(String(value), x + w / 2, y + 11, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 92, 82);
  doc.text(label, x + w / 2, y + 17, { align: 'center' });
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0];
}

function formatDateForFilename() {
  return new Date().toISOString().slice(0, 10);
}
