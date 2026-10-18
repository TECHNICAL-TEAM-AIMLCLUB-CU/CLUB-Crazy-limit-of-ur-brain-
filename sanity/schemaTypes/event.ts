import { defineField, defineType } from 'sanity';
import { imageWithAlt } from './shared';

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'date', title: 'Start date & time', type: 'datetime', validation: (r) => r.required() }),
    defineField({ name: 'endDate', title: 'End date & time', type: 'datetime', description: 'Optional. Used to decide when an event becomes "past".' }),
    defineField({ name: 'location', title: 'Location', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 4 }),
    imageWithAlt('image', 'Image'),
    defineField({
      name: 'registrationUrl',
      title: 'Registration link',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['http', 'https'] }),
    }),
    defineField({ name: 'featured', title: 'Feature on home page', type: 'boolean', initialValue: false }),
  ],
  orderings: [{ title: 'Date, newest first', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] }],
  preview: {
    select: { title: 'title', subtitle: 'date', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? new Date(subtitle).toLocaleDateString('en-GB') : 'No date',
      media,
    }),
  },
});
