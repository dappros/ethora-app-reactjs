import { useCallback, useEffect, useState } from 'react';
import { isEqual } from 'lodash';
import { toast } from 'react-toastify';
import { AssistantAppearancePanel } from '../../AIWidget/AssistantAppearancePanel';
import { useTranslation } from '../../../i18n/useTranslation';
import {
  AiWidgetAppearance,
  defaultAiWidgetAppearance,
  loadStoredAgentAppearance,
  saveStoredAgentAppearance,
} from '../../../lib/aiWidgetAppearance';
import { ModelAgent } from '../../../models';

// Reuses the exact same form used for a single App's widget (see
// pages/AppSettings/AIWidget.tsx), scoped by agentId instead of appId - an
// Agent's own default look, independent of any one App's embed. The two
// are separate settings today (this one is NOT read when an App generates
// its embed snippet): an Agent can be embodied in several Apps at once
// (ChatsIndexPanel), so there is no single "the" embed to preview or copy
// code for here. Same not-yet-backend-persisted caveat as the App-level
// panel - see lib/aiWidgetAppearance.ts header.
export const AgentWidgetAppearancePanel: React.FC<{ agent: ModelAgent; isDisabled?: boolean }> = ({
  agent,
  isDisabled,
}) => {
  const { t } = useTranslation();
  const [appearance, setAppearance] = useState<AiWidgetAppearance>(() =>
    loadStoredAgentAppearance(agent.id)
  );
  const [savedAppearance, setSavedAppearance] = useState<AiWidgetAppearance>(appearance);

  useEffect(() => {
    const loaded = loadStoredAgentAppearance(agent.id);
    setAppearance(loaded);
    setSavedAppearance(loaded);
  }, [agent.id]);

  const handleChange = useCallback(
    (updates: Partial<AiWidgetAppearance>) => {
      if (isDisabled) return;
      setAppearance((prev) => ({ ...prev, ...updates }));
    },
    [isDisabled]
  );

  const handleSave = useCallback(() => {
    if (isDisabled) return;
    saveStoredAgentAppearance(agent.id, appearance);
    setSavedAppearance(appearance);
    toast.success(t('aiWidgetAppearance.saved'));
  }, [agent.id, appearance, isDisabled, t]);

  const handleReset = useCallback(() => {
    if (isDisabled) return;
    setAppearance(defaultAiWidgetAppearance);
  }, [isDisabled]);

  return (
    <AssistantAppearancePanel
      appearance={appearance}
      onChange={handleChange}
      onSave={handleSave}
      onReset={handleReset}
      isDirty={!isEqual(appearance, savedAppearance)}
    />
  );
};
