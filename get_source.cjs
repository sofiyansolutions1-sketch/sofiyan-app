const WebSocket = require('ws');
const http = require('http');

http.get('http://localhost:9229/json', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const targets = JSON.parse(data);
    const wsUrl = targets[0].webSocketDebuggerUrl;
    const ws = new WebSocket(wsUrl);
    let id = 1;

    ws.on('open', () => {
      ws.send(JSON.stringify({ id: id++, method: 'Debugger.enable' }));
    });

    const scripts = new Map();

    ws.on('message', (msg) => {
      const response = JSON.parse(msg);
      if (response.method === 'Debugger.scriptParsed') {
        const { scriptId, url } = response.params;
        if (url.includes('PartnerPanel')) {
            console.log(`Found script ${scriptId}: ${url}`);
            ws.send(JSON.stringify({ id: id++, method: 'Debugger.getScriptSource', params: { scriptId } }));
        }
      }
      if (response.result && response.result.scriptSource) {
        require('fs').writeFileSync('recovered.tsx', response.result.scriptSource);
        console.log("Saved to recovered.tsx");
        process.exit(0);
      }
    });
  });
});
