// src/components/common/CategorySelector.jsx
import React, { useState } from 'react';

const CategorySelector = ({ category, setCategory, categories, setCategories }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === '__add_new__') {
            setIsAdding(true);
            setCategory('');
        } else {
            setIsAdding(false);
            setCategory(value);
        }
    };

    const handleNewCategoryKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = newCategory.trim();
            if (trimmed && !categories.includes(trimmed)) {
                setCategories([...categories, trimmed]);
                setCategory(trimmed);
                setIsAdding(false);
                setNewCategory('');
            }
        }
    };

    return (
        <div className="category-selector">
            {!isAdding ? (
                <select id="category" value={category} onChange={handleCategoryChange}>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    <option value="__add_new__">Adicionar nova...</option>
                </select>
            ) : (
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={handleNewCategoryKeyDown}
                    onBlur={() => setIsAdding(false)}
                    placeholder="Nova categoria e pressione Enter"
                    autoFocus
                />
            )}
        </div>
    );
};

export default CategorySelector;
