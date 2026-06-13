/**
 * exportService.js
 * Uses html2canvas + jsPDF so Amharic text renders perfectly
 * through the browser's font engine instead of jsPDF's broken Unicode.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
const fmtTime = (d) => new Date(d).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });
const fmtFull = ()  => { const n = new Date(); return `${fmtDate(n)} ${fmtTime(n)}`; };
const fmtFile = ()  => new Date().toISOString().slice(0, 10);

// ── CSV export (unchanged — works fine) ──────────────────────────────────────
export function exportCSV(items) {
  const headers = ['#', 'Item (Amharic)', 'Item (English)', 'Quantity', 'Unit', 'Category', 'Price (Birr)', 'Low Stock Alert'];
  const rows = items.map((item, i) => [
    i + 1,
    item.name_am || '',
    item.name_en || '',
    item.quantity,
    item.unit || 'pcs',
    item.category || 'Uncategorized',
    item.price_birr || 0,
    item.low_stock_threshold || 3,
  ]);
  const csv = [headers, ...rows]
    .map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hagere-voice-inventory-${fmtFile()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── PDF export ────────────────────────────────────────────────────────────────
export async function exportPDF(items = [], commands = [], lang = 'am', shopInfo = null) {
  // Build the HTML report in a hidden off-screen div
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 794px; background: #fff;
    font-family: 'Noto Sans Ethiopic', system-ui, sans-serif;
    color: #1f2937; font-size: 13px; line-height: 1.5;
  `;
  container.innerHTML = buildReportHTML(items, commands, lang, shopInfo);
  document.body.appendChild(container);

  // Wait for fonts to load
  await document.fonts.ready;
  await new Promise(r => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdfW = 210; // A4 mm
    const pdfH = (canvas.height / canvas.width) * pdfW;

    // If report is taller than one A4 page, split into multiple pages
    const pageH = 297;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    let yOffset = 0;
    const totalPages = Math.ceil(pdfH / pageH);

    for (let p = 0; p < totalPages; p++) {
      if (p > 0) doc.addPage();
      // Draw the slice of the image that fits on this page
      doc.addImage(
        imgData, 'JPEG',
        0, -yOffset,
        pdfW, pdfH,
        undefined, 'FAST'
      );
      yOffset += pageH;
    }

    doc.save(`hagere-voice-report-${fmtFile()}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// ── Build the full HTML report ────────────────────────────────────────────────
function buildReportHTML(items, commands, lang, shopInfo) {
  const shop = shopInfo || {};
  const totalItems   = items.length;
  const totalQty     = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0);
  const totalRevenue = commands
    .filter(c => c.status === 'applied' && c.parsed_action === 'subtract')
    .reduce((s, c) => s + Number(c.revenue_birr || 0), 0);
  const lowStockItems = items.filter(i => (i.quantity || 0) <= (i.low_stock_threshold || 3));
  const appliedCmds  = commands.filter(c => c.status === 'applied');

  // Group inventory by category
  const grouped = {};
  items.forEach(item => {
    const cat = item.category || (lang === 'am' ? 'ያልተመደበ' : 'Uncategorized');
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const actionLabel = (a) => ({
    add: lang === 'am' ? 'ጨምሯል' : 'Added',
    subtract: lang === 'am' ? 'ቀንሷል' : 'Removed',
    set: lang === 'am' ? 'ተቀናጅቷል' : 'Set to',
  }[a] || a || '—');

  return `
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Noto Sans Ethiopic', system-ui, sans-serif; color: #1f2937; background: #fff; }

    /* ── COVER ── */
    .cover {
      background: linear-gradient(135deg, #4a1630 0%, #7b2d4e 60%, #a8436b 100%);
      padding: 48px 48px 40px;
      color: #fff;
      position: relative;
      overflow: hidden;
    }
    .cover-dots {
      position: absolute; inset: 0;
      background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 24px 24px;
    }
    .cover-inner { position: relative; z-index: 1; }
    .cover-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
    .cover-brand h1 { font-size: 32px; font-weight: 900; letter-spacing: 0.04em; color: #fff; }
    .cover-brand p { font-size: 13px; color: rgba(255,255,255,0.7); margin-top: 4px; }
    .cover-meta { text-align: right; font-size: 11px; color: rgba(255,255,255,0.6); line-height: 1.8; }
    .cover-meta strong { color: rgba(255,255,255,0.9); display: block; font-size: 12px; }
    .cover-badge {
      display: inline-block; background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: #f5d7a1; font-size: 11px; font-weight: 700;
      padding: 4px 14px; border-radius: 999px; letter-spacing: 0.1em;
      margin-bottom: 24px;
    }
    .gold-line { height: 3px; background: linear-gradient(90deg, #c9a96e, #f5d7a1, #c9a96e); border-radius: 2px; margin: 24px 0; }

    /* ── KPI GRID ── */
    .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
    .kpi-card {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 12px; padding: 14px 10px;
      text-align: center;
    }
    .kpi-value { font-size: 28px; font-weight: 900; color: #f5d7a1; line-height: 1; }
    .kpi-label { font-size: 10px; color: rgba(255,255,255,0.65); margin-top: 4px; }

    /* ── SHOP CARD ── */
    .shop-section { padding: 24px 48px; background: #faf7f2; border-bottom: 1px solid #e8ddd0; }
    .shop-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-top: 12px; }
    .shop-field label { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; display: block; margin-bottom: 2px; }
    .shop-field span  { font-size: 13px; color: #1f2937; font-weight: 600; }
    .section-title { font-size: 11px; font-weight: 800; color: #7b2d4e; text-transform: uppercase; letter-spacing: 0.1em; }

    /* ── BODY ── */
    .body { padding: 32px 48px; }

    /* ── LOW STOCK ALERT ── */
    .alert-box {
      background: #fffbeb; border: 1.5px solid #f59e0b;
      border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;
    }
    .alert-title { font-size: 11px; font-weight: 800; color: #92400e; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }
    .alert-items { display: flex; flex-wrap: wrap; gap: 8px; }
    .alert-item {
      background: #fff; border: 1px solid #fcd34d;
      border-radius: 8px; padding: 6px 12px;
      font-size: 12px; color: #92400e; font-weight: 600;
    }
    .alert-qty { color: #b91c1c; font-weight: 900; }

    /* ── INVENTORY TABLE ── */
    .inv-section { margin-bottom: 32px; }
    .inv-section-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 8px; padding-bottom: 8px;
      border-bottom: 2px solid #7b2d4e;
    }
    .inv-section-header h3 { font-size: 13px; font-weight: 800; color: #7b2d4e; }
    .inv-section-header span { font-size: 11px; color: #9ca3af; background: #f3e8ef; padding: 2px 8px; border-radius: 999px; }

    table { width: 100%; border-collapse: collapse; }
    thead tr { background: #4a1630; }
    thead th {
      padding: 10px 12px; text-align: left;
      font-size: 11px; font-weight: 700; color: #fff;
      letter-spacing: 0.04em;
    }
    thead th:last-child { text-align: center; }
    tbody tr { border-bottom: 1px solid #f3e4eb; }
    tbody tr:nth-child(even) { background: #fdf7f9; }
    tbody td { padding: 9px 12px; font-size: 12px; color: #374151; vertical-align: middle; }
    td.num { text-align: center; font-weight: 700; font-size: 14px; }
    td.low { color: #b91c1c; background: #fef2f2; }
    td.ok  { color: #065f46; }
    td.status-ok  { color: #065f46; font-weight: 700; text-align: center; background: #d1fae5; border-radius: 4px; }
    td.status-low { color: #b91c1c; font-weight: 700; text-align: center; background: #fee2e2; border-radius: 4px; }
    .price { color: #7b2d4e; font-weight: 700; }

    /* ── COMMANDS TABLE ── */
    .cmd-section { margin-top: 36px; }
    .cmd-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 12px; padding-bottom: 8px;
      border-bottom: 2px solid #c9a96e;
    }
    .cmd-header h3 { font-size: 13px; font-weight: 800; color: #1f2937; }
    .cmd-header .rev-badge {
      background: #d1fae5; color: #065f46; border-radius: 8px;
      padding: 4px 12px; font-size: 12px; font-weight: 700;
    }
    .cmd-table thead tr { background: #c9a96e; }
    .cmd-table thead th { color: #4a1630; }
    .action-add      { color: #065f46; font-weight: 700; }
    .action-subtract { color: #b91c1c; font-weight: 700; }
    .action-set      { color: #7b2d4e; font-weight: 700; }
    .status-applied  { color: #065f46; font-size: 11px; }
    .status-undone   { color: #9ca3af; font-size: 11px; text-decoration: line-through; }
    .status-failed   { color: #b91c1c; font-size: 11px; }

    /* ── FOOTER ── */
    .report-footer {
      margin-top: 40px; padding: 20px 48px;
      background: #1f2937; color: rgba(255,255,255,0.5);
      display: flex; justify-content: space-between; align-items: center;
      font-size: 10px;
    }
    .report-footer strong { color: #f5d7a1; }
  </style>

  <!-- COVER -->
  <div class="cover">
    <div class="cover-dots"></div>
    <div class="cover-inner">
      <div class="cover-top">
        <div class="cover-brand">
          <h1>HAGERE VOICE 🎤</h1>
          <p>Voice-Powered Inventory Management • የድምጽ ቆጠባ አስተዳደር</p>
        </div>
        <div class="cover-meta">
          <strong>INVENTORY REPORT</strong>
          ${fmtFull()}<br>
          Gondar, Ethiopia
        </div>
      </div>

      <div class="gold-line"></div>

      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-value">${totalItems}</div>
          <div class="kpi-label">${lang === 'am' ? 'ዓይነቶች' : 'Item Types'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${totalQty.toLocaleString()}</div>
          <div class="kpi-label">${lang === 'am' ? 'ጠቅላላ ቆጠባ' : 'Total Stock'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${totalRevenue.toLocaleString()}</div>
          <div class="kpi-label">${lang === 'am' ? 'ገቢ (ብር)' : 'Revenue (ETB)'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${lowStockItems.length}</div>
          <div class="kpi-label">${lang === 'am' ? 'ያነሱ ዕቃዎች' : 'Low Stock'}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-value">${appliedCmds.length}</div>
          <div class="kpi-label">${lang === 'am' ? 'ትዕዛዞች' : 'Commands'}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SHOP INFO -->
  <div class="shop-section">
    <div class="section-title">${lang === 'am' ? 'የሱቅ መረጃ' : 'Business Information'}</div>
    <div class="shop-grid">
      <div class="shop-field">
        <label>${lang === 'am' ? 'የሱቅ ስም' : 'Shop Name'}</label>
        <span>${shop.name || (lang === 'am' ? 'የእኔ ሱቅ' : 'My Shop')}</span>
      </div>
      <div class="shop-field">
        <label>${lang === 'am' ? 'ስልክ' : 'Phone'}</label>
        <span>${shop.phone || '—'}</span>
      </div>
      <div class="shop-field">
        <label>${lang === 'am' ? 'አድራሻ' : 'Location'}</label>
        <span>${shop.location || 'Gondar, Ethiopia'}</span>
      </div>
      <div class="shop-field">
        <label>${lang === 'am' ? 'ቀን' : 'Report Date'}</label>
        <span>${fmtDate(new Date())}</span>
      </div>
    </div>
  </div>

  <!-- BODY -->
  <div class="body">

    ${lowStockItems.length > 0 ? `
    <!-- LOW STOCK ALERT -->
    <div class="alert-box">
      <div class="alert-title">⚠️ ${lang === 'am' ? 'ያነሱ ዕቃዎች ማስጠንቀቂያ' : 'Low Stock Alert'} (${lowStockItems.length})</div>
      <div class="alert-items">
        ${lowStockItems.slice(0, 10).map(i => `
          <div class="alert-item">
            ${i.emoji || '📦'} ${i.name_am}${i.name_en ? ` / ${i.name_en}` : ''}
            — <span class="alert-qty">${i.quantity} ${lang === 'am' ? 'ቀሪ' : 'left'}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <!-- INVENTORY BY CATEGORY -->
    <div class="section-title" style="margin-bottom:16px">
      📦 ${lang === 'am' ? 'የቆጠባ ዝርዝር' : 'Inventory List'}
    </div>

    ${Object.entries(grouped).map(([cat, catItems]) => `
    <div class="inv-section">
      <div class="inv-section-header">
        <h3>${cat}</h3>
        <span>${catItems.length} ${lang === 'am' ? 'ዓይነቶች' : 'items'}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>${lang === 'am' ? 'ስም (አማርኛ)' : 'Name (Amharic)'}</th>
            <th>${lang === 'am' ? 'ስም (እንግሊዝኛ)' : 'Name (English)'}</th>
            <th style="text-align:center">${lang === 'am' ? 'ቁጥር' : 'Qty'}</th>
            <th>${lang === 'am' ? 'ክፍል' : 'Unit'}</th>
            <th style="text-align:right">${lang === 'am' ? 'ዋጋ (ብር)' : 'Price (ETB)'}</th>
            <th style="text-align:center">${lang === 'am' ? 'ሁኔታ' : 'Status'}</th>
          </tr>
        </thead>
        <tbody>
          ${catItems.map((item, idx) => {
            const isLow = (item.quantity || 0) <= (item.low_stock_threshold || 3);
            return `
            <tr>
              <td style="color:#9ca3af;font-size:11px">${idx + 1}</td>
              <td><strong>${item.name_am || '—'}</strong></td>
              <td style="color:#6b7280">${item.name_en || '—'}</td>
              <td class="num ${isLow ? 'low' : 'ok'}">${item.quantity}</td>
              <td style="color:#9ca3af;font-size:11px">${item.unit || 'pcs'}</td>
              <td style="text-align:right" class="${item.price_birr > 0 ? 'price' : ''}">${item.price_birr > 0 ? Number(item.price_birr).toFixed(2) : '—'}</td>
              <td class="status-${isLow ? 'low' : 'ok'}">${isLow ? (lang === 'am' ? 'ያነሰ' : 'LOW') : (lang === 'am' ? 'ጥሩ' : 'OK')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    `).join('')}

    ${appliedCmds.length > 0 ? `
    <!-- VOICE COMMANDS LOG -->
    <div class="cmd-section">
      <div class="cmd-header">
        <h3>🎤 ${lang === 'am' ? 'የድምጽ ትዕዛዝ ታሪክ' : 'Voice Command History'}</h3>
        ${totalRevenue > 0 ? `<div class="rev-badge">💰 ${lang === 'am' ? 'ጠቅላላ ገቢ' : 'Total Revenue'}: ${totalRevenue.toLocaleString()} ${lang === 'am' ? 'ብር' : 'ETB'}</div>` : ''}
      </div>
      <table class="cmd-table">
        <thead>
          <tr>
            <th>${lang === 'am' ? 'ጊዜ' : 'Time'}</th>
            <th>${lang === 'am' ? 'ድርጊት' : 'Action'}</th>
            <th>${lang === 'am' ? 'ዕቃ' : 'Item'}</th>
            <th style="text-align:center">${lang === 'am' ? 'ቁጥር' : 'Qty'}</th>
            <th style="text-align:center">${lang === 'am' ? 'በፊት' : 'Before'}</th>
            <th style="text-align:center">${lang === 'am' ? 'በኋላ' : 'After'}</th>
            <th style="text-align:right">${lang === 'am' ? 'ገቢ (ብር)' : 'Revenue'}</th>
          </tr>
        </thead>
        <tbody>
          ${appliedCmds.slice(0, 50).map(cmd => `
          <tr>
            <td style="font-size:11px;color:#9ca3af">${cmd.created_at ? new Date(cmd.created_at).toLocaleString('en-GB', {day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}) : '—'}</td>
            <td class="action-${cmd.parsed_action || 'set'}">${actionLabel(cmd.parsed_action)}</td>
            <td><strong>${cmd.parsed_item || '—'}</strong></td>
            <td style="text-align:center;font-weight:700">${cmd.parsed_quantity ?? '—'}</td>
            <td style="text-align:center;color:#9ca3af">${cmd.quantity_before ?? '—'}</td>
            <td style="text-align:center;font-weight:700;color:#7b2d4e">${cmd.quantity_after ?? '—'}</td>
            <td style="text-align:right;color:#065f46;font-weight:600">${Number(cmd.revenue_birr) > 0 ? Number(cmd.revenue_birr).toFixed(2) : '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}
  </div>

  <!-- FOOTER -->
  <div class="report-footer">
    <div><strong>HAGERE VOICE</strong> • Gondar, Ethiopia • ለኢትዮጵያዊ ሴት ሥራ ፈጣሪዎች</div>
    <div>Generated ${fmtFull()} • © 2026 Hagere Voice</div>
  </div>
  `;
}
