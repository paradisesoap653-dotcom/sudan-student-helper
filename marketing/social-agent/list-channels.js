const axios = require('axios');
require('dotenv').config();

const BUFFER_TOKEN = process.env.BUFFER_API_KEY;

if (!BUFFER_TOKEN || BUFFER_TOKEN === 'your-token-here') {
  console.error('❌ الرجاء وضع مفتاح Buffer الصحيح في ملف .env');
  process.exit(1);
}

async function listChannels() {
  try {
    const res = await axios.get('https://api.bufferapp.com/1/profiles.json', {
      headers: { Authorization: `Bearer ${BUFFER_TOKEN}` }
    });

    console.log('\n✅ القنوات المتصلة بحسابك: \n');
    res.data.forEach((ch, i) => {
      console.log(`${i+1}. 📢 ${ch.service_formatted} — ${ch.service_username}`);
      console.log(`   المعرف (ID): ${ch.id}`);
      console.log(`   جدول النشر: ${ch.schedules.length} مواعيد نشطة\n`);
    });
  } catch (err) {
    console.error('❌ خطأ في الاتصال ببافر:', err.response?.data || err.message);
  }
}

listChannels();
