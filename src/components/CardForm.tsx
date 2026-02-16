import React, { useState } from 'react';
import { BusinessCardData, CardGroup } from '../types';
import { ChevronLeft, Check } from 'lucide-react';

interface CardFormProps {
  initialData?: Partial<BusinessCardData>;
  onSave: (data: Omit<BusinessCardData, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const groupConfig: Record<CardGroup, { color: string; activeColor: string }> = {
  [CardGroup.WORK]: { color: 'border-blue-200 text-blue-600', activeColor: 'bg-blue-500 text-white border-blue-500' },
  [CardGroup.FRIEND]: { color: 'border-emerald-200 text-emerald-600', activeColor: 'bg-emerald-500 text-white border-emerald-500' },
  [CardGroup.FAMILY]: { color: 'border-rose-200 text-rose-500', activeColor: 'bg-rose-400 text-white border-rose-400' },
  [CardGroup.OTHER]: { color: 'border-slate-200 text-slate-500', activeColor: 'bg-slate-400 text-white border-slate-400' },
};

const InputField: React.FC<{
  label: string; name: string; type?: string; placeholder: string; required?: boolean;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, type = 'text', placeholder, required = false, value, onChange }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type={type}
      name={name}
      required={required}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 focus:bg-white transition-all text-sm"
      placeholder={placeholder}
    />
  </div>
);

export const CardForm: React.FC<CardFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    title: initialData?.title || '',
    mobile: initialData?.mobile || '',
    tel: initialData?.tel || '',
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
    <div className="bg-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 flex justify-between items-center border-b border-slate-100">
        <button onClick={onCancel} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <h2 className="font-bold text-base text-slate-900">명함 정보</h2>
        <button
          onClick={handleSubmit}
          className="p-2 text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Check size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-2xl mx-auto w-full">
        {formData.imageUrl && (
          <div className="mb-8 rounded-2xl overflow-hidden bg-slate-100">
            <img src={formData.imageUrl} alt="Scanned Card" className="w-full h-auto object-cover block" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField label="이름" name="name" placeholder="홍길동" required value={formData.name} onChange={handleChange} />

          <div className="grid grid-cols-2 gap-3">
            <InputField label="회사" name="company" placeholder="회사명" value={formData.company} onChange={handleChange} />
            <InputField label="직함" name="title" placeholder="직책" value={formData.title} onChange={handleChange} />
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          <div className="grid grid-cols-2 gap-3">
            <InputField label="휴대폰" name="mobile" type="tel" placeholder="010-0000-0000" value={formData.mobile} onChange={handleChange} />
            <InputField label="일반전화" name="tel" type="tel" placeholder="02-000-0000" value={formData.tel} onChange={handleChange} />
          </div>
          <InputField label="이메일" name="email" type="email" placeholder="example@company.com" value={formData.email} onChange={handleChange} />
          <InputField label="웹사이트" name="website" placeholder="www.company.com" value={formData.website} onChange={handleChange} />
          <InputField label="주소" name="address" placeholder="서울시 ..." value={formData.address} onChange={handleChange} />

          <div className="h-px bg-slate-100 my-2"></div>

          {/* Group Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">그룹</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(CardGroup).map(group => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, group }))}
                  className={`py-2.5 px-2 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    formData.group === group
                      ? groupConfig[group].activeColor
                      : groupConfig[group].color + ' bg-white hover:bg-slate-50'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          <div className="h-24"></div>
        </form>
      </div>

      {/* Save Button */}
      <div className="sticky bottom-0 p-5 bg-white/80 backdrop-blur-xl border-t border-slate-100">
        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm active:scale-[0.98] transition-all hover:bg-slate-800"
        >
          저장하기
        </button>
      </div>
    </div>
  );
};
