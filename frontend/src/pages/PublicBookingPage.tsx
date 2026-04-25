import { Button, Card, Group, Modal, SimpleGrid, Stack, Stepper, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { ApiError, type EventType, type Slot } from '../api/types';
import BookingForm from '../components/BookingForm';
import EventTypeCard from '../components/EventTypeCard';
import SlotPicker from '../components/SlotPicker';
import { EmptyState, ErrorState, LoadingState } from '../components/StatusViews';

export default function PublicBookingPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<EventType>();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot>();
  const [loadingEventTypes, setLoadingEventTypes] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [bookingOpened, setBookingOpened] = useState(false);

  const activeStep = selectedSlot ? 2 : selectedEventType ? 1 : 0;

  const loadEventTypes = async () => {
    setLoadingEventTypes(true);
    setError(undefined);
    try {
      setEventTypes(await api.listEventTypes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки типов событий');
    } finally {
      setLoadingEventTypes(false);
    }
  };

  const loadSlots = async (eventType: EventType) => {
    setLoadingSlots(true);
    setSelectedSlot(undefined);
    try {
      setSlots(await api.listSlots(eventType.id));
    } catch (err) {
      notifications.show({ color: 'red', title: 'Слоты не загружены', message: err instanceof Error ? err.message : 'Повторите позже' });
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    void loadEventTypes();
  }, []);

  const handleSelectEventType = (eventType: EventType) => {
    setSelectedEventType(eventType);
    void loadSlots(eventType);
  };

  const handleSubmitBooking = async (values: { guestName: string; guestContact: string }) => {
    if (!selectedEventType || !selectedSlot) {
      return;
    }

    setSubmitting(true);
    try {
      await api.createBooking({
        eventTypeId: selectedEventType.id,
        startAt: selectedSlot.startAt,
        guestName: values.guestName.trim(),
        guestContact: values.guestContact.trim(),
      });
      notifications.show({ color: 'green', title: 'Бронирование создано', message: 'Встреча подтверждена.' });
      setBookingOpened(false);
      await loadSlots(selectedEventType);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось создать бронирование';
      notifications.show({ color: 'red', title: err instanceof ApiError && err.code === 'slot_unavailable' ? 'Слот уже занят' : 'Ошибка бронирования', message });
      await loadSlots(selectedEventType);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack gap="xl">
      <Card withBorder className="hero-card">
        <Stack gap="xs">
          <Title order={1}>Забронируйте встречу</Title>
          <Text c="dimmed" maw={760}>Выберите подходящий формат встречи, свободное время и оставьте контактные данные для подтверждения записи.</Text>
        </Stack>
      </Card>

      <Stepper active={activeStep} allowNextStepsSelect={false} size="sm">
        <Stepper.Step label="Тип события" />
        <Stepper.Step label="Свободный слот" />
        <Stepper.Step label="Данные гостя" />
      </Stepper>

      {loadingEventTypes ? <LoadingState /> : null}
      {error ? <ErrorState message={error} onRetry={loadEventTypes} /> : null}

      {!loadingEventTypes && !error && eventTypes.length === 0 ? (
        <EmptyState title="Типы событий не найдены" message="Владелец еще не настроил события для публичной записи." />
      ) : null}

      {eventTypes.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
          {eventTypes.map((eventType) => (
            <EventTypeCard key={eventType.id} eventType={eventType} active={eventType.id === selectedEventType?.id} onSelect={handleSelectEventType} />
          ))}
        </SimpleGrid>
      ) : null}

      {selectedEventType ? (
        <Card withBorder>
          <Stack>
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2}>Свободное время</Title>
                <Text c="dimmed">{selectedEventType.title}, {selectedEventType.durationMinutes} минут</Text>
              </div>
              <Button variant="light" onClick={() => void loadSlots(selectedEventType)} loading={loadingSlots}>Обновить</Button>
            </Group>
            {loadingSlots ? <LoadingState label="Загружаем слоты" /> : <SlotPicker slots={slots} selectedStartAt={selectedSlot?.startAt} onSelect={(slot) => { setSelectedSlot(slot); setBookingOpened(true); }} />}
          </Stack>
        </Card>
      ) : null}

      <Modal opened={bookingOpened} onClose={() => setBookingOpened(false)} title="Подтвердить бронирование" centered>
        {selectedEventType && selectedSlot ? (
          <BookingForm eventType={selectedEventType} slot={selectedSlot} loading={submitting} onSubmit={handleSubmitBooking} />
        ) : null}
      </Modal>
    </Stack>
  );
}
