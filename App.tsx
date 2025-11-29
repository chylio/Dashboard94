
import React, { useState, useMemo, useEffect } from 'react';
import { Upload, FileDown, Database, Clipboard, RefreshCw, ShieldCheck, PlayCircle, Lock, LogOut, UserCog, X, Cloud, Link as LinkIcon, Save, Calculator, HelpCircle, Copy, CheckCircle, XCircle } from 'lucide-react';
import { EquipmentItem, Status } from './types';
import { INITIAL_DATA, THRESHOLD_COMMITTEE_APPROVAL } from './constants';
import EquipmentTable from './components/EquipmentTable';
import MetricsCards from './components/MetricsCards';
import AnalysisPanel from './components/AnalysisPanel';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [items, setItems] = useState<EquipmentItem[]>(INITIAL_DATA);
  
  // Admin & Login State
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  // Data Input State
  const [inputMode, setInputMode] = useState<'file' | 'paste' | 'cloud'>('paste');
  const [pasteContent, setPasteContent] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Cloud Sync State
  const [sheetUrl, setSheetUrl] = useState('');
  const [rememberUrl, setRememberUrl] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load saved URL on mount
  useEffect(() => {
    const savedUrl = localStorage.getItem('equipflow_sheet_url');
    if (savedUrl) {
      setSheetUrl(savedUrl);
      setRememberUrl(true);
    }
  }, []);

  // Authentication Handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUser === '9400' && loginPass === '9401') {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginUser('');
      setLoginPass('');
      setLoginError('');
    } else {
      setLoginError('帳號或密碼錯誤');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    // Optional: Reset data input state on logout if desired
    setPasteContent('');
  };

  // Shared Parser Logic (Supports CSV and Excel Copy-Paste TSV)
  const parseRawData = (text: string): EquipmentItem[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return []; // Header only or empty

    // Detect delimiter: Excel copy-paste uses Tabs (\t), CSV uses Commas (,)
    const firstLine = lines[0];
    const isTSV = firstLine.includes('\t');
    
    return lines.slice(1) // skip header
      .filter(line => line.trim() !== '')
      .map((line, index) => {
        let cols: string[];

        if (isTSV) {
          cols = line.split('\t');
        } else {
          cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        }
        
        const clean = (s: string) => s?.replace(/^"|"$/g, '').trim() || '';
        
        // NEW Column Mapping:
        // 0: Project Number (計畫編號)
        // 1: Name (設備名稱)
        // 2: Quantity (核定數量) - NEW
        // 3: Unit (單位) - NEW
        // 4: Start Status (開始狀態)
        // 5: Cost (預估費用)
        // 6: Dean Approval
        // 7: Committee Approval
        // 8: Signature
        // 9: Requisition
        // 10: Procurement

        const projectNumber = clean(cols[0]);
        const name = clean(cols[1]);
        const quantity = parseFloat(clean(cols[2])) || 1;
        const unit = clean(cols[3]) || '式';
        const startStatus = clean(cols[4]);
        const cost = parseFloat(clean(cols[5]).replace(/,/g, '')) || 0;
        
        // Robust Status Checking
        const isApproved = (val: string) => {
          const v = (val || '').toUpperCase();
          return v === '1' || v === 'V' || v.includes('APPROVED') || v.includes('GREEN') || v.includes('已核准') || v.includes('通過') || v.includes('綠燈') || v.includes('YES') || v.includes('是');
        };

        const isYes = (val: string) => {
          const v = (val || '').toLowerCase();
          return v === '1' || v === 'v' || v.includes('yes') || v.includes('true') || v.includes('是') || v.includes('完成') || v.includes('y');
        };

        const isCompleted = (val: string) => {
           const v = (val || '').toLowerCase();
           return v.includes('completed') || v.includes('完成') || v.includes('結束');
        };

        let procStatus = Status.PENDING;
        const rawProc = clean(cols[10]); 
        if (isCompleted(rawProc)) procStatus = Status.COMPLETED;
        else if (rawProc.includes('進行') || rawProc.includes('IN')) procStatus = Status.IN_PROGRESS;

        return {
          id: `item-${index}-${Date.now()}`,
          projectNumber: projectNumber || 'N/A',
          name: name || '未命名項目',
          approvedQuantity: quantity,
          unit: unit,
          startStatus: startStatus || '新申請',
          estimatedCost: cost,
          deanApproval: isApproved(clean(cols[6])) ? Status.APPROVED : Status.PENDING,
          committeeApproval: cost < THRESHOLD_COMMITTEE_APPROVAL ? Status.NOT_APPLICABLE : (isApproved(clean(cols[7])) ? Status.APPROVED : Status.PENDING),
          signatureComplete: isYes(clean(cols[8])),
          requisitionSent: isYes(clean(cols[9])),
          procurementProcess: procStatus
        };
      });
  };

  // Local File Upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const newItems = parseRawData(text);
      if(newItems.length > 0) {
        setItems(newItems);
        setLastUpdated(new Date());
      } else {
        alert('無法解析檔案，請確認格式正確。');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteProcess = () => {
    if (!pasteContent.trim()) return;
    const newItems = parseRawData(pasteContent);
    if (newItems.length > 0) {
      setItems(newItems);
      setLastUpdated(new Date());
      setPasteContent('');
    } else {
      alert('無法解析資料，請確認您複製了包含標題的完整表格。');
    }
  };

  const handleCloudSync = async () => {
    if (!sheetUrl) return;
    setIsSyncing(true);

    if (rememberUrl) {
      localStorage.setItem('equipflow_sheet_url', sheetUrl);
    } else {
      localStorage.removeItem('equipflow_sheet_url');
    }

    try {
      const response = await fetch(sheetUrl);
      if (!response.ok) throw new Error('網路請求失敗');
      const text = await response.text();
      const newItems = parseRawData(text);
      
      if (newItems.length > 0) {
        setItems(newItems);
        setLastUpdated(new Date());
      } else {
        alert('雖然連線成功，但無法解析資料。請確認連結是否為 Google Sheet 的 CSV 發布連結。');
      }
    } catch (error) {
      console.error(error);
      alert('同步失敗。請檢查連結是否正確，並確認該 Google Sheet 已發布到網路 (CSV 格式)。');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const bom = "\uFEFF";
    const headers = "計畫編號,設備名稱,核定數量,單位,開始狀態,預估費用,院長核准,經策會核准,簽呈完備,請購單送出,採購狀態\n";
    // Provide robust examples using shorthands 1 and v
    const rows = [
        "113-A001,範例 MRI 掃描儀,1,台,新申請,15000000,1,待審核,0,0,進行中",
        "113-B052,小型離心機,5,組,汰舊換新,250000,v,不適用,v,v,完成",
        "113-C008,生理監視器,10,式,升級,4500000,1,1,1,1,COMPLETED"
    ].join("\n");
    const blob = new Blob([bom + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'equipment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const metrics = useMemo(() => {
    const totalItems = items.length;
    const totalCost = items.reduce((acc, item) => acc + item.estimatedCost, 0);
    const completedItems = items.filter(item => item.procurementProcess === Status.COMPLETED).length;
    
    // Calculate Dean Approved Cost
    const approvedCost = items.reduce((acc, item) => {
      // Sum cost if Dean Approval is APPROVED
      if (item.deanApproval === Status.APPROVED) {
        return acc + item.estimatedCost;
      }
      return acc;
    }, 0);

    // Calculate Balance (Total Estimated - Approved)
    const balance = totalCost - approvedCost;

    let progressSum = 0;
    items.forEach(item => {
        let steps = 0; let done = 0;
        steps++; if(item.deanApproval === Status.APPROVED) done++;
        if(item.estimatedCost >= THRESHOLD_COMMITTEE_APPROVAL) { steps++; if(item.committeeApproval === Status.APPROVED) done++; }
        steps++; if(item.signatureComplete) done++;
        steps++; if(item.requisitionSent) done++;
        steps++; if(item.procurementProcess === Status.COMPLETED) done++;
        progressSum += (done/steps)*100;
    });

    return {
      totalItems,
      totalCost,
      completedItems,
      avgProgress: totalItems > 0 ? progressSum / totalItems : 0,
      approvedCost,
      balance
    };
  }, [items]);

  const costData = useMemo(() => {
    return items.map(item => ({
      name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
      cost: item.estimatedCost
    })).sort((a,b) => b.cost - a.cost).slice(0, 5); 
  }, [items]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-20 relative">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                管理員登入
              </h3>
              <button onClick={() => setShowLoginModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">帳號</label>
                <input 
                  type="text" 
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="請輸入帳號"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="請輸入密碼"
                />
              </div>
              {loginError && (
                <div className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded border border-red-100">
                  {loginError}
                </div>
              )}
              <div className="pt-2">
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                  登入
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excel Formula Helper Modal */}
      {showFormulaModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center shrink-0">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Excel 公式小幫手
                  </h3>
                  <button onClick={() => setShowFormulaModal(false)} className="text-white/80 hover:text-white">
                      <X className="w-5 h-5" />
                  </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                      <p className="font-bold flex items-center gap-2 mb-2">
                          <HelpCircle className="w-4 h-4" />
                          如何使用？
                      </p>
                      <p>
                          Excel 檔案輸入資料時，可以使用以下技巧來加快速度。CSV 檔案不支援儲存公式，但儀表板可以識別您輸入的代號。
                      </p>
                  </div>

                  {/* Formula 1: Committee */}
                  <div className="space-y-2">
                      <h4 className="font-bold text-gray-800">1. 經策會自動判斷 (依據金額)</h4>
                      <p className="text-xs text-gray-500">當費用 (假設在 F 欄) 小於 300 萬顯示「不適用」，否則顯示「待審核」。</p>
                      <div className="relative group">
                          <div className="bg-gray-800 text-green-400 font-mono p-3 rounded-lg text-sm break-all">
                              =IF(F2&lt;3000000, "不適用", "待審核")
                          </div>
                          <button 
                              onClick={() => { navigator.clipboard.writeText('=IF(F2<3000000, "不適用", "待審核")'); alert('已複製公式！'); }}
                              className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                              title="複製公式"
                          >
                              <Copy className="w-4 h-4" />
                          </button>
                      </div>
                  </div>

                  {/* Formula 2: Status Lights (Shorthand) */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-gray-800">2. 快速輸入代號 (燈號自動變換)</h4>
                    <p className="text-xs text-gray-500">無需輸入公式！直接在審核欄位輸入簡單代號，儀表板即會自動識別為對應燈號：</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-100 px-2 py-1 rounded border border-green-200">
                                <CheckCircle className="w-3 h-3" /> 綠燈 / 通過
                            </span>
                            <span className="text-gray-600">請輸入： <code className="font-mono font-bold text-indigo-600 bg-white border border-gray-300 px-1.5 py-0.5 rounded">1</code> 或 <code className="font-mono font-bold text-indigo-600 bg-white border border-gray-300 px-1.5 py-0.5 rounded">v</code></span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-100 px-2 py-1 rounded border border-red-200">
                                <XCircle className="w-3 h-3" /> 紅燈 / 駁回
                            </span>
                            <span className="text-gray-600">請輸入： <code className="font-mono font-bold text-indigo-600 bg-white border border-gray-300 px-1.5 py-0.5 rounded">0</code> 或 <code className="font-mono font-bold text-indigo-600 bg-white border border-gray-300 px-1.5 py-0.5 rounded">x</code></span>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 border-t border-gray-200 pt-2">
                            * 提示：在 Excel 中輸入這些代號即可，上傳後儀表板會自動轉換為漂亮的燈號圖示。
                        </p>
                    </div>
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <Database className="text-white w-5 h-5" />
             </div>
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 hidden sm:block">
               EquipFlow 設備採購儀表板
             </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
             {lastUpdated && (
               <div className="text-xs text-gray-400 hidden lg:block">
                 最後更新: {lastUpdated.toLocaleTimeString()}
               </div>
             )}

             {isAdmin ? (
               <div className="flex items-center gap-3">
                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                    <UserCog className="w-3 h-3" />
                    管理員模式
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut className="w-4 h-4" />
                    登出
                  </button>
               </div>
             ) : (
               <button 
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
               >
                 <Lock className="w-4 h-4" />
                 管理員登入
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Data Input Section - ONLY VISIBLE TO ADMIN */}
        {isAdmin && (
          <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-100 p-6 mb-8 transition-all animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold">
              後台資料管理區
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                資料更新中心
              </h2>
              
              <div className="flex flex-wrap items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                <button 
                  onClick={() => setInputMode('paste')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${inputMode === 'paste' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Clipboard className="w-4 h-4" />
                  快速貼上
                </button>
                <button 
                  onClick={() => setInputMode('cloud')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${inputMode === 'cloud' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Cloud className="w-4 h-4" />
                  Google 雲端
                </button>
                <button 
                  onClick={() => setInputMode('file')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${inputMode === 'file' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Upload className="w-4 h-4" />
                  上傳檔案
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1 hidden sm:block"></div>
                <button 
                  onClick={() => setShowFormulaModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-emerald-600 hover:bg-white hover:shadow-sm transition-all whitespace-nowrap"
                >
                  <Calculator className="w-4 h-4" />
                  Excel 公式小幫手
                </button>
             </div>
            </div>
            
            {/* Input Mode: File Upload */}
            {inputMode === 'file' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div>
                  <h2 className="text-sm font-bold text-blue-900">
                    匯入 Excel/CSV 檔案
                  </h2>
                  <p className="text-xs text-blue-700 mt-1">
                    支援 .csv 格式，適合大量資料更新。
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 px-4 py-2 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors shadow-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    下載 CSV 範本
                  </button>
                  <label className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer shadow-sm transition-transform active:scale-95">
                    <Upload className="w-4 h-4" />
                    <span>選擇檔案</span>
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Input Mode: Google Sheets */}
            {inputMode === 'cloud' && (
              <div className="bg-green-50 p-5 rounded-lg border border-green-100">
                 <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-sm font-bold text-green-900 flex items-center gap-2">
                          <LinkIcon className="w-4 h-4" />
                          Google Sheets 同步
                        </h2>
                        <p className="text-xs text-green-700 mt-1">
                          請輸入 Google Sheet「發布到網路」的 CSV 連結。
                          <br/>
                          <span className="opacity-70">操作方式：檔案 &gt; 分享 &gt; 發布到網路 &gt; 選擇工作表 &gt; 選擇 CSV &gt; 發布</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={sheetUrl}
                        onChange={(e) => setSheetUrl(e.target.value)}
                        placeholder="https://docs.google.com/spreadsheets/d/e/.../pub?output=csv"
                        className="flex-1 px-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm bg-white"
                      />
                      <button 
                        onClick={handleCloudSync}
                        disabled={!sheetUrl || isSyncing}
                        className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-sm font-medium text-sm transition-all active:scale-95 whitespace-nowrap"
                      >
                        {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {isSyncing ? '同步中' : '立即更新'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        id="rememberUrl"
                        checked={rememberUrl}
                        onChange={(e) => setRememberUrl(e.target.checked)}
                        className="rounded border-green-300 text-green-600 focus:ring-green-500 h-4 w-4"
                      />
                      <label htmlFor="rememberUrl" className="text-xs text-green-800 cursor-pointer font-medium select-none flex items-center gap-1">
                        <Save className="w-3 h-3" />
                        在這台電腦上記住此連結 (方便下次快速更新)
                      </label>
                    </div>
                 </div>
              </div>
            )}

            {/* Input Mode: Paste */}
            {inputMode === 'paste' && (
              <div className="space-y-4">
                <div className="relative">
                  <textarea 
                    placeholder={`請在 Excel 中全選表格 (含標題)，複製後貼上於此...\n\n格式範例：\n計畫編號 | 設備名稱 | 核定數量 | 單位 | 開始狀態 | 預估費用 | 院長核准 | 經策會核准 | 簽呈完備 | 請購單送出 | 採購狀態\n\n小技巧：在審核欄位輸入「1」或「v」代表通過；「0」或「x」代表駁回。`}
                    value={pasteContent}
                    onChange={(e) => setPasteContent(e.target.value)}
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-mono text-sm resize-none"
                  />
                  <div className="absolute bottom-3 right-3 flex gap-2">
                     <div className="flex items-center gap-1 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-100 mr-2">
                       <ShieldCheck className="w-3 h-3 text-green-500" />
                       安全模式：資料不落地
                     </div>
                     <button 
                      onClick={handlePasteProcess}
                      disabled={!pasteContent.trim()}
                      className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-95 font-medium text-sm"
                    >
                      <PlayCircle className="w-4 h-4" />
                      解析並更新
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <MetricsCards metrics={metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Table Section */}
          <div className="lg:col-span-2 space-y-6">
             <div className="flex justify-between items-end mb-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-gray-500" />
                  設備申請清單 
                  {lastUpdated && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">已更新</span>}
                </h2>
             </div>
             <EquipmentTable items={items} />
          </div>

          {/* Sidebar: Charts & AI */}
          <div className="space-y-8">
            <AnalysisPanel items={items} />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-6">前五大成本分配</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip 
                      formatter={(value: number) => new Intl.NumberFormat('zh-TW', { style: 'currency', currency: 'TWD', maximumFractionDigits: 0 }).format(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="cost" radius={[0, 4, 4, 0]}>
                      {costData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hint Box: Modified based on Admin status */}
            {isAdmin ? (
               <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
                    <UserCog className="w-4 h-4" />
                    管理員操作指南
                  </h4>
                  <ul className="text-sm text-indigo-700 space-y-2 list-disc list-inside">
                    <li>請使用上方區塊進行資料更新。</li>
                    <li>
                      <span className="font-bold">Excel 公式小幫手：</span>
                      提供 Excel 判斷公式與輸入代號技巧。
                    </li>
                    <li>
                      <span className="font-bold">Google Sheets 同步：</span>
                      勾選「記住連結」，下次登入即可一鍵更新。
                    </li>
                    <li>完成更新後，建議點擊右上角登出，恢復公開瀏覽模式。</li>
                  </ul>
               </div>
            ) : (
               <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                 <h4 className="font-bold text-gray-600 mb-2 flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4" />
                   公開瀏覽模式
                 </h4>
                 <p className="text-sm text-gray-500 leading-relaxed">
                   您目前處於公開瀏覽模式，僅能檢視採購進度與分析報告。如需更新資料，請點擊右上角進行管理員登入。
                 </p>
               </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
