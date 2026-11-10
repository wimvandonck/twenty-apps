import { type ReactNode } from 'react';
import { Heading } from 'twenty-ui/primitives/typography';
import { useTheme } from 'twenty-ui/theme';

type SectionCardProps = {
  title: string;
  children: ReactNode;
};

export const SectionCard = ({ title, children }: SectionCardProps) => {
  const theme = useTheme();

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing[3],
        padding: theme.spacing[4],
        border: `1px solid ${theme.border.color.medium}`,
        borderRadius: theme.border.radius.md,
        background: theme.background.primary,
        minWidth: 0,
      }}
    >
      <Heading level={3}>{title}</Heading>
      {children}
    </section>
  );
};
