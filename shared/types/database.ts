export type CardContext = 'employed' | 'jobSeeker';

export interface EmployedCardFields {
  context: 'employed';
  companyName: string;
  fullName: string;
  jobTitle: string;
  department: string;
  location: string;
  phone: string;
  email: string;
}

export interface JobSeekerCardFields {
  context: 'jobSeeker';
  headline: string;
  fullName: string;
  targetRole: string;
  education: string;
  location: string;
  phone: string;
  email: string;
}

export type CardFields = EmployedCardFields | JobSeekerCardFields;

export interface Link {
  id: string;
  platform: string;
  url: string;
  isActive: boolean;
}

export type CardMaterialId = 'bone' | 'silianRail';

export interface Card {
  fields: CardFields;
  links: Link[];
  materialId: CardMaterialId;
}
