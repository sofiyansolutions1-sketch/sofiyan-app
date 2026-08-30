const fs = require('fs');
const code = fs.readFileSync('pages/PartnerPanel.tsx', 'utf8');

// try to parse it with typescript to find the exact error location
const ts = require('typescript');
let sourceFile = ts.createSourceFile('PartnerPanel.tsx', code, ts.ScriptTarget.Latest, true);

function traverse(node) {
    if (node.kind === ts.SyntaxKind.JsxExpression) {
        // console.log("expression");
    }
    ts.forEachChild(node, traverse);
}
traverse(sourceFile);
console.log("AST parsed");
