import { readFileSync } from 'fs';

const data = JSON.parse(readFileSync('/tmp/manus-mcp/mcp_result_ed3b45c9d84a4d01b456473f10b86770.json', 'utf-8'));
console.log('Top keys:', Object.keys(data));
console.log('result.data type:', typeof data.result.data);
if (Array.isArray(data.result.data)) {
  console.log('data length:', data.result.data.length);
  console.log('data[0] keys:', Object.keys(data.result.data[0] || {}));
  console.log('data[0]:', JSON.stringify(data.result.data[0], null, 2));
} else if (typeof data.result.data === 'object') {
  console.log('data keys:', Object.keys(data.result.data));
  // check for paging
  if (data.result.data.paging) {
    console.log('paging:', JSON.stringify(data.result.data.paging, null, 2));
  }
}
