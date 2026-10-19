/**
 * Post Routes - Blog/Tin tức
 */
const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { auth, adminOnly, staffOnly, asyncHandler } = require('../middleware/auth');

// GET /api/posts - Public: chỉ bài published
router.get('/', asyncHandler(async (req, res) => {
    const filter = { status: 'published' };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.tag) filter.tags = req.query.tag;
    if (req.query.q) filter.$text = { $search: req.query.q };

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        Post.find(filter)
            .populate('author', 'fullName avatar')
            .select('-content') // list không trả content đầy đủ
            .sort({ publishedAt: -1 })
            .skip(skip)
            .limit(limit),
        Post.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: { posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
}));

// GET /api/posts/:slug - Public: chi tiết
router.get('/:slug', asyncHandler(async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug, status: 'published' })
        .populate('author', 'fullName avatar')
        .populate('relatedProducts', 'name slug thumbnail price');

    if (!post) return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });

    // Tăng view
    post.viewCount += 1;
    await post.save();

    res.json({ status: 'success', data: { post } });
}));

// GET /api/posts/admin/all - Staff/Admin: lấy cả draft
router.get('/admin/all', staffOnly, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.author) filter.author = req.query.author;

    const posts = await Post.find(filter)
        .populate('author', 'fullName')
        .sort({ createdAt: -1 });

    res.json({ status: 'success', data: { posts } });
}));

// POST /api/posts - Staff/Admin tạo
router.post('/', staffOnly, asyncHandler(async (req, res) => {
    const post = await Post.create({
        ...req.body,
        author: req.user._id
    });
    res.status(201).json({ status: 'success', message: 'Tạo bài viết thành công!', data: { post } });
}));

// PUT /api/posts/:id
router.put('/:id', staffOnly, asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });
    res.json({ status: 'success', message: 'Cập nhật thành công!', data: { post } });
}));

// DELETE /api/posts/:id
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ status: 'fail', message: 'Bài viết không tồn tại!' });
    res.json({ status: 'success', message: 'Xóa bài viết thành công!' });
}));

module.exports = router;
