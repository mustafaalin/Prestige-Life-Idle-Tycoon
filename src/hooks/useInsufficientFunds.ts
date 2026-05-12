import { useState, useCallback } from 'react';
import type { FundsCurrency } from '../components/InsufficientFundsModal';

interface InsufficientFundsState {
  isOpen: boolean;
  currency: FundsCurrency;
  required: number;
  available: number;
  itemName?: string;
}

const CLOSED: InsufficientFundsState = {
  isOpen: false,
  currency: 'cash',
  required: 0,
  available: 0,
};

export function useInsufficientFunds() {
  const [state, setState] = useState<InsufficientFundsState>(CLOSED);

  const showInsufficientFunds = useCallback((params: {
    currency: FundsCurrency;
    required: number;
    available: number;
    itemName?: string;
  }) => {
    setState({ isOpen: true, ...params });
  }, []);

  const hideInsufficientFunds = useCallback(() => {
    setState(CLOSED);
  }, []);

  return { insufficientFundsState: state, showInsufficientFunds, hideInsufficientFunds };
}
