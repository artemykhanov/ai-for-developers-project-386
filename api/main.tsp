import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;

@service(#{
  title: "CalKing API",
})
@server("http://localhost:3000", "Local development server")
@route("/api")
namespace CalKingApi;

/**
 * Единственный заранее заданный владелец календаря. В приложении нет регистрации и входа.
 */
model CalendarOwner {
  /** Идентификатор владельца. */
  id: string;

  /** Отображаемое имя владельца. */
  name: string;

  /** Часовой пояс календаря, например Europe/Moscow. */
  timezone: string;
}

/**
 * Тип встречи, который гости могут забронировать на публичной странице бронирования.
 */
model EventType {
  /** Идентификатор типа события. */
  id: string;

  /** Название события, отображаемое гостям. */
  title: string;

  /** Описание события, отображаемое гостям. */
  description: string;

  /** Длительность встречи в минутах. Используется для расчета слотов и времени окончания бронирования. */
  durationMinutes: int32;

  /** Идентификатор заранее заданного владельца календаря. */
  ownerId: string;
}

/**
 * Данные для создания типа события в административной части владельца.
 */
model CreateEventTypeRequest {
  title: string;
  description: string;
  durationMinutes: int32;
}

/**
 * Данные для частичного обновления типа события в административной части владельца.
 */
model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: int32;
}

/**
 * Конкретное рассчитанное время начала для типа события.
 * Слоты формируются динамически на ближайшие 14 дней от текущей даты.
 */
model Slot {
  /** Дата и время начала слота. */
  startAt: utcDateTime;

  /** Дата и время окончания слота. */
  endAt: utcDateTime;

  /** Тип события, для которого рассчитан слот. */
  eventTypeId: string;

  /** Длительность слота, скопированная из выбранного типа события. */
  durationMinutes: int32;

  /** True, только если на это же время не существует бронирования. */
  isAvailable: boolean;
}

/**
 * Подтвержденное бронирование гостя.
 */
model Booking {
  /** Идентификатор бронирования. */
  id: string;

  /** Выбранный тип события. */
  eventTypeId: string;

  /** Идентификатор заранее заданного владельца календаря. */
  ownerId: string;

  /** Имя гостя, введенное без регистрации аккаунта. */
  guestName: string;

  /** Контакт гостя, например email или телефон. */
  guestContact: string;

  /** Дата и время начала встречи. */
  startAt: utcDateTime;

  /** Дата и время окончания встречи, рассчитанные как startAt плюс длительность типа события. */
  endAt: utcDateTime;

  /** Дата и время создания бронирования. */
  createdAt: utcDateTime;
}

/**
 * Данные для создания гостевого бронирования. Сервер рассчитывает endAt по длительности типа события.
 */
model CreateBookingRequest {
  /** Тип события, выбранный гостем. */
  eventTypeId: string;

  /** Начало свободного слота, выбранного гостем в пределах ближайших 14 дней. */
  startAt: utcDateTime;

  /** Имя гостя. */
  guestName: string;

  /** Контакт гостя, например email или телефон. */
  guestContact: string;
}

/**
 * Query-параметры для запроса рассчитанных слотов.
 */
model ListSlotsQuery {
  /** Необязательная нижняя граница начала слота. По умолчанию текущие дата и время. */
  @query
  from?: utcDateTime;

  /** Необязательная верхняя граница начала слота. Не должна превышать 14 дней от текущей даты. */
  @query
  to?: utcDateTime;
}

/**
 * Query-параметры для списка бронирований владельца.
 */
model ListOwnerBookingsQuery {
  /** Необязательная нижняя граница начала бронирования. По умолчанию текущие дата и время. */
  @query
  from?: utcDateTime;

  /** Необязательная верхняя граница начала бронирования. */
  @query
  to?: utcDateTime;
}

@error
model BadRequestError {
  @statusCode
  statusCode: 400;

  code: "bad_request";
  message: string;
}

@error
model NotFoundError {
  @statusCode
  statusCode: 404;

  code: "not_found";
  message: string;
}

@error
model SlotUnavailableError {
  @statusCode
  statusCode: 409;

  code: "slot_unavailable";
  message: string;
}

interface PublicBookingOperations {
  /**
   * Получить список типов событий, доступных гостям на публичной странице бронирования.
   */
  @route("/event-types")
  @get
  listEventTypes(): EventType[];

  /**
   * Получить список динамически рассчитанных слотов для типа события.
   * Возвращаются только слоты в пределах ближайших 14 дней.
   * Слот доступен только если на это же время нет бронирования, независимо от типа события.
   */
  @route("/event-types/{eventTypeId}/slots")
  @get
  listSlots(
    @path eventTypeId: string,
    ...ListSlotsQuery,
  ): Slot[] | NotFoundError | BadRequestError;

  /**
   * Создать гостевое бронирование без регистрации и входа.
   * Сервер должен повторно проверить доступность слота перед созданием бронирования.
   */
  @route("/bookings")
  @post
  createBooking(@body booking: CreateBookingRequest): Booking | NotFoundError | BadRequestError | SlotUnavailableError;
}

interface OwnerOperations {
  /**
   * Получить профиль заранее заданного владельца календаря, используемый административной частью.
   */
  @route("/owner")
  @get
  getOwner(): CalendarOwner;

  /**
   * Получить список предстоящих бронирований, видимых владельцу, независимо от типа события.
   */
  @route("/owner/bookings")
  @get
  listOwnerBookings(...ListOwnerBookingsQuery): Booking[] | BadRequestError;

  /**
   * Получить список типов событий, которыми управляет заранее заданный владелец.
   */
  @route("/owner/event-types")
  @get
  listOwnerEventTypes(): EventType[];

  /**
   * Создать тип события в административной части владельца.
   */
  @route("/owner/event-types")
  @post
  createEventType(@body eventType: CreateEventTypeRequest): EventType | BadRequestError;

  /**
   * Частично обновить тип события в административной части владельца.
   */
  @route("/owner/event-types/{eventTypeId}")
  @patch
  updateEventType(
    @path eventTypeId: string,
    @body eventType: UpdateEventTypeRequest,
  ): EventType | NotFoundError | BadRequestError;

  /**
   * Удалить тип события в административной части владельца.
   */
  @route("/owner/event-types/{eventTypeId}")
  @delete
  deleteEventType(@path eventTypeId: string): void | NotFoundError;
}
