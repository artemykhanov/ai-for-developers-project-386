import { Badge, Button, Card, Group, Stack, Text, Title } from '@mantine/core';
import type { EventType } from '../api/types';

interface EventTypeCardProps {
  eventType: EventType;
  active?: boolean;
  onSelect: (eventType: EventType) => void;
}

export default function EventTypeCard({ eventType, active = false, onSelect }: EventTypeCardProps) {
  return (
    <Card withBorder shadow={active ? 'md' : 'xs'} className={active ? 'selected-card' : undefined} h="100%">
      <Stack justify="space-between" h="100%">
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Title order={3}>{eventType.title}</Title>
            <Badge variant="light">{eventType.durationMinutes} мин</Badge>
          </Group>
          <Text c="dimmed">{eventType.description}</Text>
        </Stack>

        <Button onClick={() => onSelect(eventType)} variant={active ? 'filled' : 'light'}>
          {active ? 'Выбрано' : 'Выбрать'}
        </Button>
      </Stack>
    </Card>
  );
}
