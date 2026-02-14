import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState, useRef, useEffect } from 'react';
import './TaskItem.css';
import { NOTE_SIZES } from '../constants';
import { motion } from 'framer-motion';

const COLORS = [
    { name: 'Soft Blue', value: '#81ecec', text: '#2d3436' },
    { name: 'Soft Purple', value: '#a29bfe', text: '#2d3436' },
    { name: 'Soft Yellow', value: '#ffeaa7', text: '#2d3436' },
    { name: 'Off-White', value: '#dfe6e9', text: '#2d3436' },
    { name: 'Off-Black', value: '#2d3436', text: '#dfe6e9' },
    { name: 'Strong Red', value: '#d63031', text: '#ffffff' }
];

function TaskItem({ task, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(task.text);
    const inputRef = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging,
    } = useDraggable({ id: task.id, disabled: isEditing });

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleDoubleClick = (e) => {
        e.stopPropagation();
        setIsEditing(true);
    };

    const handleBlur = () => {
        setIsEditing(false);
        if (editText.trim()) {
            onUpdate(task.id, { text: editText });
        } else {
            setEditText(task.text);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditText(task.text);
        }
    };



    const handleResizeStart = (e) => {
        e.stopPropagation(); // Don't drag card
        e.preventDefault(); // Prevent selection

        const startX = e.clientX;
        const startY = e.clientY;
        // Current width or default to Small (260px) if undefined
        const startWidth = task.width || 260;
        const startHeight = task.height || 260;

        const onMove = (moveEvent) => {
            const rawWidth = Math.max(50, startWidth + (moveEvent.clientX - startX));
            // We only care about width for the snap calculation since we want squares
            // Find closest size
            const closest = NOTE_SIZES.reduce((prev, curr) => {
                return (Math.abs(curr.size - rawWidth) < Math.abs(prev.size - rawWidth) ? curr : prev);
            });

            // Update width, height, AND color
            onUpdate(task.id, {
                width: closest.size,
                height: closest.size,
                color: closest.color
            });
        };

        const onUp = () => {
            document.removeEventListener('pointermove', onMove);
            document.removeEventListener('pointerup', onUp);
        };

        document.addEventListener('pointermove', onMove);
        document.addEventListener('pointerup', onUp);
    };

    const toggleComplete = () => {
        onUpdate(task.id, { completed: !task.completed });
    };

    const changeColor = (colorValue) => {
        onUpdate(task.id, { color: colorValue });
    };

    const outerStyle = {
        position: 'absolute',
        left: task.x || 50,
        top: task.y || 50,
        zIndex: isDragging ? 1000 : 1, // Elevate during drag
        touchAction: 'none'
    };

    const innerStyle = {
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        width: (task.width || 200) + 'px',
        height: (task.height || 200) + 'px',
        opacity: isDragging ? 0.8 : 1,
        transition: isDragging ? 'none' : 'width 0.1s, height 0.1s', // Smooth resize

        // Card Visuals
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1.5rem',
        background: task.color || COLORS[0].value,
        color: task.colorText || COLORS[0].text,
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.1)',
        cursor: isEditing ? 'text' : 'grab',
        userSelect: isEditing ? 'auto' : 'none',
        boxShadow: isDragging ? '0 15px 30px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)'
    };

    // Dynamic font size based on width
    const getFontSize = (width) => {
        if (!width) return '1rem'; // Default
        if (width <= 60) return '0.65rem'; // XS - Tiny
        if (width <= 100) return '0.85rem'; // S - Compact
        return '1rem'; // M+ - Standard
    };



    const currentFontSize = getFontSize(task.width);

    return (
        <motion.div
            style={outerStyle}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
                opacity: 1,
                scale: 1,
                transition: { type: "spring", stiffness: 300, damping: 25 }
            }}
            exit={{
                opacity: 0,
                scale: 0.5,
                transition: { duration: 0.2 }
            }}
        >
            <div
                ref={setNodeRef}
                style={innerStyle}
                {...attributes}
                {...listeners}
                onClick={(e) => {
                    e.stopPropagation();
                    // Native focus will handle selection via tabIndex
                }}
                onDoubleClick={handleDoubleClick}
                className="task-card"
                tabIndex={0} // Make focusable
                data-task-id={task.id} // Identify for copy
            >
                {/* Editor */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', width: '100%', padding: '0.5rem 0' }}>
                    {isEditing ? (
                        <textarea
                            ref={inputRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            style={{
                                width: '100%',
                                height: '100%',
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit', // Inherit from parent
                                fontSize: currentFontSize, // Dynamic
                                fontWeight: '500', // Medium
                                lineHeight: '1.4', // Slightly tighter for resize
                                textAlign: 'left', // Left align
                                resize: 'none',
                                outline: 'none',
                                fontFamily: 'inherit'
                            }}
                        />
                    ) : (
                        <p style={{
                            pointerEvents: 'none',
                            fontSize: currentFontSize, // Dynamic
                            fontWeight: '500', // Medium
                            lineHeight: '1.4',
                            textAlign: 'left',
                            textDecoration: task.completed ? 'line-through' : 'none',
                            opacity: task.completed ? 0.6 : 1,
                            margin: 0,
                            whiteSpace: 'pre-wrap', // Preserve formatting
                            wordBreak: 'break-word' // Prevent overflow
                        }}>
                            {task.text}
                        </p>
                    )}
                </div>

                {/* Check/Complete Button (Top-Left) */}
                {!isEditing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleComplete(); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: task.completed ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)',
                            color: task.completed ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.4)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            if (!task.completed) e.currentTarget.style.background = 'rgba(255,255,255,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            if (!task.completed) e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                        }}
                        title={task.completed ? "Mark Incomplete" : "Mark Complete"}
                    >
                        {task.completed ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: '2px solid currentColor' }} />
                        )}
                    </button>
                )}

                {/* Close/Delete Button (Top-Right) */}
                {!isEditing && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: 'transparent',
                            color: 'rgba(0,0,0,0.5)',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            padding: 0,
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                            e.currentTarget.style.color = '#e74c3c';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(0,0,0,0.5)';
                        }}
                        title="Delete Note"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                {/* Resize Handle */}
                {!isEditing && (
                    <div
                        onPointerDown={handleResizeStart}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '24px',
                            height: '24px',
                            cursor: 'nwse-resize',
                            // Minimal corner indicator
                            background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.1) 50%)',
                            borderBottomRightRadius: '16px'
                        }}
                    />
                )}
            </div>
        </motion.div >
    );
}

export default TaskItem;
