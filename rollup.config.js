import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/successive.prod.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: './dist/successive.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: './dist/successive.min.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
};
