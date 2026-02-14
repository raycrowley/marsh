import { useState, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor
} from '@dnd-kit/core';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import BoardTabs from './components/BoardTabs';

function App() {
  // State: Boards (Array of { id, name, tasks: [] })
  const [boards, setBoards] = useState(() => {
    try {
      // 1. Check for existing 'boards'
      const savedBoards = localStorage.getItem('boards');
      if (savedBoards) {
        return JSON.parse(savedBoards);
      }

      // 2. Migration: Check for old 'tasks'
      const oldTasks = localStorage.getItem('tasks');
      if (oldTasks) {
        const parsedTasks = JSON.parse(oldTasks);
        // Create initial migration board
        return [
          {
            id: 'personal-board',
            name: 'Personal',
            tasks: parsedTasks
          }
        ];
      }

      // 3. New User Default
      return [
        {
          id: crypto.randomUUID(),
          name: 'My Board',
          tasks: []
        }
      ];
    } catch {
      // Fallback
      return [
        {
          id: crypto.randomUUID(),
          name: 'My Board',
          tasks: []
        }
      ];
    }
  });

  const [activeBoardId, setActiveBoardId] = useState(() => {
    // Try to restore last active board, or default to first
    const savedActive = localStorage.getItem('activeBoardId');
    if (savedActive && boards.some(b => b.id === savedActive)) {
      return savedActive;
    }
    return boards[0]?.id;
  });

  // Re-enable sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Persistence
  useEffect(() => {
    localStorage.setItem('boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('activeBoardId', activeBoardId);
  }, [activeBoardId]);


  // --- Board Management ---
  const activeBoard = boards.find(b => b.id === activeBoardId) || boards[0];

  const addBoard = () => {
    const newBoard = {
      id: crypto.randomUUID(),
      name: 'New Board',
      tasks: []
    };
    setBoards(prev => [...prev, newBoard]);
    setActiveBoardId(newBoard.id); // Switch to it
  };

  const renameBoard = (id, newName) => {
    setBoards(prev => prev.map(b =>
      b.id === id ? { ...b, name: newName } : b
    ));
  };

  const deleteBoard = (id) => {
    if (boards.length <= 1) return; // Prevent deleting last board

    // If deleting active board, switch to another one
    if (id === activeBoardId) {
      const remaining = boards.filter(b => b.id !== id);
      setActiveBoardId(remaining[0].id);
    }

    setBoards(prev => prev.filter(b => b.id !== id));
  };


  // --- Task Management (Scoped to Active Board) ---

  const setTasks = (newTasksVal) => {
    // Support functional update or direct value
    setBoards(prevBoards => prevBoards.map(board => {
      if (board.id !== activeBoardId) return board;

      const updatedTasks = typeof newTasksVal === 'function'
        ? newTasksVal(board.tasks)
        : newTasksVal;

      return { ...board, tasks: updatedTasks };
    }));
  };

  // Helper to get current tasks properly
  const tasks = activeBoard?.tasks || [];


  // Copy/Paste Logic
  useEffect(() => {
    const handleKeyDown = async (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

      // Copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') {
        const activeElement = document.activeElement;
        const taskId = activeElement?.getAttribute('data-task-id');
        if (taskId) {
          // Search globally or just in active board? Let's just search active board for now.
          const taskToCopy = tasks.find(t => t.id === taskId);
          if (taskToCopy) {
            const clipboardData = {
              type: 'task-tracker-item',
              data: {
                text: taskToCopy.text,
                width: taskToCopy.width,
                height: taskToCopy.height,
                color: taskToCopy.color,
                colorText: taskToCopy.colorText
              }
            };
            await navigator.clipboard.writeText(JSON.stringify(clipboardData));
            console.log('Task copied:', taskToCopy.text);
          }
        }
      }

      // Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        try {
          const text = await navigator.clipboard.readText();
          const parsed = JSON.parse(text);

          if (parsed && parsed.type === 'task-tracker-item' && parsed.data) {
            const data = parsed.data;
            const newTask = {
              id: crypto.randomUUID(),
              text: data.text,
              width: data.width,
              height: data.height,
              color: data.color,
              colorText: data.colorText,
              completed: false,
              createdAt: Date.now(),
              x: (window.innerWidth / 2) - (data.width / 2) + (Math.random() * 40 - 20),
              y: (window.innerHeight / 2) - (data.height / 2) + (Math.random() * 40 - 20)
            };

            setTasks(prev => [...prev, newTask]); // Uses our wrapped setTasks
          }
        } catch (err) {
          // Not valid JSON or not our data type, ignore silently.
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [boards, activeBoardId]); // Dep on boards/activeId to ensure scope is correct

  const addTask = ({ text, width, height, color }) => {
    const newTask = {
      id: crypto.randomUUID(),
      text,
      width,
      height,
      color,
      completed: false,
      createdAt: Date.now(),
      x: (window.innerWidth / 2) - (width / 2) + (Math.random() * 100 - 50),
      y: (window.innerHeight / 2) - (height / 2) + (Math.random() * 100 - 50)
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  function handleDragEnd(event) {
    const { active, delta } = event;
    setTasks(prev => prev.map(t => {
      if (t.id === active.id) {
        return {
          ...t,
          x: (t.x || 0) + delta.x,
          y: (t.y || 0) + delta.y,
        }
      }
      return t;
    }));
  }

  // Calculate Tasks to Display
  const sortedTasks = [...tasks].sort((a, b) => (b.width * b.height) - (a.width * a.height));

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>

        {/* Top Bar for Boards */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 100, // Above tasks
          padding: '1rem',
          pointerEvents: 'none' // Allow click through empty areas
        }}>
          <BoardTabs
            boards={boards}
            activeBoardId={activeBoardId}
            onSwitch={setActiveBoardId}
            onAdd={addBoard}
            onRename={renameBoard}
            onDelete={deleteBoard}
          />
        </div>

        <TaskList
          tasks={sortedTasks}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />

        {/* Input Bar Container */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              pointerEvents: 'auto',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(16px)',
              padding: '0.8rem',
              borderRadius: '50px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              opacity: 0.4,
              transition: 'opacity 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              if (!e.currentTarget.contains(document.activeElement)) {
                e.currentTarget.style.opacity = 0.4;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }
            }}
            onFocus={(e) => {
              e.currentTarget.style.opacity = 1;
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)';
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(document.relatedTarget)) {
                e.currentTarget.style.opacity = 0.4;
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
              }
            }}
          >
            <TaskInput onAddTask={addTask} />
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default App;
