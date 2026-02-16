import React, { useState, useMemo } from 'react';
import { BusinessCardData, CardGroup } from '../types';
import { Search, Phone, Mail, Globe, MapPin } from 'lucide-react';
import { GROUP_COLORS } from '../constants';

interface CardListProps {
  cards: BusinessCardData[];
  onEdit: (card: BusinessCardData) => void;
  onDelete: (id: string) => void;
}

export const CardList: React.FC<CardListProps> = ({ cards, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<CardGroup | 'ALL'>('ALL');
  const [sortOption, setSortOption] = useState<'name' | 'date'>('date');

  const filteredCards = useMemo(() => {
    const filtered = cards.filter(card => {
      const matchesSearch = 
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGroup = selectedGroup === 'ALL' || card.group === selectedGroup;
      
      return matchesSearch && matchesGroup;
    });

    return filtered.sort((a, b) => {
      if (sortOption === 'name') {
        return a.name.localeCompare(b.name, 'ko');
      } else {
        return b.createdAt - a.createdAt;
      }
    });
  }, [cards, searchTerm, selectedGroup, sortOption]);

  return (
    <div className="pb-20 px-4 pt-4 max-w-2xl mx-auto">
      {/* Search Header */}
      <div className="sticky top-0 bg-slate-50/95 backdrop-blur-sm pb-2 pt-2 z-10 -mx-4 px-4 shadow-sm mb-4 transition-colors border-b border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">내 명함첩 ({cards.length})</h1>
        
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="이름, 회사, 직함 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-brand-500 bg-white text-slate-800 placeholder-slate-400"
          />
        </div>

        {/* Group Filter Chips */}
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedGroup('ALL')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === 'ALL' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}
          >
            전체
          </button>
          {Object.values(CardGroup).map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedGroup === group ? 'bg-brand-600 text-white shadow-md shadow-brand-200' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}
            >
              {group}
            </button>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex justify-end items-center mt-3 pt-2 border-t border-slate-200/50">
            <div className="flex items-center space-x-1 text-sm">
                <button 
                    onClick={() => setSortOption('name')}
                    className={`px-2 py-1 flex items-center gap-1 transition-colors ${sortOption === 'name' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    가나다순
                </button>
                <span className="text-slate-300">|</span>
                <button 
                    onClick={() => setSortOption('date')}
                    className={`px-2 py-1 flex items-center gap-1 transition-colors ${sortOption === 'date' ? 'text-brand-600 font-bold' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    입력순
                </button>
            </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 mt-2">
        {filteredCards.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p>검색 결과가 없습니다.</p>
          </div>
        ) : (
          filteredCards.map(card => (
            <div key={card.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all relative overflow-hidden group">
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-semibold ${GROUP_COLORS[card.group]}`}>
                {card.group}
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-slate-500">
                  {card.name.charAt(0)}
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 truncate">{card.name}</h3>
                  <p className="text-sm text-brand-600 font-medium truncate">{card.title} @ {card.company}</p>
                  
                  <div className="mt-4 space-y-2">
                    {card.phone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone size={14} className="mr-2 opacity-70" />
                        <a href={`tel:${card.phone}`} className="hover:text-brand-600">{card.phone}</a>
                      </div>
                    )}
                    {card.email && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail size={14} className="mr-2 opacity-70" />
                        <a href={`mailto:${card.email}`} className="hover:text-brand-600 truncate">{card.email}</a>
                      </div>
                    )}
                    {card.website && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Globe size={14} className="mr-2 opacity-70" />
                        <a href={`https://${card.website}`} target="_blank" rel="noreferrer" className="hover:text-brand-600 truncate">{card.website}</a>
                      </div>
                    )}
                     {card.address && (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin size={14} className="mr-2 opacity-70" />
                        <span className="truncate">{card.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
                <button 
                  onClick={() => onEdit(card)}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  수정
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('정말 삭제하시겠습니까?')) onDelete(card.id);
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};