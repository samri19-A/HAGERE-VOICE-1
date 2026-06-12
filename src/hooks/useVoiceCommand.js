import { useCallback, useEffect, useRef, useState } from 'react';
import { parseAmharicInventoryCommand } from '../lib/amharicParser';

const SpeechRecognition =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useVoiceCommand({ onCommand, onError }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setIsSupported(Boolean(SpeechRecognition));
  }, []);

  const processTranscript = useCallback(
    async (text) => {
      setTranscript(text);
      const parsed = parseAmharicInventoryCommand(text);

      if (parsed.error) {
        onError?.(parsed);
        return;
      }

      await onCommand?.(parsed, text);
    },
    [onCommand, onError]
  );

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.({ error: 'speech_not_supported' });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'am-ET';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }

      setInterimTranscript(interim);
      if (final) processTranscript(final.trim());
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error !== 'aborted') {
        onError?.({ error: event.error });
      }
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [onError, processTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const submitManual = useCallback(
    (text) => {
      processTranscript(text.trim());
    },
    [processTranscript]
  );

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    submitManual,
  };
}
