import Reveal from './Reveal';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  className?: string;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: Props) {
  const alignment = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  return (
    <Reveal className={`flex flex-col ${alignment} gap-3 ${className}`}>
      {eyebrow && (
        <span className="font-script text-2xl text-lavender-deep sm:text-3xl">
          {eyebrow}
        </span>
      )}
      <h2 className="text-gradient text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={`max-w-2xl text-base text-ink-soft sm:text-lg ${
            align === 'center' ? 'mx-auto' : ''
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
