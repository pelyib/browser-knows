import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['./src/app.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outfile: './bundle/assets/js/app.js',
})

