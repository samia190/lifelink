// ===========================================
// LIFELINK - Blog Controller
// ===========================================

import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';
import { sendSuccess, sendPaginated } from '../utils/response';
import { NotFoundError } from '../utils/errors';

export class BlogController {
  // Create post
  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const post = await prisma.blogPost.create({
        data: {
          ...req.body,
          slug,
          author: req.user!.userId,
          publishedAt: req.body.isPublished ? new Date() : null,
        },
      });

      sendSuccess(res, post, 'Blog post created', 201);
    } catch (error) {
      next(error);
    }
  }

  // List posts (public)
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, category, tag } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const where: any = { isPublished: true };
      if (category) where.category = category;
      if (tag) where.tags = { has: tag };

      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true, title: true, slug: true, excerpt: true,
            featuredImage: true, author: true, category: true,
            tags: true, publishedAt: true, viewCount: true,
          },
        }),
        prisma.blogPost.count({ where }),
      ]);

      sendPaginated(res, posts, total, Number(page), Number(limit));
    } catch (error) {
      next(error);
    }
  }

  // Get post by slug (public)
  static async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const post = await prisma.blogPost.findUnique({
        where: { slug: req.params.slug },
      });

      if (!post || !post.isPublished) throw new NotFoundError('Blog post');

      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });

      sendSuccess(res, post);
    } catch (error) {
      next(error);
    }
  }

  // Update post
  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const post = await prisma.blogPost.update({
        where: { id: req.params.id },
        data: {
          ...req.body,
          publishedAt: req.body.isPublished ? new Date() : null,
        },
      });

      sendSuccess(res, post, 'Blog post updated');
    } catch (error) {
      next(error);
    }
  }

  // Delete post
  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await prisma.blogPost.delete({ where: { id: req.params.id } });
      sendSuccess(res, null, 'Blog post deleted');
    } catch (error) {
      next(error);
    }
  }
}
