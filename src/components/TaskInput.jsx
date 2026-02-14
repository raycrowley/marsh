import { useState } from 'react';
import { NOTE_SIZES } from '../constants';

function TaskInput({ onAddTask }) {
    const [text, setText] = useState('');
    const [selectedSize, setSelectedSize] = useState(NOTE_SIZES[1]); // Default to Small (260px)

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        onAddTask({
            text,
            width: selectedSize.size,
            height: selectedSize.size,
            color: selectedSize.color
        });
        setText('');
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', width: '100%' }}>
            {/* Input Row */}
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a new task..."
                    style={{
                        flex: 1,
                        padding: '0.8rem 1rem',
                        borderRadius: '30px',
                        border: '1px solid #eee',
                        background: '#f8f9fa',
                        color: '#333', // Dark text
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#ddd';
                    }}
                    onBlur={(e) => {
                        e.target.style.background = '#f8f9fa';
                        e.target.style.borderColor = '#eee';
                    }}
                    aria-label="New task input"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '30px',
                        border: 'none',
                        background: '#2d3436', // Dark button
                        color: '#fff',
                        fontWeight: '600',
                        opacity: text.trim() ? 1 : 0.5,
                        cursor: text.trim() ? 'pointer' : 'default',
                        boxShadow: text.trim() ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
                    }}
                >
                    Add
                </button>
            </div>

            {/* Size Selector (Dot Chips) */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
                {NOTE_SIZES.map((sizeObj) => (
                    <button
                        key={sizeObj.label}
                        type="button"
                        onClick={() => setSelectedSize(sizeObj)}
                        style={{
                            width: '32px',
                            height: '32px',
                            padding: 0,
                            fontSize: '0.75rem',
                            background: selectedSize.label === sizeObj.label ? '#2d3436' : 'transparent',
                            color: selectedSize.label === sizeObj.label ? '#fff' : '#888',
                            border: selectedSize.label === sizeObj.label ? 'none' : '1px solid #ddd',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {sizeObj.label}
                    </button>
                ))}
            </div>
        </form>
    );
}

export default TaskInput;
