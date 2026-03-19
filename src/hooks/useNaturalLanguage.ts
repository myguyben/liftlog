import { useState, useCallback } from 'react';
import { parseExerciseInput, type ParsedExercise } from '../utils/parser';

export function useNaturalLanguage() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedExercise | null>(null);

  const updateInput = useCallback((value: string) => {
    setInput(value);
    if (value.trim()) {
      setParsed(parseExerciseInput(value));
    } else {
      setParsed(null);
    }
  }, []);

  const clear = useCallback(() => {
    setInput('');
    setParsed(null);
  }, []);

  return { input, parsed, updateInput, clear };
}
