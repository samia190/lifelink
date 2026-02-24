'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Sparkles, Loader2, Trash2, Edit, Eye, X } from 'lucide-react';
import { contentAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ContentTab() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '', status: 'DRAFT' });
  const [image, setImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = () => {
    contentAPI.listBlog().then(r => { setPosts(r.data?.data || []); setLoading(false); }).catch(() => setLoading(false));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('content', form.content);
      fd.append('status', form.status);
      if (form.tags) fd.append('tags', form.tags);
      if (image) fd.append('featuredImage', image);

      if (editingId) {
        await contentAPI.updateBlog(editingId, fd);
        toast.success('Post updated');
      } else {
        await contentAPI.createBlog(fd);
        toast.success('Post created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', content: '', tags: '', status: 'DRAFT' });
      setImage(null);
      loadPosts();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await contentAPI.deleteBlog(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed'); }
  };

  const handleEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      title: post.title || '',
      content: post.content || '',
      tags: (post.tags || []).join(', '),
      status: post.isPublished ? 'PUBLISHED' : 'DRAFT',
    });
    setShowForm(true);
  };

  const handleAIGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await contentAPI.generateContent({});
      setForm({
        title: data.data.title || '',
        content: data.data.content || '',
        tags: (data.data.tags || []).join(', '),
        status: 'DRAFT',
      });
      setEditingId(null);
      setShowForm(true);
      toast.success('AI content generated — review and edit');
    } catch (err: any) { toast.error(err.response?.data?.message || 'AI generation failed'); }
    setGenerating(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={28} className="text-gold-400 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Content Management</h2>
          <p className="text-sm text-navy-400 mt-1">{posts.length} blog posts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAIGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-violet-500/30 text-violet-400 text-sm font-semibold hover:bg-violet-500/10 transition-colors disabled:opacity-50">
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} AI Generate
          </button>
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ title: '', content: '', tags: '', status: 'DRAFT' }); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 text-sm font-semibold">
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      <div className="dash-card">
        {posts.length > 0 ? (
          <div className="space-y-3">
            {posts.map((post: any) => (
              <div key={post.id} className="flex items-center justify-between p-4 rounded-xl bg-navy-800/30 border border-navy-700/30 hover:border-navy-600/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{post.title}</p>
                  <p className="text-[11px] text-navy-500">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('en-KE') : ''} • {post.category || 'General'}
                    {post.viewCount ? ` • ${post.viewCount} views` : ''}
                    {post.tags?.length ? ` • ${post.tags.join(', ')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(post)} className="p-1.5 rounded-lg text-navy-400 hover:text-gold-400 hover:bg-gold-400/10 transition-colors" title="Edit"><Edit size={14} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg text-navy-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete"><Trash2 size={14} /></button>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ml-3 ${post.isPublished || post.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {post.isPublished || post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText size={32} className="text-navy-600 mx-auto mb-3" />
            <p className="text-navy-400">No blog posts yet</p>
            <p className="text-xs text-navy-500 mt-1">Create your first post or use AI to generate content</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg mx-4 bg-navy-800 border border-navy-700/50 rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editingId ? 'Edit Post' : 'New Blog Post'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg text-navy-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-6">
              <input type="text" placeholder="Post title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <textarea placeholder="Write your content..." rows={10} value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50 resize-none" />
              <input type="text" placeholder="Tags (comma separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400/50" />
              <div>
                <label className="block text-xs text-navy-400 mb-1.5">Featured Image</label>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} className="w-full text-sm text-navy-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-navy-700/50 file:text-navy-300 file:text-sm file:font-medium hover:file:bg-navy-600/50 file:cursor-pointer" />
              </div>
              <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-navy-900/50 border border-navy-700/30 text-sm text-white focus:outline-none focus:border-gold-400/50">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Publish Now</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-navy-700/50 text-navy-400 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title || !form.content} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-navy-900 font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? <Edit size={16} /> : <Plus size={16} />}
                {editingId ? 'Update' : form.status === 'PUBLISHED' ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
