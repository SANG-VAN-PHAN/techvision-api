const mongoose = require('mongoose');

/**
 * MongoDB Connection với multiple fallbacks:
 * 1. Local MongoDB
 * 2. MongoDB Atlas (Cloud)
 * 3. In-Memory MongoDB (development)
 */

const connectDB = async () => {
    const options = {
        serverSelectionTimeoutMS: 3000,
        maxPoolSize: 10,
    };

    // Thử các connection theo thứ tự ưu tiên
    const connectionStrings = [
        // 1. Local MongoDB
        process.env.MONGODB_URI,
        // 2. Local default
        'mongodb://localhost:27017/techvision',
    ].filter(Boolean);

    for (let i = 0; i < connectionStrings.length; i++) {
        const uri = connectionStrings[i];
        const name = i === 0 ? 'Configured' : 'Local';

        try {
            console.log(`\n🔄 Thử kết nối ${name} MongoDB...`);
            const conn = await mongoose.connect(uri, options);

            console.log(`✅ Kết nối ${name} MongoDB thành công!`);
            console.log(`   Host: ${conn.connection.host}`);
            console.log(`   Port: ${conn.connection.port}`);
            console.log(`   Database: ${conn.connection.name}`);

            return conn;
        } catch (error) {
            console.error(`❌ ${name} thất bại:`, error.message.split(',')[0]);
            // Disconnect before trying next
            try { await mongoose.disconnect(); } catch(e) {}
        }
    }

    // Nếu tất cả fail, dùng in-memory MongoDB
    console.log('\n⚠️  Local MongoDB không có. Khởi động in-memory...');
    try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create({
            instance: { dbName: 'techvision' }
        });
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri, options);

        console.log(`✅ In-memory MongoDB đã sẵn sàng!`);
        console.log(`   (Dữ liệu sẽ mất khi restart server)`);

        return conn;
    } catch (error) {
        console.error('❌ Không thể khởi tạo database!');
        throw error;
    }
};

module.exports = connectDB;
