'use client';

import { useState } from 'react';
import {
  ANNOUNCEMENT_TYPES,
  isAnnouncementType,
  type AnnouncementType,
} from '@/lib/announcement-metadata';

const inputClass =
  'mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-brand-cyan';
const labelClass = 'block text-sm font-medium text-fg';

type Props = {
  announcementType: AnnouncementType;
  priority: string;
  publicationEndsAt: string;
  deadline: string;
  dismissible: boolean;
};

export default function AnnouncementBarFields({
  announcementType,
  priority,
  publicationEndsAt,
  deadline,
  dismissible,
}: Props) {
  const [type, setType] = useState(announcementType);
  const [canDismiss, setCanDismiss] = useState(dismissible && announcementType !== 'important');

  function updateType(value: string) {
    if (!isAnnouncementType(value)) return;
    setType(value);
    if (value === 'important') setCanDismiss(false);
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Announcement bar type
          <select
            name="announcementType"
            value={type}
            onChange={(event) => updateType(event.currentTarget.value)}
            className={inputClass}
          >
            {ANNOUNCEMENT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Priority (higher appears first within its type)
          <input
            name="priority"
            type="number"
            min="0"
            max="1000"
            step="1"
            defaultValue={priority}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Publication end (UTC, optional)
          <input
            name="publicationEndsAt"
            type="datetime-local"
            defaultValue={publicationEndsAt}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Deadline (UTC{type === 'deadline' ? ', required' : ', optional'})
          <input
            name="deadline"
            type="datetime-local"
            defaultValue={deadline}
            required={type === 'deadline'}
            className={inputClass}
          />
        </label>
      </div>
      <label className="flex items-start gap-2 text-sm text-fg">
        <input
          type="checkbox"
          name="dismissible"
          checked={type !== 'important' && canDismiss}
          disabled={type === 'important'}
          onChange={(event) => setCanDismiss(event.currentTarget.checked)}
          className="mt-1 accent-brand-cyan"
        />
        <span>
          Allow visitors to dismiss this bar
          <span className="mt-1 block text-xs font-normal text-muted">
            Important bars are never dismissible. Deadline bars are dismissible only when this is enabled.
          </span>
        </span>
      </label>
    </>
  );
}
