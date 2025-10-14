import useTaskStore from '@/stores/useTaskStore.js';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import TaskCard from './TaskCard/index.js';

const TaskList: React.FC = () => {
    const tasks = useTaskStore((s) => s.tasks);

    const [parent] = useAutoAnimate<HTMLDivElement>({
        duration: 220,
        easing: 'cubic-bezier(.2,.8,.2,1)',
    });

    if (!tasks.length) return <div className="text-center py-8 text-gray-500">Нет задач</div>;

    return (
        <div ref={parent} className="flex flex-col gap-3">
            {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
            ))}
        </div>
    );
};

export default TaskList;
