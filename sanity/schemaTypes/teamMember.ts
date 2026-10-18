import { defineField, defineType } from 'sanity';
import { imageWithAlt, socialLinks } from './shared';

export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    imageWithAlt('portrait', 'Portrait', true),
    defineField({ name: 'role', title: 'Role / position', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'department', title: 'Department / team', type: 'string' }),
    defineField({ name: 'bio', title: 'Short biography', type: 'text', rows: 4, validation: (r) => r.max(500) }),
    socialLinks,
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first.',
      validation: (r) => r.integer().min(0),
    }),
  ],
  orderings: [{ title: 'Display order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'role', media: 'portrait' } },
});
