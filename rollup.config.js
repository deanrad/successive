import typescript from '@rollup/plugin-typescript';

export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/after-thought.prod.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: './dist/after-thought.esm.js',
      format: 'es',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: './dist/after-thought.min.js',
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [typescript()],
};
