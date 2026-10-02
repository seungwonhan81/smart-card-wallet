export enum CardGroup {
  CUSTOMER = '고객',
  PARTNER = '거래처',
  CHURCH = '교회',
  GATHERING = '모임',
  PLACE = '장소',
  ACQUAINTANCE = '지인',
  OTHER = '기타',
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