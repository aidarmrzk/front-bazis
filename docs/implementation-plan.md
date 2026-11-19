# План обновления

Цель: выполнить требования приложения заметок в отдельном репозитории.
Архитектура: [architecture.md](architecture.md).

1. `chore: initialize Nuxt workspace` — конфигурация SPA и strict TypeScript,
   зависимости из существующего проекта, Vitest и описание архитектуры.
2. `feat: validate and persist versioned notes` — валидатор, миграция v0→v1,
   Pinia CRUD; тесты повреждённых данных, квоты и сохранения соседних заметок.
3. `feat: implement patch editing sessions` — атомарные патчи и группировка;
   тесты 50 шагов, redo, blur/650 мс, reset и независимости данных.
4. `feat: add recoverable draft persistence` — версия черновика, запись через
   350 мс, flush и clear; тесты восстановления и отсутствия поздней записи.
5. `feat: add accessible dialogs and note components` — SCSS, focus-trap,
   Escape, восстановление фокуса; тесты клавиатурных утилит.
6. `feat: compose notes pages and editor workflow` — тонкие страницы,
   composables, подтверждения, валидация, пропавшая заметка, storage events,
   защита переходов с несохранёнными правками.
7. `test: cover storage and editing edge cases` — дополнительные регрессии,
   тесты, покрытие, typecheck и production-сборка.
8. `docs: document setup and container deployment` — README, Dockerfile,
   docker-compose.yaml и итоговая проверка чистоты репозитория.

Каждая реализация ключевой логики начинается с воспроизводимого теста.
Команды проверки: `npm test`, `npm run test:coverage`, `npm run typecheck`,
`npm run build`. Ручная проверка: создание, изменение, восстановление,
удаление во второй вкладке, клавиатура, размеры 1440 и 390 px.
