export enum CardGroup {
  WORK = '직장',
  FRIEND = '친구',
  FAMILY = '가족',
  OTHER = '기타'
}

export interface BusinessCardData {
  id: string;
  name: string;
  company: string;
  title: string;
  mobile: string;
  tel: string;
  email: string;
  website: string;
  address: string;
  group: CardGroup;
  imageUrl?: string;
  createdAt: number;
}

export type ViewState = 'HOME' | 'SCAN' | 'EDIT' | 'STATS';