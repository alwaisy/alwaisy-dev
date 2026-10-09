import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import checkFile from 'eslint-plugin-check-file';

export default tseslint.config(
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    ignores: [
      '.astro/*',
      'dist/*',
      'node_modules/*',
      '.wrangler/*',
      'bench/*',
    ],
  },
  {
    plugins: {
      'check-file': checkFile,
    },
    rules: {
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{js,ts,astro,md,mdx,css}': 'KEBAB_CASE',
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': 'KEBAB_CASE',
        },
      ],
    },
  },
  {
    // Ignore Astro dynamic routes with [brackets] and error pages (404.astro)
    files: ['src/pages/**/\\[*\\].astro', 'src/pages/**/\\[*\\].astro/**', 'src/pages/404.astro'],
    rules: {
      'check-file/filename-naming-convention': 'off',
      'check-file/folder-naming-convention': 'off',
    },
  }
);
