import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './sanity/schemaTypes';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

export default defineConfig({
  name: 'aiml-club',
  title: 'AIML Club',
  projectId,
  dataset,
  basePath: '/studio',
  plugins: [
    structureTool({
      // Site settings is a singleton: one fixed document, no "create new" list.
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Site settings')
              .id('siteSettings')
              .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
            S.divider(),
            ...S.documentTypeListItems().filter((item) => item.getId() !== 'siteSettings'),
          ]),
    }),
  ],
  schema: {
    types: schemaTypes,
    // Hide "new document" for the singleton.
    templates: (templates) => templates.filter(({ schemaType }) => schemaType !== 'siteSettings'),
  },
});
