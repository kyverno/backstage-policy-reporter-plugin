import { type ReactNode, useState } from 'react';
import {
  ButtonIcon,
  Dialog,
  DialogBody,
  DialogHeader,
  DialogTrigger,
  Flex,
  Grid,
  Text,
  useBreakpoint,
} from '@backstage/ui';
import { RiFilter3Fill } from '@remixicon/react';

/** Props for the Filters sub-component */
interface FiltersProps {
  children: ReactNode;
  /** Label shown in the dialog header on small screens */
  title?: string;
}

/** Renders filter children as a sidebar on large screens, or inside a Dialog on smaller screens */
const Filters = ({ children, title = 'Filters' }: FiltersProps) => {
  const { down } = useBreakpoint();
  const isSmallScreen = down('md');
  const [open, setOpen] = useState(false);

  if (isSmallScreen) {
    return (
      <DialogTrigger isOpen={open} onOpenChange={setOpen}>
        <ButtonIcon
          variant="secondary"
          aria-label={title}
          icon={<RiFilter3Fill />}
        />
        <Dialog>
          <DialogHeader>{title}</DialogHeader>
          <DialogBody>
            <Flex direction="column" gap="4">
              {children}
            </Flex>
          </DialogBody>
        </Dialog>
      </DialogTrigger>
    );
  }

  return (
    <Grid.Item colSpan={{ initial: '12', md: '3', lg: '2' }}>
      <Flex direction="column" gap="4">
        <Text weight="bold">{title}</Text>
        {children}
      </Flex>
    </Grid.Item>
  );
};

/** Props for the Content sub-component */
interface ContentProps {
  children: ReactNode;
}

/** Main content area that fills remaining grid space */
const Content = ({ children }: ContentProps) => {
  return (
    <Grid.Item colSpan={{ initial: '12', md: '9', lg: '10' }}>
      {children}
    </Grid.Item>
  );
};

/** Props for the FilterLayout root */
interface FilterLayoutProps {
  children: ReactNode;
}

/** A responsive layout with a filter sidebar that collapses into a dialog on smaller screens */
export const FilterLayout = ({ children }: FilterLayoutProps) => {
  return (
    <Grid.Root columns="12" gap="6">
      {children}
    </Grid.Root>
  );
};

FilterLayout.Filters = Filters;
FilterLayout.Content = Content;
