import { openai } from './providers';
import { aiConfig } from './config';

export interface TranscriptionResult {
  text: string;
  segments?: TranscriptionSegment[];
  duration?: number;
  language?: string;
  confidence?: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  confidence?: number;
  speaker?: string;
}

export interface TranscriptionOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  includeSpeakerLabels?: boolean;
  includeTimestamps?: boolean;
}

export class TranscriptionService {
  async transcribeAudio(
    audioFile: File | Buffer,
    options: TranscriptionOptions = {}
  ): Promise<TranscriptionResult> {
    const {
      language = 'en',
      prompt,
      temperature = 0,
      includeTimestamps = true,
    } = options;

    try {
      // Convert File to Buffer if needed
      let audioBuffer: Buffer;
      if (audioFile instanceof File) {
        audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      } else {
        audioBuffer = audioFile;
      }

      // Create form data for OpenAI Whisper API
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('temperature', temperature.toString());
      
      if (prompt) {
        formData.append('prompt', prompt);
      }

      if (includeTimestamps) {
        formData.append('timestamp_granularities[]', 'segment');
      }

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiConfig.openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        text: result.text,
        segments: result.segments?.map((segment: any, index: number) => ({
          id: index,
          start: segment.start,
          end: segment.end,
          text: segment.text,
          confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : undefined,
        })),
        duration: result.segments ? result.segments[result.segments.length - 1]?.end : undefined,
        language: result.language,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  async translateAudio(
    audioFile: File | Buffer,
    targetLanguage: string = 'en'
  ): Promise<TranscriptionResult> {
    try {
      let audioBuffer: Buffer;
      if (audioFile instanceof File) {
        audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      } else {
        audioBuffer = audioFile;
      }

      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/translations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiConfig.openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        text: result.text,
        language: targetLanguage,
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw new Error('Failed to translate audio');
    }
  }

  async generateSummary(transcription: string, options: {
    style?: 'brief' | 'detailed' | 'action-items';
    includeTimestamps?: boolean;
    segments?: TranscriptionSegment[];
  } = {}): Promise<string> {
    const { style = 'detailed', includeTimestamps = false, segments } = options;

    let prompt = '';
    switch (style) {
      case 'brief':
        prompt = 'Provide a brief summary of the main points discussed in this meeting transcript:';
        break;
      case 'detailed':
        prompt = 'Provide a detailed summary of this meeting transcript, including key discussions, decisions, and important points:';
        break;
      case 'action-items':
        prompt = 'Extract action items, decisions, and next steps from this meeting transcript:';
        break;
    }

    let content = transcription;
    if (includeTimestamps && segments) {
      content = segments
        .map(segment => `[${this.formatTime(segment.start)}] ${segment.text}`)
        .join('\n');
    }

    const fullPrompt = `${prompt}\n\nTranscript:\n${content}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.3,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
  }

  async extractKeyPoints(transcription: string, maxPoints: number = 10): Promise<string[]> {
    const prompt = `Extract the top ${maxPoints} key points from this meeting transcript:

${transcription}

Return the key points as a numbered list.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content || '';
    
    // Parse numbered list into array
    return content
      .split('\n')
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(point => point.length > 0);
  }

  async identifySpeakers(
    segments: TranscriptionSegment[],
    speakerCount?: number
  ): Promise<TranscriptionSegment[]> {
    // This is a simplified speaker identification
    // In a real implementation, you'd use speaker diarization models
    
    if (!speakerCount || speakerCount <= 1) {
      return segments.map(segment => ({ ...segment, speaker: 'Speaker 1' }));
    }

    // Simple speaker assignment based on timing gaps
    let currentSpeaker = 1;
    let lastEndTime = 0;

    return segments.map(segment => {
      // If there's a significant gap, assume speaker change
      if (segment.start - lastEndTime > 2) {
        currentSpeaker = (currentSpeaker % speakerCount) + 1;
      }
      
      lastEndTime = segment.end;
      
      return {
        ...segment,
        speaker: `Speaker ${currentSpeaker}`,
      };
    });
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async createTranscriptSRT(segments: TranscriptionSegment[]): Promise<string> {
    return segments
      .map((segment, index) => {
        const startTime = this.formatSRTTime(segment.start);
        const endTime = this.formatSRTTime(segment.end);
        
        return `${index + 1}\n${startTime} --> ${endTime}\n${segment.text}\n`;
      })
      .join('\n');
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds
      .toString()
      .padStart(3, '0')}`;
  }
}

// Default transcription service instance
export const transcriptionService = new TranscriptionService();