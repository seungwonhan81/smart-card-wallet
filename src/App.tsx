import React, { useState, useEffect } from 'react';
import { INITIAL_CARDS } from './constants';
import { BusinessCardData, ViewState } from './types';
import { BottomNav } from './components/BottomNav';
import { CardList } from './components/CardList';
import { CardScanner } from './components/CardScanner';
import { CardForm } from './components/CardForm';
import { StatsChart } from './components/StatsChart';
import { InstallPwa } from './components/InstallPwa';
import { dbGetCards, dbSaveCard, dbDeleteCard, requestPersistentStorage, exportCardsToJSON, importCardsFromJSON } from './utils/storage';
import { saveImageToDevice } from './utils/imageStorage';

const SEED_KEY = 'smart_card_wallet_seeded_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [cards, setCards] = useState<BusinessCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Partial<BusinessCardData> | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  // Load cards from DB on mount
  useEffect(() => {
    const loadData = async () => {
      await requestPersistentStorage();
      try {
        const dbCards = await dbGetCards();
        
        // Check if this is the first run ever
        const hasSeeded = localStorage.getItem(SEED_KEY);
        
        if (!hasSeeded && dbCards.length === 0) {
          // First time load: Seed with initial data
          console.log("Seeding initial data...");
          for (const card of INITIAL_CARDS) {
            await dbSaveCard(card);
          }
          setCards(INITIAL_CARDS);
          localStorage.setItem(SEED_KEY, 'true');
        } else {
          // Normal load
          setCards(dbCards);
        }
      } catch (error) {
        console.error("Failed to load cards:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handlers
  const handleScanComplete = (extractedData: Partial<BusinessCardData>, imageUrl: string) => {
    setEditingCard({ ...extractedData, imageUrl });
    setCurrentView('EDIT');
  };

  const handleSaveCard = async (cardData: Omit<BusinessCardData, 'id' | 'createdAt'>) => {
    let newCard: BusinessCardData;

    if (editingCard && 'id' in editingCard && editingCard.id) {
        // Update existing
        newCard = { ...editingCard, ...cardData } as BusinessCardData;
        
        // Optimistic UI update
        setCards(prev => prev.map(c => c.id === newCard.id ? newCard : c));
    } else {
        // Create new
        newCard = {
            ...cardData,
            id: Date.now().toString(),
            createdAt: Date.now(),
        };
        
        // Optimistic UI update
        setCards(prev => [newCard, ...prev]);
    }

    // Save to DB
    await dbSaveCard(newCard);

    setEditingCard(null);
    setCurrentView('HOME');
  };

  const handleEditRequest = (card: BusinessCardData) => {
    setEditingCard(card);
    setCurrentView('EDIT');
  };

  const handleDeleteRequest = async (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    await dbDeleteCard(id);
  };

  const handleExport = async () => {
    try {
      await exportCardsToJSON();
      showToast('백업 파일이 저장되었습니다.');
    } catch {
      showToast('백업에 실패했습니다.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importCardsFromJSON(file);
      const refreshed = await dbGetCards();
      setCards(refreshed);
      showToast(`${count}개의 명함을 복원했습니다.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '복원에 실패했습니다.');
    }
    e.target.value = '';
  };

  const handleSaveImage = (card: BusinessCardData) => {
    if (!card.imageUrl) {
      showToast('저장된 사진이 없습니다.');
      return;
    }
    saveImageToDevice(card.imageUrl, card.name);
    showToast('사진을 다운로드합니다.');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'HOME':
        return <CardList cards={cards} onEdit={handleEditRequest} onDelete={handleDeleteRequest} onExport={handleExport} onImport={handleImport} onSaveImage={handleSaveImage} />;
      case 'SCAN':
        return <CardScanner onScanComplete={handleScanComplete} onCancel={() => setCurrentView('HOME')} />;
      case 'EDIT':
        return (
            <CardForm 
                initialData={editingCard || {}} 
                onSave={handleSaveCard} 
                onCancel={() => {
                    setEditingCard(null);
                    setCurrentView('HOME');
                }} 
            />
        );
      case 'STATS':
        return <StatsChart cards={cards} />;
      default:
        return <CardList cards={cards} onEdit={handleEditRequest} onDelete={handleDeleteRequest} onExport={handleExport} onImport={handleImport} onSaveImage={handleSaveImage} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <InstallPwa />
      <main className="min-h-screen">
        {renderContent()}
      </main>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-5 py-3 rounded-2xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Show Bottom Nav only on main views */}
      {currentView !== 'SCAN' && currentView !== 'EDIT' && (
        <BottomNav currentView={currentView} onChangeView={setCurrentView} />
      )}
    </div>
  );
};

export default App;