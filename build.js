const pkg = require('./package.json');

require('esbuild').build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'esnext',
  format: 'cjs',
  external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
  outfile: 'dist/index.js',
  minify: true,
  sourcemap: process.env.DEV ? 'inline' : false,
});
