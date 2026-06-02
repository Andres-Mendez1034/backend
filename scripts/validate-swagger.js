import fs from 'fs';
import YAML from 'yaml';

try {
  const s = fs.readFileSync('./src/docs/swagger.yaml', 'utf8');
  YAML.parse(s);
  console.log('SWAGGER YAML OK');
} catch (e) {
  console.error('YAML ERROR:', e.message);
  process.exit(1);
}
