import React, { useState, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import EditorPanel from './components/EditorPanel';
import ChartPreview from './components/ChartPreview';
import { ChartData, ChartConfig, ChartType, DEFAULT_COLORS, Language } from './types';
import { Sparkles, BarChart3, Loader2, LayoutTemplate, Globe, Github } from 'lucide-react';
import { motion } from 'framer-motion';

const gemini = new GeminiService();

// Dictionary for main app UI
const appDict = {
  zh: {
    heroTitle: "ChartGenius AI",
    heroDesc: "将您的文本、报告或杂乱数据瞬间转化为专业的交互式图表。基于 Gemini 模型。",
    placeholder: "在此粘贴文本... 例如：'第一季度销售额1.5万，第二季度增长至2.2万，但第三季度回落至1.8万，第四季度反弹至2.5万。'",
    btnAnalyze: "生成图表",
    btnAnalyzeLoading: "分析中...",
    step1: "输入数据",
    step2: "AI 处理",
    step3: "导出图表",
    newChart: "新建图表",
    updateData: "更新数据",
    footerText: "© 2024 ChartGenius AI. Powered by Google Gemini.",
    error: "生成失败，请重试或检查您的网络连接。"
  },
  en: {
    heroTitle: "ChartGenius AI",
    heroDesc: "Instantly transform your text, reports, or messy data into professional interactive charts. Powered by Gemini.",
    placeholder: "Paste text here... e.g., 'Q1 sales were 15k, Q2 grew to 22k, but Q3 dipped to 18k, rebounding to 25k in Q4.'",
    btnAnalyze: "Generate",
    btnAnalyzeLoading: "Analyzing...",
    step1: "Input Data",
    step2: "AI Process",
    step3: "Export Chart",
    newChart: "New Chart",
    updateData: "Update",
    footerText: "© 2024 ChartGenius AI. Powered by Google Gemini.",
    error: "Generation failed, please try again or check your network."
  }
};

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('zh');
  
  // The processed chart data
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  // Visual configuration
  const [config, setConfig] = useState<ChartConfig>({
    type: ChartType.BAR,
    colors: DEFAULT_COLORS,
    showGrid: true,
    showLegend: true,
    showTooltip: true,
    showValue: false, // Default to hidden
    showDescription: true, // Default to visible
    titleColor: '#f8fafc', // Slate 50
    backgroundColor: '#0a0a0a', // Nearly black
    textColor: '#94a3b8', // Slate 400
    gridColor: '#262626' // Neutral 800
  });

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const t = appDict[language];

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await gemini.analyzeText(inputText);
      // If current language is English, try to ensure the initial generation matches if input was English, 
      // but Gemini usually follows input language. We can force translate if needed, but keeping it simple for now.
      setChartData(data);
      setConfig(prev => ({
        ...prev,
        type: data.suggestedType
      }));
    } catch (err) {
      setError(t.error);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = async () => {
      const newLang = language === 'zh' ? 'en' : 'zh';
      setLanguage(newLang);
      
      // If there is existing chart data, translate it
      if (chartData) {
          setIsLoading(true);
          try {
              const translatedData = await gemini.translateChartData(chartData, newLang);
              setChartData(translatedData);
          } catch (e) {
              console.error("Translation error", e);
          } finally {
              setIsLoading(false);
          }
      }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans flex flex-col selection:bg-white selection:text-black">
      
      {/* Navbar */}
      <nav className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center justify-between px-6 fixed top-0 w-full z-50">
         <div className="flex items-center gap-2">
            <div className="bg-white text-black p-1 rounded-sm">
              <BarChart3 size={16} strokeWidth={3} />
            </div>
            <span className="font-bold tracking-tight text-white text-sm">ChartGenius AI</span>
         </div>
         <div className="flex items-center gap-4">
             <button 
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
             >
                <Globe size={14} />
                {language === 'zh' ? 'English' : '中文'}
             </button>
             <a href="#" className="text-neutral-500 hover:text-white transition-colors">
                 <Github size={18} />
             </a>
         </div>
      </nav>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col md:flex-row pt-16 h-[calc(100vh-32px)]"> {/* Subtract Footer height estimate */}
        
        {/* Left Panel: Input & Editor */}
        <div className={`w-full md:w-[420px] lg:w-[460px] flex flex-col border-r border-neutral-800 bg-neutral-950 z-20 transition-all duration-0 ${chartData ? 'md:translate-x-0 h-full' : 'md:w-full max-w-3xl mx-auto border-none bg-transparent h-auto mt-20 md:mt-0'}`}>
            
            {/* Conditional Header for Empty State */}
            {!chartData && (
                <div className="text-center mt-12 mb-12 px-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6 bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
                       {t.heroTitle}
                    </h1>
                    <p className="text-neutral-500 max-w-lg mx-auto text-lg leading-relaxed">
                       {t.heroDesc}
                    </p>
                </div>
            )}

            {/* Input / Editor Switch */}
            {!chartData ? (
            <div className="px-6 md:px-0 pb-6 flex-1 flex flex-col items-center w-full max-w-3xl mx-auto">
                <div className="w-full relative group">
                    <textarea
                    className="relative w-full h-64 bg-neutral-900 text-neutral-200 p-6 rounded-lg border border-neutral-800 focus:border-white focus:ring-0 focus:outline-none resize-none transition-colors placeholder:text-neutral-600 text-sm font-mono leading-relaxed shadow-lg"
                    placeholder={t.placeholder}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    />
                </div>
                
                <div className="w-full mt-8 flex justify-center">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !inputText.trim()}
                        className="w-full md:w-auto px-12 py-4 bg-white hover:bg-neutral-200 text-black rounded-full font-bold text-sm transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-white/10"
                    >
                        {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" size={18}/> {t.btnAnalyzeLoading}
                        </>
                        ) : (
                        <>
                            <Sparkles size={18} /> {t.btnAnalyze}
                        </>
                        )}
                    </button>
                </div>
                
                {error && (
                    <div className="mt-6 w-full p-4 bg-red-950/30 border border-red-900/50 text-red-400 text-sm text-center rounded-md">
                    {error}
                    </div>
                )}

                <div className="mt-20 grid grid-cols-3 gap-8 w-full">
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-white font-bold">1</div>
                        <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{t.step1}</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-white font-bold">2</div>
                        <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{t.step2}</span>
                    </div>
                    <div className="flex flex-col items-center text-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center border border-neutral-800 text-white font-bold">3</div>
                        <span className="text-xs text-neutral-500 font-medium uppercase tracking-wider">{t.step3}</span>
                    </div>
                </div>
            </div>
            ) : (
            <div className="flex-1 overflow-hidden flex flex-col bg-neutral-950 h-full">
                <div className="flex-none p-0 border-b border-neutral-800">
                    <textarea
                        className="w-full h-24 bg-neutral-950 text-neutral-300 p-4 focus:outline-none resize-none text-xs font-mono leading-relaxed"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                    />
                    <div className="px-4 py-2 flex justify-between items-center bg-neutral-900 border-t border-neutral-800">
                        <button onClick={() => setChartData(null)} className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-1">
                            <LayoutTemplate size={12}/> {t.newChart}
                        </button>
                        <button 
                        onClick={handleAnalyze} 
                        className="text-xs bg-white text-black hover:bg-neutral-200 px-3 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 font-medium"
                        >
                        {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12}/>} {t.updateData}
                        </button>
                    </div>
                </div>
                
                {/* Editor Panel */}
                <div className="flex-1 overflow-hidden">
                    <EditorPanel 
                    chartData={chartData} 
                    setChartData={setChartData} 
                    config={config} 
                    setConfig={setConfig} 
                    chartRef={chartContainerRef}
                    language={language}
                    />
                </div>
            </div>
            )}
        </div>

        {/* Right Panel: Preview Area */}
        {chartData && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex-1 bg-black flex flex-col h-[50vh] md:h-full overflow-hidden relative"
            >
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.2] pointer-events-none"></div>

            <div className="flex-1 p-6 md:p-12 flex items-center justify-center">
                <div className="w-full max-w-5xl aspect-[16/10] md:aspect-video bg-neutral-900 border border-neutral-800 shadow-none overflow-hidden relative group">
                {isLoading ? (
                    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center flex-col gap-3">
                         <Loader2 className="animate-spin text-white" size={32} />
                         <p className="text-xs font-medium text-neutral-300 tracking-wider">UPDATING...</p>
                    </div>
                ) : null}
                <ChartPreview 
                    data={chartData} 
                    config={config} 
                    containerRef={chartContainerRef}
                />
                </div>
            </div>
            </motion.div>
        )}
      </div>
      
      {/* Footer */}
      <footer className="h-8 border-t border-neutral-800 bg-neutral-950 flex items-center justify-center text-[10px] text-neutral-600 fixed bottom-0 w-full z-50">
           {t.footerText}
      </footer>

    </div>
  );
};

export default App;