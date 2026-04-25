import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import dayjs from 'dayjs';
import type { Slot } from '../api/types';
import { EmptyState } from './StatusViews';

interface SlotPickerProps {
  slots: Slot[];
  selectedStartAt?: string;
  onSelect: (slot: Slot) => void;
}

function formatDate(value: string) {
  return dayjs(value).format('D MMMM, dddd');
}

function formatTimeRange(slot: Slot) {
  return `${dayjs(slot.startAt).format('HH:mm')} - ${dayjs(slot.endAt).format('HH:mm')}`;
}

export default function SlotPicker({ slots, selectedStartAt, onSelect }: SlotPickerProps) {
  const availableSlots = slots.filter((slot) => slot.isAvailable);

  if (availableSlots.length === 0) {
    return <EmptyState title="Нет свободных слотов" message="Выберите другой тип события или повторите позже." />;
  }

  const groups = availableSlots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const key = dayjs(slot.startAt).format('YYYY-MM-DD');
    acc[key] = [...(acc[key] || []), slot];
    return acc;
  }, {});

  return (
    <Stack>
      {Object.entries(groups).map(([date, dateSlots]) => (
        <Card key={date} withBorder>
          <Stack>
            <Group justify="space-between">
              <Title order={4}>{formatDate(dateSlots[0].startAt)}</Title>
              <Badge variant="dot">{dateSlots.length} слотов</Badge>
            </Group>
            <SimpleGrid cols={{ base: 2, xs: 3, sm: 4, md: 5 }} spacing="xs">
              {dateSlots.map((slot) => (
                <Button
                  key={slot.startAt}
                  variant={slot.startAt === selectedStartAt ? 'filled' : 'default'}
                  onClick={() => onSelect(slot)}
                  fullWidth
                >
                  {formatTimeRange(slot)}
                </Button>
              ))}
            </SimpleGrid>
          </Stack>
        </Card>
      ))}
      <Text size="sm" c="dimmed">Показаны ближайшие доступные варианты для записи.</Text>
    </Stack>
  );
}
