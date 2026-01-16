'use client';

import React, { useState, useCallback } from 'react';
import { WizardStepper } from './WizardStepper';
import { ChainStep } from './steps/ChainStep';
import { NameStep } from './steps/NameStep';
import { SeedPhraseStep } from './steps/SeedPhraseStep';
import { FundStep } from './steps/FundStep';
import { ConfigureStep } from './steps/ConfigureStep';
import { DeployStep } from './steps/DeployStep';
import {
  WizardStep,
  BotChain,
  BotMode,
  FormData,
  WalletInfo,
  DeploymentResult
} from './types';
import { getNativeCurrency, getDefaultReserve, getTradeSizeLimits } from '@/lib/chainTokens';

interface CreateAgentWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

const MIN_FUND_AMOUNTS: Record<BotChain, number> = {
  cardano: 50,
  solana: 0.1,
  base: 0.01
};

export function CreateAgentWizard({ onComplete, onCancel }: CreateAgentWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('chain');

  // Form data
  const [formData, setFormData] = useState<FormData>({
    botChain: 'cardano',
    botName: '',
    botMode: 'standard',
    targets: [{ token: 'ADA', percentage: 50 }],
    tolerance: 0.05,
    minTradeSize: 10,
    maxTradeSize: 100,
    minAdaReserve: 50,
    paperTrading: true
  });

  // Wallet state
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    address: '',
    seedPhrase: ''
  });
  const [balance, setBalance] = useState(0);
  const [funded, setFunded] = useState(false);
  const [seedConfirmed, setSeedConfirmed] = useState(false);

  // Loading states
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);

  // Update form data
  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Chain change handler - reset wallet when chain changes
  const handleChainChange = useCallback((chain: BotChain) => {
    const limits = getTradeSizeLimits(chain);
    updateFormData({
      botChain: chain,
      minTradeSize: limits.min,
      maxTradeSize: limits.max,
      minAdaReserve: getDefaultReserve(chain),
      targets: [{ token: getNativeCurrency(chain), percentage: 50 }]
    });
    // Reset wallet if chain changes
    setWalletInfo({ address: '', seedPhrase: '' });
    setBalance(0);
    setFunded(false);
    setSeedConfirmed(false);
  }, [updateFormData]);

  // Create wallet
  const createWallet = useCallback(async () => {
    setIsCreatingWallet(true);
    try {
      const response = await fetch('/api/bot/create-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain: formData.botChain })
      });

      if (!response.ok) throw new Error('Failed to create wallet');

      const data = await response.json();
      setWalletInfo({
        address: data.address,
        seedPhrase: data.seedPhrase || data.mnemonic
      });
      setCurrentStep('seedphrase');
    } catch (error) {
      console.error('Wallet creation failed:', error);
      // TODO: Show error toast
    } finally {
      setIsCreatingWallet(false);
    }
  }, [formData.botChain]);

  // Check balance
  const checkBalance = useCallback(async () => {
    if (!walletInfo.address) return;

    setIsCheckingBalance(true);
    try {
      const response = await fetch(`/api/bot/balance?address=${walletInfo.address}&chain=${formData.botChain}`);
      if (!response.ok) throw new Error('Failed to check balance');

      const data = await response.json();
      const newBalance = data.balance || 0;
      setBalance(newBalance);
      setFunded(newBalance >= MIN_FUND_AMOUNTS[formData.botChain]);
    } catch (error) {
      console.error('Balance check failed:', error);
    } finally {
      setIsCheckingBalance(false);
    }
  }, [walletInfo.address, formData.botChain]);

  // Deploy agent
  const deployAgent = useCallback(async () => {
    setIsDeploying(true);
    setDeploymentResult(null);

    try {
      const payload = {
        name: formData.botName,
        chain: formData.botChain,
        mode: formData.botMode,
        walletAddress: walletInfo.address,
        targets: formData.targets,
        tolerance: formData.tolerance,
        minTradeSize: formData.minTradeSize,
        maxTradeSize: formData.maxTradeSize,
        minReserve: formData.minAdaReserve,
        paperTrading: formData.paperTrading,
        tModeMinMcap: formData.tModeMinMcap
      };

      const response = await fetch('/api/bot/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setDeploymentResult({ success: false, error: data.error || 'Deployment failed' });
      } else {
        setDeploymentResult({ success: true, agentId: data.agentId });
      }
    } catch (error) {
      setDeploymentResult({ success: false, error: 'Network error during deployment' });
    } finally {
      setIsDeploying(false);
    }
  }, [formData, walletInfo.address]);

  // Navigation
  const goToStep = (step: WizardStep) => setCurrentStep(step);

  const handleNameNext = () => {
    createWallet();
  };

  const handleSeedConfirm = () => {
    setCurrentStep('fund');
  };

  const handleFundNext = () => {
    setCurrentStep('configure');
  };

  const handleConfigureNext = () => {
    setCurrentStep('deploy');
  };

  // Track completed steps for stepper
  const getCompletedSteps = (): WizardStep[] => {
    const stepOrder: WizardStep[] = ['chain', 'name', 'seedphrase', 'fund', 'configure', 'deploy'];
    const currentIndex = stepOrder.indexOf(currentStep);
    return stepOrder.slice(0, currentIndex);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <WizardStepper
        currentStep={currentStep}
        completedSteps={getCompletedSteps()}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        {currentStep === 'chain' && (
          <ChainStep
            selectedChain={formData.botChain}
            onChainSelect={handleChainChange}
            onNext={() => goToStep('name')}
          />
        )}

        {currentStep === 'name' && (
          <NameStep
            botName={formData.botName}
            onNameChange={(name) => updateFormData({ botName: name })}
            botMode={formData.botMode}
            onModeChange={(mode) => updateFormData({ botMode: mode })}
            onNext={handleNameNext}
            onBack={() => goToStep('chain')}
            isCreatingWallet={isCreatingWallet}
          />
        )}

        {currentStep === 'seedphrase' && (
          <SeedPhraseStep
            seedPhrase={walletInfo.seedPhrase}
            address={walletInfo.address}
            botName={formData.botName}
            onConfirm={handleSeedConfirm}
            confirmed={seedConfirmed}
            setConfirmed={setSeedConfirmed}
          />
        )}

        {currentStep === 'fund' && (
          <FundStep
            address={walletInfo.address}
            chain={formData.botChain}
            balance={balance}
            funded={funded}
            checking={isCheckingBalance}
            onCheckBalance={checkBalance}
            onNext={handleFundNext}
            onBack={() => goToStep('seedphrase')}
          />
        )}

        {currentStep === 'configure' && (
          <ConfigureStep
            formData={formData}
            onUpdate={updateFormData}
            onNext={handleConfigureNext}
            onBack={() => goToStep('fund')}
          />
        )}

        {currentStep === 'deploy' && (
          <DeployStep
            formData={formData}
            walletInfo={walletInfo}
            balance={balance}
            deploymentResult={deploymentResult}
            isDeploying={isDeploying}
            onDeploy={deployAgent}
            onBack={() => goToStep('configure')}
            onComplete={onComplete}
          />
        )}
      </div>
    </div>
  );
}
