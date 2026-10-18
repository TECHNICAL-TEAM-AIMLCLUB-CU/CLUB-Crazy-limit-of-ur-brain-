import { defineField, defineType } from 'sanity';
import { socialLinks } from './shared';

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'identity', title: 'Identity & Home', default: true },
    { name: 'about', title: 'About page' },
    { name: 'join', title: 'Join & contact' },
  ],
  fields: [
    defineField({ name: 'clubName', title: 'Club name', type: 'string', group: 'identity', validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'string', group: 'identity', description: 'Short line used in metadata and the footer.' }),
    defineField({ name: 'heroHeadline', title: 'Home hero headline', type: 'string', group: 'identity' }),
    defineField({ name: 'heroSubtext', title: 'Home hero description', type: 'text', rows: 3, group: 'identity' }),
    defineField({ name: 'academicYear', title: 'Academic year / copyright text', type: 'string', group: 'identity', description: 'Example: 2026–27. Shown in the footer.' }),

    defineField({ name: 'mission', title: 'Mission', type: 'text', rows: 4, group: 'about' }),
    defineField({ name: 'vision', title: 'Vision', type: 'text', rows: 4, group: 'about' }),
    defineField({
      name: 'activities',
      title: 'What we do',
      type: 'array',
      group: 'about',
      of: [
        {
          type: 'object',
          name: 'activity',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
          ],
          preview: { select: { title: 'title', subtitle: 'description' } },
        },
      ],
    }),
    defineField({ name: 'aboutBody', title: 'About story', type: 'array', of: [{ type: 'block' }], group: 'about' }),

    defineField({ name: 'joinText', title: 'Join page introduction', type: 'text', rows: 3, group: 'join' }),
    defineField({ name: 'contactEmail', title: 'Official contact email', type: 'string', group: 'join', validation: (r) => r.email() }),
    { ...socialLinks, group: 'join' },
  ],
  preview: { select: { title: 'clubName' }, prepare: ({ title }) => ({ title: title || 'Site settings' }) },
});
