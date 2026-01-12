// src/components/charts/ChartToolbar.jsx
import React from 'react';
import { ArrowDownTrayIcon, MagnifyingGlassPlusIcon, EyeIcon } from '@heroicons/react/24/outline';

const ChartToolbar = () => {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <button className="btn btn-sm btn-outline">
        <ArrowDownTrayIcon className="h-4 w-4" />
        <span>Exportar</span>
      </button>
      <button className="btn btn-sm btn-outline">
        <MagnifyingGlassPlusIcon className="h-4 w-4" />
        <span>Zoom</span>
      </button>
      <button className="btn btn-sm btn-outline">
        <EyeIcon className="h-4 w-4" />
        <span>Alternar Visão</span>
      </button>
    </div>
  );
};

export default ChartToolbar;
