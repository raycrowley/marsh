import { AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';

function TaskList({ tasks, onUpdate, onDelete }) {
    if (tasks.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-secondary)' }}>
                <p>No tasks yet.</p>
                <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Add one below!</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <AnimatePresence>
                {tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

export default TaskList;
