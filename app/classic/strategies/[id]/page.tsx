'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { StrategyDetailPage } from '../../views/StrategyDetailPage';

export default function StrategyPage() {
  const params = useParams();
  const id = params.id as string;

  return <StrategyDetailPage strategyId={id} />;
}
