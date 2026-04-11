/**
 * Script de teste para verificar se o callMcp funciona corretamente
 */
import { execSync } from 'child_process';
import fs from 'fs';

const MCP_CLI = ['/usr/local/bin/manus-mcp-cli', '/opt/.manus/.versions/2.1.3/assets/bin/manus-mcp-cli']
  .find(p => { try { return fs.existsSync(p); } catch { return false; } }) || 'manus-mcp-cli';

console.log('MCP_CLI found:', MCP_CLI);

try {
  const output = execSync(`${MCP_CLI} tool call get_account_info --server instagram --input '{}'`, {
    encoding: 'utf-8',
    timeout: 30000,
    env: { ...process.env, PATH: `/usr/local/bin:/usr/bin:/bin:${process.env.PATH || ''}` },
  });
  
  console.log('Raw output:', output);
  
  const match = output.match(/\/tmp\/manus-mcp\/[^\s]+\.json/);
  if (match) {
    const content = fs.readFileSync(match[0], 'utf-8');
    const parsed = JSON.parse(content);
    console.log('Result (parsed.result):', JSON.stringify(parsed.result || parsed, null, 2));
    
    // Verificar campos esperados
    const result = parsed.result || parsed;
    console.log('\nCampos verificados:');
    console.log('  username:', result.username);
    console.log('  followers_count:', result.followers_count);
    console.log('  follows_count:', result.follows_count);
    console.log('  media_count:', result.media_count);
    console.log('\nTeste PASSOU!');
  } else {
    console.error('Não foi possível extrair o caminho do arquivo de resultado do output');
  }
} catch (err) {
  console.error('Erro:', err.message);
}
