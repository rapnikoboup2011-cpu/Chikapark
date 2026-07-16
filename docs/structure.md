# Структура репозитория

chaika-park/
├── CLAUDE.md                  # контекст проекта для Claude Code
├── docker-compose.yml
├── .env.example
├── prisma/
│   └── schema.prisma          # модели: Zone, Spot, Booking, Payment, NotificationLog
├── src/
│   ├── app/
│   │   ├── page.tsx            # главная — интерактивная схема
│   │   ├── booking/[spotId]/   # форма бронирования конкретного места
│   │   ├── admin/               # админка (список броней, статусы)
│   │   └── api/
│   │       ├── spots/          # GET — список мест и статусов
│   │       ├── bookings/       # POST — создать pending-бронь
│   │       ├── payments/
│   │       │   ├── init/       # POST — инициализация платежа в Т-Кассе
│   │       │   └── webhook/    # POST — приём Notification от Т-Кассы
│   │       └── telegram/
│   │           └── webhook/    # обработка команд бота (привязка chat_id и т.п.)
│   ├── components/
│   │   ├── SchemeMap.tsx       # интерактивная карта зон/лежаков
│   │   ├── SpotMarker.tsx
│   │   └── BookingForm.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── tkassa.ts           # обёртка над API Т-Кассы (Init, подпись, проверка Token)
│   │   ├── telegram.ts         # отправка сообщений через Bot API
│   │   ├── email.ts
│   │   └── socket.ts
│   └── types/
├── docs/
│   └── structure.md
└── README.md
