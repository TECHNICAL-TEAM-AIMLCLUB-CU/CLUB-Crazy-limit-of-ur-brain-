'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Project, ProjectStatus } from '@/lib/types';
import { imageUrl, safeUrl } from '@/lib/utils';
import './ProjectsCardSwap.css';

const STATUS: Record<ProjectStatus, { label: string; className: string }> = {
  ongoing: { label: 'Ongoing', className: 'project-swap-status-ongoing' },
  available: { label: 'Available', className: 'project-swap-status-available' },
  completed: { label: 'Completed', className: 'project-swap-status-completed' },
};

const CARD_WIDTH = 430;
const CARD_HEIGHT = 330;
const CARD_DISTANCE = 52;
const VERTICAL_DISTANCE = 34;
const DEPTH = 55;
const VISIBLE_CARDS = 3;
const PADDING = 28;
const DELAY = 4000;

export default function ProjectsCardSwap({ projects }: { projects: Project[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rootSize, setRootSize] = useState({ width: 0, height: 0 });
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const visibleCount = Math.min(VISIBLE_CARDS, projects.length);
  const dimensions = useMemo(() => {
    if (!rootSize.width || !rootSize.height) return null;

    const cardWidth = Math.min(CARD_WIDTH, Math.max(220, rootSize.width * 0.8));
    const scaleFactor = cardWidth / CARD_WIDTH;
    const cardHeight = CARD_HEIGHT * scaleFactor;
    const cardDistance = CARD_DISTANCE * scaleFactor;
    const verticalDistance = VERTICAL_DISTANCE * scaleFactor;
    const boundsWidth = cardWidth + (visibleCount - 1) * cardDistance + PADDING * 2;
    const boundsHeight = cardHeight + (visibleCount - 1) * verticalDistance + PADDING * 2;
    const scale = Math.min(1, (rootSize.width - 12) / boundsWidth, (rootSize.height - 12) / boundsHeight);

    return {
      cardWidth,
      cardHeight,
      cardDistance,
      verticalDistance,
      scale,
      boundsWidth,
      boundsHeight,
      originX: PADDING + cardWidth / 2,
      originY: PADDING + cardHeight / 2 + (visibleCount - 1) * verticalDistance,
    };
  }, [rootSize, visibleCount]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new ResizeObserver(([entry]) => {
      setRootSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (projects.length < 2 || paused || reducedMotion) return;

    const timer = window.setTimeout(() => {
      if (document.visibilityState === 'visible') {
        setActiveIndex((index) => (index + 1) % projects.length);
      }
    }, DELAY);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, projects.length, reducedMotion]);

  const move = (direction: number) => {
    setActiveIndex((index) => (index + direction + projects.length) % projects.length);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      move(1);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(-1);
    }
  };

  if (!projects.length) return null;

  return (
    <div
      ref={rootRef}
      className="projects-card-swap"
      role="region"
      aria-roledescription="carousel"
      aria-label="Club projects"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {dimensions && (
        <div
          className="projects-card-swap-stage"
          style={{
            width: dimensions.boundsWidth,
            height: dimensions.boundsHeight,
            transform: `translate(-50%, -50%) scale(${dimensions.scale})`,
          }}
        >
          {projects.map((project, index) => {
            const position = (index - activeIndex + projects.length) % projects.length;
            const isVisible = position < visibleCount;
            const projectImage = imageUrl(project.image);
            const status = STATUS[project.status] ?? STATUS.ongoing;
            const repositoryUrl = safeUrl(project.repoUrl);
            const demoUrl = safeUrl(project.demoUrl);

            return (
              <article
                key={project._id}
                className="projects-card-swap-card"
                aria-hidden={!isVisible}
                inert={!isVisible}
                style={{
                  width: dimensions.cardWidth,
                  height: dimensions.cardHeight,
                  left: dimensions.originX,
                  top: dimensions.originY,
                  zIndex: projects.length - position,
                  opacity: isVisible ? Math.max(0.18, 1 - position * 0.28) : 0,
                  pointerEvents: isVisible && position === 0 ? 'auto' : 'none',
                  transform: `translate3d(calc(-50% + ${position * dimensions.cardDistance}px), calc(-50% - ${position * dimensions.verticalDistance}px), -${position * DEPTH}px) rotate(${position * 1.2}deg)`,
                }}
              >
                {projectImage && (
                  <Image
                    src={projectImage}
                    alt={project.image?.alt || ''}
                    fill
                    sizes="(max-width: 640px) 80vw, 430px"
                    className="projects-card-swap-image"
                    unoptimized
                  />
                )}
                <div className="projects-card-swap-content">
                  <span className={`projects-card-swap-status ${status.className}`}>{status.label}</span>
                  <div>
                    <h3 className="projects-card-swap-title">{project.title}</h3>
                    <p className="projects-card-swap-summary">{project.summary}</p>
                    {project.tags && project.tags.length > 0 && (
                      <ul className="projects-card-swap-tags" aria-label="Technologies">
                        {project.tags.slice(0, 4).map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                    )}
                    {(repositoryUrl || demoUrl) && (
                      <div className="projects-card-swap-links">
                        {repositoryUrl && (
                          <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">
                            Repository<span className="sr-only"> for {project.title}</span>
                          </a>
                        )}
                        {demoUrl && (
                          <a href={demoUrl} target="_blank" rel="noopener noreferrer">
                            Live demo<span className="sr-only"> of {project.title}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="projects-card-swap-controls">
        <button type="button" aria-label="Previous project" onClick={() => move(-1)}>
          <span aria-hidden="true">←</span>
        </button>
        <p aria-live="polite" aria-atomic="true">
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <span aria-hidden="true"> / </span>
          <span>{String(projects.length).padStart(2, '0')}</span>
        </p>
        <button type="button" aria-label="Next project" onClick={() => move(1)}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p className="sr-only">Use the arrow keys or previous and next buttons to browse projects.</p>
    </div>
  );
}
