import React, { useState, useEffect } from 'react';
import { INITIAL_CARDS } from './constants';
import { BusinessCardData, ViewState } from './types';
import { BottomNav } from './components/BottomNav';
import { CardList } from './components/CardList';
import { CardScanner } from './components/CardScanner';
import { CardForm } from './components/CardForm';
import { StatsChart } from './components/StatsChart';
import { InstallPwa } from './components/InstallPwa';
import { dbGetCards, dbSaveCard, dbDeleteCard } from './utils/storage';

const SEED_KEY = 'smart_card_wallet_seeded_v1';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [cards, setCards] = useState<BusinessCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Partial<BusinessCardData> | null>(null);

  // Load cards from DB on mount
  useEffect(() => {
    const loadData = async () => {
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
    // Optimistic UI update
    setCards(prev => prev.filter(c => c.id !== id));
    
    // Delete from DB
    await dbDeleteCard(id);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'HOME':
        return <CardList cards={cards} onEdit={handleEditRequest} onDelete={handleDeleteRequest} />;
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
        return <CardList cards={cards} onEdit={handleEditRequest} onDelete={handleDeleteRequest} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <InstallPwa />
      <main className="min-h-screen">
        {renderContent()}
      </main>

      {/* Show Bottom Nav only on main views */}
      {currentView !== 'SCAN' && currentView !== 'EDIT' && (
        <BottomNav currentView={currentView} onChangeView={setCurrentView} />
      )}
    </div>
  );
};

export default App;