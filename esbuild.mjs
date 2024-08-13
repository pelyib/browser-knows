import * as esbuild from 'esbuild'

let newtab = await esbuild.context({
  entryPoints: ['/app/src/newtab.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  logLevel: 'info',
  outfile: '/app/bundle/assets/js/newtab.js',
});

await newtab.watch();

let background = await esbuild.context({
  entryPoints: ['/app/src/background.js'],
  bundle: true,
  minify: true,
  sourcemap: false,
  logLevel: 'info',
  outfile: '/app/bundle/assets/js/background.js',
});

await background.watch();

console.log('watching you...');
