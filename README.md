# Todos — Pet Project

Небольшoй todo-лист с авторизацией, темами и приоритетами.  
Проект сделан для портфолио — на React + Vite + Tailwind + Zustand (+ axios). CI / деплой — GitHub Actions → GitHub Pages.

---

## Фичи
- Авторизация (mock API / MockAPI.io)
- Список задач (приоритет / выполнено)
- Оптимистичные обновления (Zustand store)
- Модальные-окна: добавить / редактировать / удалить
- Тёмная / светлая тема
- Плавная анимация перестановок (auto-animate)
- Tailwind CSS

---

## Быстрый старт (локально)

1. Клонировать репозиторий:
```bash
git clone https://github.com/AndDorosh/todos.git
cd todos
```

2. Установить зависимости:

```bash
npm install
# или
yarn
```

3. Создать файл окружения .env (локально) — пример:

```.env
VITE_BASE_API=https://68e0043e93207c4b4793781f.mockapi.io/api
```

4. Запустить dev сервер:

```bash
npm run dev
# или
yarn dev
```

5. Открой http://localhost:5173
