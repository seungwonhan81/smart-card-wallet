import React, { useState } from 'react';
import { BusinessCardData, CardGroup } from '../types';
import { ChevronLeft, Save } from 'lucide-react';

interface CardFormProps {
  initialData?: Partial<BusinessCardData>;
  onSave: (data: Omit<BusinessCardData, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export const CardForm: React.FC<CardFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    title: initialData?.title || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    website: initialData?.website || '',
    address: initialData?.address || '',
    group: initialData?.group || CardGroup.OTHER,
    imageUrl: initialData?.imageUrl || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col pb-safe-area">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-20 flex justify-between items-center shadow-sm">
        <button onClick={onCancel} className="p-2 -ml-2 text-slate-800 hover:bg-slate-50 rounded-full">
            <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-lg text-slate-900">명함 정보 입력</h2>
        <button onClick={handleSubmit} className="text-brand-600 font-semibold text-sm px-4 py-2 hover:bg-brand-50 rounded-lg transition-colors">
            저장
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {formData.imageUrl && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md border border-slate-100">
                <img src={formData.imageUrl} alt="Scanned Card" className="w-full h-auto object-cover block" />
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Essential Info */}
            <div className="bg-white rounded-xl">
                <label className="block text-sm font-bold text-slate-900 mb-2">이름 <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white outline-none transition-all text-lg font-medium"
                    placeholder="홍길동"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">회사</label>
                    <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="회사명"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">직함</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="직책"
                    />
                </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-5 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-brand-600 uppercase tracking-wider flex items-center gap-2">
                    상세 정보
                </h3>
                
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">전화번호</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="010-0000-0000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">이메일</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="example@company.com"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">웹사이트</label>
                    <input
                        type="text"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="www.company.com"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">주소</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:bg-white outline-none transition-all"
                        placeholder="서울시 ..."
                    />
                </div>
            </div>

            {/* Group Select */}
            <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-900 mb-3">그룹</label>
                <div className="grid grid-cols-3 gap-3">
                    {Object.values(CardGroup).map(group => (
                        <button
                            key={group}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, group }))}
                            className={`py-3 px-2 text-sm font-medium rounded-xl border transition-all ${
                                formData.group === group 
                                ? 'bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-500/30' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="h-10"></div> {/* Bottom spacer */}
        </form>
      </div>

       <div className="sticky bottom-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <button 
                onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-brand-500/20 active:scale-[0.98] transition-all hover:bg-brand-700"
            >
               <Save size={22} />
               저장하기
           </button>
       </div>
    </div>
  );
};