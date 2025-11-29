import React, { useState } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { analyzeEquipmentList } from '../services/geminiService';
import { EquipmentItem } from '../types';

interface AnalysisPanelProps {
  items: EquipmentItem[];
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ items }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await analyzeEquipmentList(items);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">AI 採購分析師</h3>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              分析中...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              {analysis ? '重新分析' : '生成分析報告'}
            </>
          )}
        </button>
      </div>

      {analysis ? (
        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-lg border border-indigo-50/50 shadow-sm text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
          {analysis}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-400 text-sm">
          點擊上方按鈕，讓 Gemini 分析您的設備清單，找出瓶頸與預算洞察。
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;