import { defineField } from 'sanity';

export const socialLinks = defineField({
  name: 'socials',
  title: 'Social links',
  type: 'array',
  of: [
    {
      type: 'object',
      name: 'social',
      fields: [
        defineField({
          name: 'platform',
          title: 'Platform',
          type: 'string',
          options: {
            list: ['LinkedIn', 'GitHub', 'Instagram', 'X / Twitter', 'YouTube', 'Discord', 'Website', 'Email'],
          },
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          description: 'Use https:// links, or mailto: for email.',
          validation: (rule) => rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
        }),
      ],
      preview: { select: { title: 'platform', subtitle: 'url' } },
    },
  ],
});

export const imageWithAlt = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alternative text',
        type: 'string',
        description: 'Describe the image for screen readers.',
      }),
    ],
    validation: required ? (rule) => rule.required() : undefined,
  });
