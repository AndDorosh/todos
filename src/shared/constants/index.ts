import { TColumn } from '@/types';

export const DEFAULT_COLUMNS: TColumn[] = [
    { id: 'todo', title: 'Нужно сделать', order: 1 },
    { id: 'inprogress', title: 'В процессе', order: 2 },
    { id: 'done', title: 'Готово', order: 3 },
];

export const LOCAL_TASKS_KEY = 'kanban_local_tasks';
