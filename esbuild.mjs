import * as esbuild from 'esbuild'

const entryPoints = ['newtab', 'background', 'options'];

await Promise.all(entryPoints.map((name) => esbuild.build({
  entryPoints: [`src/${name}.js`],
  bundle: true,
  minify: true,
  sourcemap: false,
  logLevel: 'info',
  outfile: `bundle/assets/js/${name}.js`,
})));
