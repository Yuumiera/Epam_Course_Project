const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadsDir = path.resolve(__dirname, '../../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const maxAttachmentSizeMbRaw = Number.parseInt(process.env.MAX_ATTACHMENT_SIZE_MB || '500', 10);
const maxAttachmentSizeMb = Number.isFinite(maxAttachmentSizeMbRaw) && maxAttachmentSizeMbRaw > 0 ? maxAttachmentSizeMbRaw : 500;
const maxAttachmentSizeBytes = maxAttachmentSizeMb * 1024 * 1024;

const allowedMimeTypes = new Set([
	'image/png',
	'image/jpeg',
	'application/pdf',
]);

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => cb(null, uploadsDir),
	filename: (_req, file, cb) => {
		const safeName = file.originalname.replace(/\s+/g, '_');
		cb(null, `${Date.now()}-${safeName}`);
	},
});

const upload = multer({
	storage,
	limits: {
		fileSize: maxAttachmentSizeBytes,
		files: 1,
	},
	fileFilter: (_req, file, cb) => {
		if (!allowedMimeTypes.has(file.mimetype)) {
			const error = new Error('Invalid attachment type');
			error.code = 'INVALID_FILE_TYPE';
			return cb(error);
		}

		return cb(null, true);
	},
});

function singleIdeaAttachment(req, res, next) {
	upload.single('attachment')(req, res, (error) => {
		if (!error) {
			return next();
		}

		if (error.code === 'LIMIT_FILE_SIZE') {
			return res.status(400).json({ error: 'Attachment too large' });
		}

		if (error.code === 'LIMIT_UNEXPECTED_FILE') {
			return res.status(400).json({ error: 'Only one attachment is allowed' });
		}

		if (error.code === 'INVALID_FILE_TYPE') {
			return res.status(400).json({ error: 'Invalid attachment type' });
		}

		return res.status(400).json({ error: 'Invalid attachment' });
	});
}

module.exports = {
	singleIdeaAttachment,
};
