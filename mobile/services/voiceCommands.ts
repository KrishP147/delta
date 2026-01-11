/**
 * Voice Command Service
 * 
 * Inspired by Saight project - enables hands-free interaction
 * with the TrueLight assistant through voice commands.
 * 
 * Features:
 * - Wake word detection ("Hey TrueLight" or "Sierra")
 * - Natural language command parsing
 * - Integration with AI assistant for complex queries
 */

import { speak, stopSpeaking } from './speech';

// Command types
export type VoiceCommandType = 
  | 'describe_scene'      // "What do you see?"
  | 'identify_object'     // "What is that?"
  | 'check_signal'        // "What color is the light?"
  | 'navigate'            // "Help me cross the street"
  | 'settings'            // "Change settings"
  | 'help'                // "What can you do?"
  | 'stop'                // "Stop" or "Quiet"
  | 'repeat'              // "Say that again"
  | 'question'            // General question for AI
  | 'unknown';

export interface VoiceCommand {
  type: VoiceCommandType;
  rawText: string;
  confidence: number;
  parameters?: Record<string, string>;
}

// Command patterns for matching
const COMMAND_PATTERNS: { pattern: RegExp; type: VoiceCommandType }[] = [
  // Scene description
  { pattern: /what (do you |can you )?see/i, type: 'describe_scene' },
  { pattern: /describe (the )?(scene|surroundings|environment)/i, type: 'describe_scene' },
  { pattern: /what('s| is) (around|ahead|in front)/i, type: 'describe_scene' },
  
  // Object identification
  { pattern: /what is (that|this)/i, type: 'identify_object' },
  { pattern: /identify (that|this|the)/i, type: 'identify_object' },
  { pattern: /what('s| is) (that|this) (thing|object)/i, type: 'identify_object' },
  
  // Traffic signal
  { pattern: /what color is the (light|signal)/i, type: 'check_signal' },
  { pattern: /is (it|the light) (red|green|yellow)/i, type: 'check_signal' },
  { pattern: /can i (go|cross|proceed)/i, type: 'check_signal' },
  { pattern: /should i stop/i, type: 'check_signal' },
  
  // Navigation
  { pattern: /help me (cross|navigate|find)/i, type: 'navigate' },
  { pattern: /where (is|are) (the|a)/i, type: 'navigate' },
  { pattern: /how do i get to/i, type: 'navigate' },
  
  // Settings
  { pattern: /change (the )?settings/i, type: 'settings' },
  { pattern: /open settings/i, type: 'settings' },
  { pattern: /(increase|decrease) (volume|speed)/i, type: 'settings' },
  
  // Help
  { pattern: /what can you do/i, type: 'help' },
  { pattern: /help( me)?$/i, type: 'help' },
  { pattern: /list commands/i, type: 'help' },
  
  // Control
  { pattern: /^(stop|quiet|silence|shut up)$/i, type: 'stop' },
  { pattern: /(say|repeat) (that|it) again/i, type: 'repeat' },
  { pattern: /^repeat$/i, type: 'repeat' },
];

// Wake words
const WAKE_WORDS = ['hey truelight', 'truelight', 'hey sierra', 'sierra', 'okay truelight'];

// Last spoken message for repeat functionality
let lastSpokenMessage = '';

/**
 * Parse voice input into a command
 */
export function parseVoiceCommand(text: string): VoiceCommand {
  const normalizedText = text.toLowerCase().trim();
  
  // Remove wake word if present
  let commandText = normalizedText;
  for (const wakeWord of WAKE_WORDS) {
    if (normalizedText.startsWith(wakeWord)) {
      commandText = normalizedText.slice(wakeWord.length).trim();
      break;
    }
  }
  
  // Try to match against known patterns
  for (const { pattern, type } of COMMAND_PATTERNS) {
    if (pattern.test(commandText)) {
      return {
        type,
        rawText: text,
        confidence: 0.9,
      };
    }
  }
  
  // If no pattern matched but it looks like a question, treat as AI question
  if (commandText.includes('?') || 
      commandText.startsWith('what') || 
      commandText.startsWith('how') ||
      commandText.startsWith('why') ||
      commandText.startsWith('where') ||
      commandText.startsWith('when') ||
      commandText.startsWith('who') ||
      commandText.startsWith('is ') ||
      commandText.startsWith('are ') ||
      commandText.startsWith('can ') ||
      commandText.startsWith('do ')) {
    return {
      type: 'question',
      rawText: text,
      confidence: 0.7,
      parameters: { question: commandText },
    };
  }
  
  return {
    type: 'unknown',
    rawText: text,
    confidence: 0.3,
  };
}

/**
 * Execute a voice command
 */
export async function executeVoiceCommand(
  command: VoiceCommand,
  context: {
    currentSignalState?: string;
    detectedObjects?: string[];
    colorblindType?: string;
    onDescribeScene?: () => Promise<string>;
    onAskQuestion?: (question: string) => Promise<string>;
    onNavigate?: () => void;
    onOpenSettings?: () => void;
  }
): Promise<string> {
  let response = '';
  
  switch (command.type) {
    case 'describe_scene':
      if (context.onDescribeScene) {
        response = await context.onDescribeScene();
      } else if (context.detectedObjects && context.detectedObjects.length > 0) {
        response = `I can see ${context.detectedObjects.join(', ')}.`;
      } else {
        response = 'I don\'t see any notable objects at the moment.';
      }
      break;
      
    case 'identify_object':
      if (context.detectedObjects && context.detectedObjects.length > 0) {
        response = `The main object I see is ${context.detectedObjects[0]}.`;
      } else {
        response = 'Point the camera at an object and ask again.';
      }
      break;
      
    case 'check_signal':
      if (context.currentSignalState && context.currentSignalState !== 'unknown') {
        const state = context.currentSignalState;
        if (state === 'red') {
          response = 'The light is red. Please stop and wait.';
        } else if (state === 'yellow') {
          response = 'The light is yellow. Prepare to stop.';
        } else if (state === 'green') {
          response = 'The light is green. You may proceed safely.';
        }
      } else {
        response = 'I don\'t see a traffic signal right now. Point your camera at one.';
      }
      break;
      
    case 'navigate':
      if (context.onNavigate) {
        context.onNavigate();
        response = 'Opening navigation assistance.';
      } else {
        response = 'Navigation assistance is not available yet.';
      }
      break;
      
    case 'settings':
      if (context.onOpenSettings) {
        context.onOpenSettings();
        response = 'Opening settings.';
      } else {
        response = 'Go back to the home screen to access settings.';
      }
      break;
      
    case 'help':
      response = 'You can ask me: What do you see? What color is the light? Can I cross? ' +
                 'What is that object? Help me navigate. Or ask any question.';
      break;
      
    case 'stop':
      await stopSpeaking();
      return ''; // Don't speak anything
      
    case 'repeat':
      if (lastSpokenMessage) {
        response = lastSpokenMessage;
      } else {
        response = 'I haven\'t said anything yet.';
      }
      break;
      
    case 'question':
      if (context.onAskQuestion && command.parameters?.question) {
        response = await context.onAskQuestion(command.parameters.question);
      } else {
        response = 'I\'m not able to answer questions right now.';
      }
      break;
      
    default:
      response = 'I didn\'t understand that. Say "help" to hear what I can do.';
  }
  
  // Speak and remember the response
  if (response) {
    lastSpokenMessage = response;
    await speak(response);
  }
  
  return response;
}

/**
 * Check if text contains a wake word
 */
export function containsWakeWord(text: string): boolean {
  const normalizedText = text.toLowerCase().trim();
  return WAKE_WORDS.some(wakeWord => normalizedText.includes(wakeWord));
}

/**
 * Get available commands list
 */
export function getAvailableCommands(): string[] {
  return [
    'What do you see?',
    'What color is the light?',
    'Can I cross?',
    'What is that?',
    'Help me navigate',
    'Open settings',
    'Say that again',
    'Stop',
  ];
}
