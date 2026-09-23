import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AboutModal } from './components/AboutModal';
import { ExcelProcessorTab } from './components/ExcelProcessorTab';
import { CustomDictionaryTab } from './components/CustomDictionaryTab';
import { GuideTab } from './components/GuideTab';
import { getCustomDictRules } from './services/customDictService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'process' | 'dictionary' | 'guide'>('process');
  const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
  const [customRulesCount, setCustomRulesCount] = useState<number>(0);

  const refreshRulesCount = () => {
    setCustomRulesCount(getCustomDictRules().length);
  };

  useEffect(() => {
    refreshRulesCount();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAboutModal={() => setAboutModalOpen(true)}
        customRulesCount={customRulesCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'process' && (
          <ExcelProcessorTab onCustomDictUpdated={refreshRulesCount} />
        )}
        {activeTab === 'dictionary' && (
          <CustomDictionaryTab onRulesChanged={refreshRulesCount} />
        )}
        {activeTab === 'guide' && <GuideTab />}
      </main>

      {/* Footer */}
      <Footer openAboutModal={() => setAboutModalOpen(true)} />

      {/* About & Coffee Modal */}
      <AboutModal
        isOpen={aboutModalOpen}
        onClose={() => setAboutModalOpen(false)}
      />
    </div>
  );
};

export default App;
