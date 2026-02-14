import { useState, useRef, useEffect } from 'react';

function BoardTabs({ boards, activeBoardId, onSwitch, onAdd, onRename, onDelete }) {
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editingId]);

    const startEditing = (board) => {
        setEditingId(board.id);
        setEditName(board.name);
    };

    const saveEditing = () => {
        if (editingId && editName.trim()) {
            onRename(editingId, editName.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') saveEditing();
        if (e.key === 'Escape') setEditingId(null);
    };

    return (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            overflowX: 'auto',
            pointerEvents: 'auto',
            maxWidth: '100%',
            alignItems: 'center',
            scrollbarWidth: 'none', // Hide scrollbar Firefox
            msOverflowStyle: 'none',  // Hide scrollbar IE/Edge
            // Hide scrollbar Webkit
            '&::-webkit-scrollbar': { display: 'none' }
        }}>
            {boards.map(board => {
                const isActive = board.id === activeBoardId;
                return (
                    <div
                        key={board.id}
                        onClick={() => onSwitch(board.id)}
                        onDoubleClick={() => startEditing(board)}
                        className="board-tab"
                        style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '20px',
                            background: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                            border: isActive ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
                            color: isActive ? '#2d3436' : '#636e72',
                            fontSize: '0.9rem',
                            fontWeight: isActive ? '600' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {editingId === board.id ? (
                            <input
                                ref={inputRef}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                onBlur={saveEditing}
                                onKeyDown={handleKeyDown}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'inherit',
                                    font: 'inherit',
                                    width: '100px',
                                    textAlign: 'center'
                                }}
                            />
                        ) : (
                            <span>{board.name}</span>
                        )}

                        {/* Delete Button (only visible on hover or active for better UX, though hover is tricky on touch) 
                For now, let's keep it simple: Show 'x' only if active and more than 1 board exists
            */}
                        {isActive && boards.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(board.id); }}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#ff7675',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '50%',
                                    marginLeft: '4px'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                title="Delete Board"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        )}
                    </div>
                );
            })}

            <button
                onClick={onAdd}
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.4)',
                    color: '#2d3436',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                title="New Board"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
        </div>
    );
}

export default BoardTabs;
