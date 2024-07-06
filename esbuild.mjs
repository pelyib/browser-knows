import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/app.js'],
  bundle: true,
  minify: false,
  sourcemap: false,
  outfile: './bundle/assets/js/app.js',
})

await esbuild.build({
  entryPoints: ['./src/background.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/background.js',
})
