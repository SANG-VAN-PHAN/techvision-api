/**
 * Test MongoDB Connection
 * Chạy: node test-db.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    console.log('\n🧪 Testing MongoDB Connection...\n');

    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/techvision';
    console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

    try {
        console.log('\n⏳ Connecting...');
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log('\n✅ KẾT NỐI THÀNH CÔNG!');
        console.log('   Host:', conn.connection.host);
        console.log('   Port:', conn.connection.port);
        console.log('   Database:', conn.connection.name);
        console.log('   Ready State:', conn.connection.readyState);

        // Test write
        console.log('\n📝 Testing write...');
        const TestModel = mongoose.model('Test', new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        }));

        const doc = await TestModel.create({ name: 'Test Document' });
        console.log('   ✅ Document created:', doc._id);

        // Test read
        console.log('\n📖 Testing read...');
        const found = await TestModel.findById(doc._id);
        console.log('   ✅ Document found:', found.name);

        // Cleanup
        await TestModel.deleteMany({});
        console.log('\n🧹 Cleanup done');

        await mongoose.disconnect();
        console.log('\n🎉 All tests passed!\n');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ KẾT NỐI THẤT BẠI!');
        console.error('   Error:', error.message);
        console.log('\n💡 Gợi ý:');
        console.log('   1. Tạo MongoDB Atlas miễn phí: https://www.mongodb.com/cloud/atlas');
        console.log('   2. Hoặc cài MongoDB local: https://www.mongodb.com/try/download/community');
        console.log('   3. Cập nhật MONGODB_URI trong file .env\n');
        process.exit(1);
    }
}

testConnection();
