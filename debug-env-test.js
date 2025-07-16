require('dotenv').config({ path: '.env.local' });

console.log('=== Environment Variable Debug ===');
console.log('MOCK_LLM:', process.env['MOCK_LLM']);
console.log('NODE_ENV:', process.env['NODE_ENV']);
console.log('All MOCK_* variables:');
Object.keys(process.env).filter(k => k.includes('MOCK')).forEach(k => {
  console.log(`  ${k} = ${process.env[k]}`);
}); 