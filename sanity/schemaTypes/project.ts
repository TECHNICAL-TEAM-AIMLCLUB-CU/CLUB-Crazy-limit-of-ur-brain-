import { defineField, defineType } from 'sanity';
import { imageWithAlt } from './shared';

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'summary', title: 'Summary', type: 'text', rows: 4, validation: (r) => r.required().max(400) }),
    imageWithAlt('image', 'Image'),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Ongoing', value: 'ongoing' },
          { title: 'Completed', value: 'completed' },
        ],
        layout: 'radio',
      },
      initialValue: 'ongoing',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'tags', title: 'Technology tags', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    defineField({ name: 'contributors', title: 'Contributors', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'repoUrl', title: 'Repository link', type: 'url', validation: (r) => r.uri({ scheme: ['http', 'https'] }) }),
    defineField({ name: 'demoUrl', title: 'Demo link', type: 'url', validation: (r) => r.uri({ scheme: ['http', 'https'] }) }),
    defineField({ name: 'featured', title: 'Feature on home page', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Display order', type: 'number', description: 'Lower numbers appear first.' }),
  ],
  preview: { select: { title: 'title', subtitle: 'status', media: 'image' } },
});
