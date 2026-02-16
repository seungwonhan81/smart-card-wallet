import { BusinessCardData, CardGroup } from './types';

export const INITIAL_CARDS: BusinessCardData[] = [
  {
    id: '1',
    name: '김철수',
    company: '테크 솔루션',
    title: '수석 개발자',
    mobile: '010-1234-5678',
    tel: '02-555-1234',
    email: 'chulsoo@techsol.com',
    website: 'www.techsol.com',
    address: '서울시 강남구 테헤란로 123',
    group: CardGroup.WORK,
    createdAt: Date.now() - 10000000,
  },
  {
    id: '2',
    name: '이영희',
    company: '크리에이티브 디자인',
    title: '아트 디렉터',
    mobile: '010-9876-5432',
    tel: '',
    email: 'yh.lee@creative.kr',
    website: 'www.creative.kr',
    address: '서울시 마포구 홍대입구 456',
    group: CardGroup.OTHER,
    createdAt: Date.now() - 5000000,
  },
  {
    id: '3',
    name: '박지성',
    company: '미래 금융',
    title: '자산 관리사',
    mobile: '010-5555-7777',
    tel: '',
    email: 'jpark@futurefin.com',
    website: 'www.futurefin.com',
    address: '서울시 여의도 금융로 789',
    group: CardGroup.FRIEND,
    createdAt: Date.now() - 2000000,
  }
];

export const GROUP_COLORS: Record<CardGroup, string> = {
  [CardGroup.WORK]: 'bg-blue-100 text-blue-800',
  [CardGroup.FRIEND]: 'bg-green-100 text-green-800',
  [CardGroup.FAMILY]: 'bg-pink-100 text-pink-800',
  [CardGroup.OTHER]: 'bg-gray-100 text-gray-800',
};