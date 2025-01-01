const express = require('express');
const router = express.Router();
const { Parser } = require('json2csv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Item = require('../models/item');


// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });



// Display form and all items
router.get('/', async (req, res) => {
    try {
        const items = await Item.find();
        let errorMessage = null;
        if (items.length === 0) {
            errorMessage = 'NoOne Student Register YET!.';
        }
        res.render('form', { items, itemToUpdate: null, errorMessage });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving items'); // Send a 500 status code for server errors
    }
});

// Handle form submission
router.post('/add', upload.single('image'), async (req, res) => {
    const { name, roll, classname, email, contact } = req.body;
    const image = req.file ? req.file.filename : null;
    const newItem = new Item({ name, roll, classname, email, contact, image });

    try {
        await newItem.save();
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error saving item');
    }
});

// Handle delete request
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Item.findByIdAndDelete(id);
        if (item && item.image) {
            fs.unlink(path.join(__dirname, '../public/images/', item.image), (err) => {
                if (err) console.error('Error deleting image file:', err);
            });
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting item');
    }
});

// Display Update form with items
router.get('/update/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const item = await Item.findById(id);
        const items = await Item.find();
        if (!item) {
            return res.status(404).send('Item not found');
        }
        res.render('form', { items, itemToUpdate: item, errorMessage: null });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving item');
    }
});

/// Handle Update form submission
router.post('/update/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { name, roll, classname, email, contact } = req.body;
    const image = req.file ? req.file.filename : undefined;

    try {
        const item = await Item.findById(id);
        if (!item) {
            return res.status(404).send('Item not found');
        }

        // If a new image is uploaded, delete the old image file
        if (image && item.image) {
            fs.unlink(path.join(__dirname, '../public/images/', item.image), (err) => {
                if (err) console.error('Error deleting old image file:', err);
            });
        }

        const updateData = { name, roll, classname, email, contact };
        if (image) {
            updateData.image = image;
        }

        await Item.findByIdAndUpdate(id, updateData);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating item');
    }
});


// Download CSV
router.get('/download/csv', async (req, res) => {
    try {
        const items = await Item.find().lean().exec();
        const fields = ['name', 'roll', 'class', 'email', 'contact'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(items);
        
        const date = new Date();
        const timestamp = date.toISOString().replace(/[-T:\.Z]/g, '');
        const fileName = `${timestamp}.csv`;

        const filePath = path.join('C:','Users','akash', 'Downloads', fileName);
        fs.writeFileSync(filePath, csv);

        res.download(filePath, fileName, (err)=>{
            if (err) {
                console.error('Error downloading the file:', err);
            }
        });
        // res.header('Content-Type', 'text/csv');
        // res.attachment(fileName);
        // res.send(csv);

    } catch (err) {
        console.error(err);
        const items = await Item.find();
        res.render('form', { items, itemToUpdate: null, errorMessage: 'Error generating CSV' });
    }
});

module.exports = router;
