import { useState } from 'react';
import type { TabType } from './ui.types';
import FeedbacksInsightsReport from './feedbackInsightsReport';
import FeedbacksInsightsEmotional from './feedbacksInsightsEmotional';
import FeedbacksInsightsStatistics from './feedbacksInsightsStatistics';

export default function InsightsHub() {
  const [activeTab, setActiveTab] = useState<TabType>('reports');

  const tabs = [
    { id: 'reports', label: 'Relatórios' },
    { id: 'emotional', label: 'Análise Emocional' },
    { id: 'statistics', label: 'Estatísticas' },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex border-b border-(--quaternary-color)/10 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
              activeTab === tab.id
                ? 'border-(--primary-color) text-(--text-primary)'
                : 'border-transparent text-(--text-tertiary) hover:text-(--text-secondary)'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'reports' && <FeedbacksInsightsReport />}
        {activeTab === 'emotional' && <FeedbacksInsightsEmotional isTab />}
        {activeTab === 'statistics' && <FeedbacksInsightsStatistics isTab />}
      </div>
    </div>
  );
}
