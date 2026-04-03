const fs = require('fs');
let code = fs.readFileSync('src/components/PhishingDemo.tsx', 'utf-8');

// 1. Make buttons smaller (.action-btn class)
code = code.replace(
  /\.action-btn \{\s*width: 100%;\s*padding: 12px;\s*background: rgba\(15,23,42,0\.8\);\s*border: 1px solid #3b82f6;\s*border-radius: 8px;\s*color: #60a5fa;\s*font-family: 'VT323', monospace;\s*font-size: 16px;/g,
  `.action-btn {
          width: 100%;
          padding: 8px 12px;
          background: rgba(15,23,42,0.8);
          border: 1px solid #3b82f6;
          border-radius: 8px;
          color: #60a5fa;
          font-family: 'VT323', monospace;
          font-size: 14px;`
);

// We should also adjust margin-bottom: 12px to 8px inside .action-btn
code = code.replace(/margin-bottom: 12px;/g, 'margin-bottom: 8px;');

// 2 & 3 & 4. Move to top, remove eneba, fix holo taco
// Let's remove the Action Buttons section from its original place and put it at the top
const actionButtonsSectionRegex = /\s*\{\/\* Action Buttons \*\/\}\s*<div style=\{\{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '8px' \}\}>[\s\S]*?<\/div>\s*(?=\{\/\* Educational Disclaimer \*\/\})/g;

// First check if we can match it
const match = code.match(actionButtonsSectionRegex);
if (!match) {
  console.log("Could not find Action Buttons section");
  process.exit(1);
}

// Remove it from original place
code = code.replace(actionButtonsSectionRegex, '\n\n        ');

// Prepare new buttons section
const newButtonsSection = `
        {/* Action Buttons */}
        <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <button className="action-btn" onClick={() => setShowFlagPopup(true)}>
            VER FLAG AUTOFILL
          </button>
          
          <a href="https://www.beyondpolish.com/checkouts/cn/hWNAbX9yp2hhr233PSN82jLd/en-us?_r=AQAB_YU51kRzDDS1mmcPyxIn9Yspo3i3Vl7Nz4qgZPwZ7iQ&auto_redirect=false&edge_redirect=true&skip_shop_pay=true" target="_blank" rel="noopener noreferrer" className="action-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', lineHeight: '1.2' }}>
            <span>Actualizar Datos</span>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>Beyond</span>
          </a>
        </div>
`;

// Insert it at the top of the main layout container
const mainLayoutRegex = /(\{\/\* Main layout \*\/\}\s*<div\s*style=\{\{[\s\S]*?\}\}\s*>)/;
if (!code.match(mainLayoutRegex)) {
  console.log("Could not find Main layout section");
  process.exit(1);
}

code = code.replace(mainLayoutRegex, `$1${newButtonsSection}`);

// 5. Make notice smaller
const disclaimerRegex = /(<div style=\{\{\s*marginTop: '32px',\s*padding: )'16px'(,\s*borderTop: '1px solid rgba\(59,130,246,0\.3\)',\s*width: '100%',\s*maxWidth: '800px',\s*textAlign: 'center',\s*fontFamily: 'VT323, monospace',\s*fontSize: )'16px'/;

code = code.replace(disclaimerRegex, `$1'10px'$2'12px'`);

// Also change ESTO SOLO ES UNA PRUEBA... text to perhaps be in standard case? The user just said make it smaller.
// Let's leave text uppercase.

fs.writeFileSync('src/components/PhishingDemo.tsx', code);
console.log("Updated!");
