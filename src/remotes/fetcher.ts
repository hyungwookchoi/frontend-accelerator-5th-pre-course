import { http } from 'tosslib';

interface SavingsProduct {
  id: string;
  name: string;
  annualRate: number;
  minMonthlyAmount: number;
  maxMonthlyAmount: number;
  availableTerms: number;
}

type GetSavingsProductsResponse = SavingsProduct[];

export const getSavingsProducts = () => {
  return http.get<GetSavingsProductsResponse>('/api/savings-products');
};
