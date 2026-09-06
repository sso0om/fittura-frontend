import { defineConfig } from 'orval';

export default defineConfig({
  fittura: {
    input: { target: 'http://localhost:8080/v3/api-docs' },
    output: {
      clean: true,
      mode: 'tags-split',
      target: './src/api/generated',
      schemas: './src/api/model',
      client: 'react-query',
      override: {
        mutator: {
          path: './src/api/mutator/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
  },
});