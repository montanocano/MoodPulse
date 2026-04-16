import { useCallback } from "react";
import { useEmotionStore } from "../../../shared/ui/stores/useEmotionStore";
import { EmotionRecord, NewEmotionRecord } from "../../../types/emotion";

export interface UseEmotionReturn {
  todayRecord: EmotionRecord | null;
  records: EmotionRecord[];
  loading: boolean;
  error: string | null;
  loadRecords: (uid: string) => Promise<void>;
  saveRecord: (uid: string, data: NewEmotionRecord) => Promise<void>;
  updateRecord: (uid: string, date: string, data: Partial<NewEmotionRecord>) => Promise<void>;
  clearError: () => void;
}

/**
 * useEmotion — focused hook for emotion feature consumers.
 *
 * Selects state slices and wraps every action in useCallback so callers
 * receive stable function references across re-renders.
 */
export function useEmotion(): UseEmotionReturn {
  const todayRecord = useEmotionStore((s) => s.todayRecord);
  const records     = useEmotionStore((s) => s.records);
  const loading     = useEmotionStore((s) => s.loading);
  const error       = useEmotionStore((s) => s.error);

  const _loadRecords   = useEmotionStore((s) => s.loadRecords);
  const _saveRecord    = useEmotionStore((s) => s.saveRecord);
  const _updateRecord  = useEmotionStore((s) => s.updateRecord);
  const _clearError    = useEmotionStore((s) => s.clearError);

  const loadRecords  = useCallback(_loadRecords,  [_loadRecords]);
  const saveRecord   = useCallback(_saveRecord,   [_saveRecord]);
  const updateRecord = useCallback(_updateRecord, [_updateRecord]);
  const clearError   = useCallback(_clearError,   [_clearError]);

  return { todayRecord, records, loading, error, loadRecords, saveRecord, updateRecord, clearError };
}
