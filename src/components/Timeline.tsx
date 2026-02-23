import React from 'react';

type TimelineItem = {
  title: string;
  date?: string;
  content: React.ReactNode;
};

export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical font-sans text-base">
      {items.map((item, idx) => {
        const isStart = idx % 2 === 0;
        return (
          <li key={idx}>
            <div className="timeline-middle">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-primary">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <div className={isStart ? 'timeline-start mb-10 md:text-end' : 'timeline-end md:mb-10'}>
              {item.date && <time className="font-mono italic text-sm md:text-base">{item.date}</time>}
              <div className="text-xl md:text-2xl font-black">{item.title}</div>
              <div className="mt-2 text-base md:text-lg text-base-content/80">{item.content}</div>
            </div>

            {idx !== items.length - 1 && <hr />}
          </li>
        );
      })}
    </ul>
  );
}
