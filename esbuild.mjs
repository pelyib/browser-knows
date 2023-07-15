import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/bg_worker.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/bg_worker.js',
})

await esbuild.build({
  entryPoints: ['./src/app.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/app.js',
})

