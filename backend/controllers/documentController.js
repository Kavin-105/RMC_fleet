const Document = require('../models/Document');

// @desc    Get all documents
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
    try {
        const { vehicleId, type, status } = req.query;
        let query = { owner: req.user.id };

        if (vehicleId) {
            query.vehicle = vehicleId;
        }

        if (type) {
            query.type = type;
        }

        if (status) {
            query.status = status;
        }

        const documents = await Document.find(query)
            .populate('vehicle', 'vehicleNumber model')
            .sort({ expiryDate: 1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get single document
// @route   GET /api/documents/:id
exports.getDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('vehicle', 'vehicleNumber model');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Create document
// @route   POST /api/documents
exports.createDocument = async (req, res) => {
    try {
        req.body.owner = req.user.id;
        
        // If file was uploaded, convert to Base64 and save in DB
        if (req.file) {
            req.body.fileName = req.file.originalname;
            req.body.fileData = req.file.buffer.toString('base64');
            req.body.fileContentType = req.file.mimetype;
        }
        
        const document = await Document.create(req.body);

        const populatedDoc = await Document.findById(document._id)
            .populate('vehicle', 'vehicleNumber model');

        res.status(201).json({
            success: true,
            data: populatedDoc
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Update document
// @route   PUT /api/documents/:id
exports.updateDocument = async (req, res) => {
    try {
        let document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this document'
            });
        }

        // If new file was uploaded, convert to Base64 and save in DB
        if (req.file) {
            req.body.fileName = req.file.originalname;
            req.body.fileData = req.file.buffer.toString('base64');
            req.body.fileContentType = req.file.mimetype;
        }

        document = await Document.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        }).populate('vehicle', 'vehicleNumber model');

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (document.owner.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this document'
            });
        }

        await document.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get expiring documents
// @route   GET /api/documents/expiring
exports.getExpiringDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            owner: req.user.id,
            status: { $in: ['Expiring', 'Expired'] }
        })
            .populate('vehicle', 'vehicleNumber model')
            .sort({ expiryDate: 1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// @desc    Get document file
// @route   GET /api/documents/:id/file
exports.getDocumentFile = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        if (!document.fileData) {
            return res.status(404).json({
                success: false,
                message: 'No file attached to this document'
            });
        }

        // Convert Base64 back to buffer
        const fileBuffer = Buffer.from(document.fileData, 'base64');

        // Set appropriate headers
        res.set({
            'Content-Type': document.fileContentType,
            'Content-Disposition': `inline; filename="${document.fileName}"`,
            'Content-Length': fileBuffer.length
        });

        res.send(fileBuffer);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
