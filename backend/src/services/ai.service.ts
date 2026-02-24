// ===========================================
// LIFELINK - AI Service (Chat, Triage, Risk)
// ===========================================

import OpenAI from 'openai';
import config from '../config';
import logger from '../config/logger';
import prisma from '../config/database';
import { RiskAssessmentResult } from '../types';

// Crisis keywords for detection
const CRISIS_KEYWORDS = [
  'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
  'self-harm', 'self harm', 'cutting myself', 'hurt myself',
  'overdose', 'no reason to live', 'better off dead',
  'harming others', 'kill someone', 'violent thoughts',
  'abuse', 'being beaten', 'domestic violence',
  'hopeless', 'worthless', 'can\'t go on', 'give up',
  'kujiua', 'kufa', 'hataki kuishi', // Swahili crisis terms
];

const RISK_INDICATORS = {
  critical: ['suicide', 'suicidal', 'kill myself', 'end my life', 'overdose', 'kujiua'],
  high: ['self-harm', 'want to die', 'hurt myself', 'violent thoughts', 'domestic violence'],
  moderate: ['hopeless', 'worthless', 'can\'t go on', 'give up', 'abuse'],
  low: ['sad', 'anxious', 'stressed', 'worried', 'depressed', 'lonely'],
};

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: config.ai.apiKey });
  }

  // Main chat completion for mental health support
  async chat(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    conversationId?: string
  ): Promise<{ response: string; sentiment: number; riskFlags: string[] }> {
    try {
      const systemPrompt = this.getSystemPrompt();

      const completion = await this.openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
        ],
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      });

      const response = completion.choices[0]?.message?.content || 'I apologize, I couldn\'t generate a response. Please try again.';

      // Analyze the user's last message for risk
      const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const riskFlags = this.detectCrisisKeywords(lastUserMessage);
      const sentiment = await this.analyzeSentiment(lastUserMessage);

      return { response, sentiment, riskFlags };
    } catch (error) {
      logger.error('AI chat error:', error);
      return {
        response: 'I\'m here to help. If you\'re in crisis, please call our emergency hotline: ' + config.crisis.hotline,
        sentiment: 0,
        riskFlags: [],
      };
    }
  }

  // Intake recommendation engine
  async getServiceRecommendation(intakeData: Record<string, unknown>): Promise<{
    recommendations: string[];
    suggestedService: string;
    urgency: string;
    summary: string;
  }> {
    try {
      const prompt = `Based on the following intake assessment data, provide service recommendations for a mental health patient in Kenya. Format your response as JSON with keys: recommendations (array of strings), suggestedService (string), urgency (low/moderate/high/critical), summary (string).

Intake Data: ${JSON.stringify(intakeData)}

Consider services: Individual Therapy, Group Therapy, Psychiatric Consultation, Couples Therapy, Family Therapy, Corporate Wellness, Child Therapy, Addiction Counseling, Trauma Therapy, Crisis Intervention.`;

      const completion = await this.openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: 'system', content: 'You are a mental health triage assistant. Respond only with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.2,
      });

      const content = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      logger.error('Service recommendation error:', error);
      return {
        recommendations: ['Individual Therapy consultation recommended'],
        suggestedService: 'Individual Therapy',
        urgency: 'moderate',
        summary: 'Please consult with a specialist for a full assessment.',
      };
    }
  }

  // Risk scoring system
  async assessRisk(
    patientId: string,
    inputText: string,
    context?: string
  ): Promise<RiskAssessmentResult> {
    const riskFlags = this.detectCrisisKeywords(inputText);
    let score = 0;
    let level: RiskAssessmentResult['level'] = 'LOW';
    const recommendations: string[] = [];
    let requiresImmediate = false;

    // Score based on keyword analysis
    const lowerText = inputText.toLowerCase();

    for (const keyword of RISK_INDICATORS.critical) {
      if (lowerText.includes(keyword)) {
        score += 30;
        requiresImmediate = true;
      }
    }

    for (const keyword of RISK_INDICATORS.high) {
      if (lowerText.includes(keyword)) score += 20;
    }

    for (const keyword of RISK_INDICATORS.moderate) {
      if (lowerText.includes(keyword)) score += 10;
    }

    for (const keyword of RISK_INDICATORS.low) {
      if (lowerText.includes(keyword)) score += 5;
    }

    // Cap score at 100
    score = Math.min(score, 100);

    // Determine level
    if (score >= 70) {
      level = 'CRITICAL';
      recommendations.push('Immediate crisis intervention required');
      recommendations.push('Contact emergency services');
      recommendations.push('Schedule emergency appointment');
      requiresImmediate = true;
    } else if (score >= 40) {
      level = 'HIGH';
      recommendations.push('Urgent consultation recommended within 24 hours');
      recommendations.push('Increase session frequency');
      recommendations.push('Safety planning required');
    } else if (score >= 20) {
      level = 'MODERATE';
      recommendations.push('Schedule follow-up within the week');
      recommendations.push('Monitor symptoms closely');
    } else {
      level = 'LOW';
      recommendations.push('Continue regular sessions');
      recommendations.push('Self-care activities recommended');
    }

    // Create risk alert if high or critical
    if (level === 'HIGH' || level === 'CRITICAL') {
      try {
        await prisma.riskAlert.create({
          data: {
            patientId,
            alertType: requiresImmediate ? 'SUICIDE_RISK' : 'SEVERE_DISTRESS',
            riskLevel: level,
            description: `Risk assessment triggered. Score: ${score}. Flags: ${riskFlags.join(', ')}`,
            triggerSource: 'ai_assessment',
            triggerData: { inputText: inputText.substring(0, 500), score, riskFlags },
          },
        });

        // Update patient risk level
        await prisma.patient.update({
          where: { id: patientId },
          data: {
            riskLevel: level,
            riskScore: score,
            lastRiskAssessment: new Date(),
          },
        });
      } catch (error) {
        logger.error('Failed to create risk alert:', error);
      }
    }

    return { score, level, flags: riskFlags, recommendations, requiresImmediate };
  }

  // Generate AI summary for medical records
  async generateSessionSummary(sessionNotes: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    interventions?: string[];
  }): Promise<string> {
    try {
      const prompt = `Generate a concise clinical summary from these SOAP notes. Be professional, clear, and objective.

Subjective: ${sessionNotes.subjective || 'N/A'}
Objective: ${sessionNotes.objective || 'N/A'}
Assessment: ${sessionNotes.assessment || 'N/A'}
Plan: ${sessionNotes.plan || 'N/A'}
Interventions: ${sessionNotes.interventions?.join(', ') || 'N/A'}`;

      const completion = await this.openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: 'system', content: 'You are a clinical documentation assistant. Write concise, professional medical summaries.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || 'Summary could not be generated.';
    } catch (error) {
      logger.error('Session summary generation error:', error);
      return 'AI summary unavailable.';
    }
  }

  // Treatment progress analysis
  async analyzeProgress(patientId: string): Promise<string> {
    try {
      const records = await prisma.progressTracking.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
        take: 20,
      });

      if (records.length === 0) return 'Insufficient data for progress analysis.';

      const prompt = `Analyze the following patient progress data and provide a brief clinical summary of their trajectory. Data: ${JSON.stringify(records)}`;

      const completion = await this.openai.chat.completions.create({
        model: config.ai.model,
        messages: [
          { role: 'system', content: 'You are a clinical analytics assistant. Provide objective progress analysis.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 500,
        temperature: 0.2,
      });

      return completion.choices[0]?.message?.content || 'Analysis unavailable.';
    } catch (error) {
      logger.error('Progress analysis error:', error);
      return 'Progress analysis unavailable.';
    }
  }

  // Sentiment analysis
  private async analyzeSentiment(text: string): Promise<number> {
    // Quick sentiment scoring (-1 to 1)
    const negativeWords = ['sad', 'angry', 'depressed', 'anxious', 'scared', 'hopeless', 'pain', 'hurt', 'terrible', 'awful'];
    const positiveWords = ['happy', 'better', 'grateful', 'hopeful', 'improving', 'good', 'great', 'thank', 'progress'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (negativeWords.includes(word)) score -= 0.1;
      if (positiveWords.includes(word)) score += 0.1;
    });

    return Math.max(-1, Math.min(1, score));
  }

  // Crisis keyword detection
  detectCrisisKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    return CRISIS_KEYWORDS.filter(keyword => lowerText.includes(keyword));
  }

  private getSystemPrompt(): string {
    return `You are LifeLink AI, a compassionate and professional mental health support assistant for LifeLink Mental Medical Center in Nairobi, Kenya.

GUIDELINES:
- Be empathetic, warm, and culturally sensitive to Kenyan context
- Never provide medical diagnoses or prescribe medication
- Always recommend professional consultation for serious concerns
- If someone is in crisis, immediately provide the crisis hotline: ${config.crisis.hotline}
- Support both English and Swahili
- Maintain strict confidentiality
- Guide users towards booking appointments when appropriate
- Collect intake information naturally through conversation
- Assess mental health needs through thoughtful questions

SERVICES YOU CAN RECOMMEND:
- Individual Therapy
- Group Therapy
- Psychiatric Consultation
- Couples and Family Therapy
- Child & Adolescent Therapy
- Corporate Wellness Programs
- Addiction Counseling
- Trauma & PTSD Therapy
- Online/Telehealth Sessions

CRISIS PROTOCOL:
If you detect signs of suicide, self-harm, violence, or severe distress:
1. Acknowledge their feelings with compassion
2. Provide the crisis hotline number: ${config.crisis.hotline}
3. Encourage them to reach out to a trusted person
4. Suggest an emergency appointment
5. Never leave them without support resources

IMPORTANT DISCLAIMER:
You are an AI assistant, not a licensed therapist. Always clarify this when appropriate.`;
  }
}
