import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/newtab.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/newtab.js',
})

await esbuild.build({
  entryPoints: ['./src/background.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/background.js',
})
