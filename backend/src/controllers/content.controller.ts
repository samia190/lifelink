// ===========================================
// LIFELINK - Content Management Controller
// Admin: blog CRUD, media upload, auto-generation
// ===========================================

import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AIService } from '../services/ai.service';
import logger from '../config/logger';

const aiService = new AIService();

export class ContentController {
  // ===== BLOG ADMIN (all posts including drafts) =====
  static async listAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, status } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);
      const where: any = {};
      if (status === 'published') where.isPublished = true;
      if (status === 'draft') where.isPublished = false;

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.blogPost.count({ where }),
      ]);
      sendPaginated(res, posts, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Create blog post (with optional featured image path)
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { title, content, excerpt, category, tags, isPublished, featuredImage } = req.body;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // If image was uploaded via multer, use its path
      const imagePath = (req as any).file
        ? `/uploads/${(req as any).file.filename}`
        : featuredImage || null;

      const post = await prisma.blogPost.create({
        data: {
          title,
          slug: `${slug}-${Date.now().toString(36)}`,
          content,
          excerpt: excerpt || content.substring(0, 160),
          category: category || 'Mental Health',
          tags: tags || [],
          isPublished: isPublished || false,
          publishedAt: isPublished ? new Date() : null,
          featuredImage: imagePath,
          author: req.user!.userId,
        },
      });
      sendSuccess(res, post, 'Blog post created', 201);
    } catch (error) {
      next(error);
    }
  }

  // Update blog post
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const existing = await prisma.blogPost.findUnique({ where: { id: req.params.id } });
      if (!existing) throw new NotFoundError('Blog post');

      const imagePath = (req as any).file
        ? `/uploads/${(req as any).file.filename}`
        : req.body.featuredImage ?? existing.featuredImage;

      const post = await prisma.blogPost.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          featuredImage: imagePath,
          publishedAt: req.body.isPublished ? (existing.publishedAt || new Date()) : null,
        },
      });
      sendSuccess(res, post, 'Blog post updated');
    } catch (error) {
      next(error);
    }
  }

  // Delete blog post
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.blogPost.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Blog post deleted');
    } catch (error) {
      next(error);
    }
  }

  // ===== MEDIA UPLOAD =====
  static async uploadMedia(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const files = (req as any).files || [(req as any).file].filter(Boolean);
      const urls = files.map((f: any) => ({
        url: `/uploads/${f.filename}`,
        name: f.originalname,
        size: f.size,
        type: f.mimetype,
      }));
      sendSuccess(res, urls, `${urls.length} file(s) uploaded`);
    } catch (error) {
      next(error);
    }
  }

  // ===== AI CONTENT GENERATION =====
  static async generateContent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { topic, category } = req.body;
      const prompt = topic
        || `Write a helpful mental health blog post relevant to Kenyan audiences`;

      const article = await ContentController.generateArticle(prompt, category || 'Mental Health');
      sendSuccess(res, article, 'Content generated');
    } catch (error) {
      next(error);
    }
  }

  // Shared generation logic (used by cron too)
  static async generateArticle(
    topic: string,
    category: string,
  ): Promise<{ title: string; content: string; excerpt: string; tags: string[] }> {
    try {
      const openai = (aiService as any).openai;
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a content writer for LifeLink Mental Wellness Solution in Nairobi, Kenya. Write professional, SEO-friendly mental health blog posts. Output ONLY valid JSON with keys: title (string), content (full HTML article body, 600-1000 words with paragraphs, headings, lists), excerpt (1-2 sentences), tags (array of 3-5 keyword strings).`,
          },
          { role: 'user', content: `Write a blog post about: ${topic}. Category: ${category}. Make it informative, culturally relevant to Kenya, and helpful.` },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content || '{}';
      // Strip markdown fences if present
      const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch (error) {
      logger.error('AI content generation failed:', error);
      return {
        title: 'Mental Health Awareness',
        content: '<p>Content generation is temporarily unavailable. Please try again later.</p>',
        excerpt: 'Content generation is temporarily unavailable.',
        tags: ['mental-health'],
      };
    }
  }

  // Auto-publish generated content (used by cron)
  static async autoGenerateAndSave(): Promise<void> {
    const topics = [
      'Managing workplace stress in Nairobi',
      'Understanding anxiety disorders and coping strategies',
      'Benefits of therapy for young professionals in Kenya',
      'How to support a loved one with depression',
      'Building mental resilience in challenging times',
      'Sleep hygiene tips for better mental health',
      'Navigating grief and loss in African cultures',
      'Social media and mental health for Kenyan youth',
      'Mindfulness and meditation for beginners',
      'Breaking the stigma around mental health in Kenya',
    ];

    const topic = topics[Math.floor(Math.random() * topics.length)];
    const article = await ContentController.generateArticle(topic, 'Mental Health');

    const slug = article.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await prisma.blogPost.create({
      data: {
        title: article.title,
        slug: `${slug}-${Date.now().toString(36)}`,
        content: article.content,
        excerpt: article.excerpt,
        category: 'Mental Health',
        tags: article.tags,
        isPublished: false, // Save as draft for admin review
        author: 'system',
        featuredImage: null,
      },
    });

    logger.info(`Auto-generated blog draft: "${article.title}"`);
  }
}
