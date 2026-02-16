import React, { useState, useMemo } from 'react';
import { BusinessCardData, CardGroup } from '../types';
import { Search, Phone, Mail, Globe, MapPin, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

  const groupColors: Record<string, string> = {
    [CardGroup.WORK]: 'bg-blue-500',
    [CardGroup.FRIEND]: 'bg-emerald-500',
    [CardGroup.FAMILY]: 'bg-rose-400',
    [CardGroup.OTHER]: 'bg-slate-400',
  };

  return (
    <div className="pb-28 px-5 pt-14 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm text-slate-400 font-medium mb-1">Smart Card Wallet</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          내 명함
          <span className="text-slate-300 font-normal ml-2 text-2xl">{cards.length}</span>
        </h1>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-300" size={18} />
        <input
          type="text"
          placeholder="이름, 회사, 직함으로 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200/80 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all text-sm"
        />
      </div>

      {/* Group Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        <button
          onClick={() => setSelectedGroup('ALL')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
            selectedGroup === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          전체
        </button>
        {Object.values(CardGroup).map(group => (
          <button
            key={group}
            onClick={() => setSelectedGroup(group)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
              selectedGroup === group
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${groupColors[group]}`}></span>
            {group}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-1 text-xs bg-slate-100 rounded-lg p-0.5">
          <button
            onClick={() => setSortOption('date')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              sortOption === 'date' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-400'
            }`}
          >
            최신순
          </button>
          <button
            onClick={() => setSortOption('name')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              sortOption === 'name' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-400'
            }`}
          >
            이름순
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3">
        {filteredCards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-300 text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          filteredCards.map(card => (
            <div
              key={card.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all duration-200 relative"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white ${groupColors[card.group]}`}>
                  {card.name.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">{card.name}</h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {card.title}{card.company && ` · ${card.company}`}
                      </p>
                    </div>

                    {/* Menu */}
                    <div className="relative flex-shrink-0 ml-2">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === card.id ? null : card.id)}
                        className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {openMenuId === card.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-slate-100 py-1 min-w-[100px]">
                            <button
                              onClick={() => { onEdit(card); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              <Pencil size={14} /> 수정
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('정말 삭제하시겠습니까?')) onDelete(card.id);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={14} /> 삭제
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Contact Details */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.mobile && (
                      <a href={`tel:${card.mobile}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors">
                        <Phone size={12} /> {card.mobile}
                      </a>
                    )}
                    {card.tel && (
                      <a href={`tel:${card.tel}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors">
                        <Phone size={12} /> {card.tel}
                      </a>
                    )}
                    {card.email && (
                      <a href={`mailto:${card.email}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors truncate max-w-[200px]">
                        <Mail size={12} className="flex-shrink-0" /> <span className="truncate">{card.email}</span>
                      </a>
                    )}
                    {card.website && (
                      <a href={`https://${card.website}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500 hover:bg-slate-100 transition-colors truncate max-w-[200px]">
                        <Globe size={12} className="flex-shrink-0" /> <span className="truncate">{card.website}</span>
                      </a>
                    )}
                    {card.address && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-xs text-slate-500 truncate max-w-[250px]">
                        <MapPin size={12} className="flex-shrink-0" /> <span className="truncate">{card.address}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
