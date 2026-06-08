const fs = require('fs');
const path = require('path');

const mode = process.argv[2] || 'sqlite'; // 'sqlite' or 'postgres'
const schemaPath = path.join(__dirname, 'schema.prisma');
const sourcePath = path.join(__dirname, `schema.${mode}.prisma`);

if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, schemaPath);
  console.log(`Successfully configured Prisma for ${mode.toUpperCase()}!`);
} else {
  console.error(`Source schema file not found: ${sourcePath}`);
  process.exit(1);
}
