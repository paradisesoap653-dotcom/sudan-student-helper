const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BUFFER_TOKEN = process.env.BUFFER_API_KEY;
const POST_IMAGE_PATH = path.join(__dirname, '../ad-poster-student-helper.jpg');

const POST_CAPTION = `🎓 طلاب الشهادة السودانية! اخيرًا جابنا لكم التطبيق اللي كنتو بتنتظروه!

✅ كل الدروس والملخصات وبنوك الاسئلة لجميع المواد (شاملة المنهج الجديد)
✅ ✅ يعمل 100% بدون انترنت! حمل الدرس مرة وذاكر في اي مكان حتى لو النت مقطوع
✅ مساعد ذكاء اصطناعي يسأله اي سؤال صعب وهو يشرحلك خطوة بخطوة
✅ مجاني تماماً — بلا اشتراكات شهرية، بلا اعلانات مزعجة

كل اللي عليك تحمل التطبيق الان من الرابط الموجود في اول تعليق، وابدأ مذاكرتك من دلوقتي ووفقك الله جميعا في الامتحانات 🤲

شارك المنشور ده مع اصحابك الطلاب عشان يستفيدو كلهم 💙

#الشهادة_السودانية #تطبيقات_سودانية #مساعد_الطلاب #مذاكرة #امتحانات_السودان #تعليم
`;

if (!BUFFER_TOKEN || BUFFER_TOKEN === 'your-token-here') {
  console.error('❌ الرجاء وضع مفتاح Buffer الصحيح في ملف .env');
  process.exit(1);
}

async function uploadImage() {
  console.log('📤 جاري رفع الصورة...');
  const form = new FormData();
  form.append('file', fs.createReadStream(POST_IMAGE_PATH));

  const res = await axios.post('https://api.bufferapp.com/1/images/create.json', form, {
    headers: {
      Authorization: `Bearer ${BUFFER_TOKEN}`,
      ...form.getHeaders()
    }
  });
  console.log(`✅ تم رفع الصورة بنجاح، معرف الصورة: ${res.data.attachment_id}`);
  return res.data.attachment_id;
}

async function publishToAllChannels(attachmentId) {
  const profilesRes = await axios.get('https://api.bufferapp.com/1/profiles.json', {
    headers: { Authorization: `Bearer ${BUFFER_TOKEN}` }
  });

  const channels = profilesRes.data;
  console.log(`\n📡 وجدت ${channels.length} قنوات متصلة، جاري جدولة النشر...\n`);

  for (const ch of channels) {
    try {
      await axios.post(
        'https://api.bufferapp.com/1/updates/create.json',
        new URLSearchParams({
          profile_ids: ch.id,
          text: POST_CAPTION,
          media: JSON.stringify({ attachment: { attachment_id: attachmentId } }),
          scheduled_at: new Date(Date.now() + 1000 * 60 * 5).toISOString(), // ينشر بعد 5 دقائق
          shorten: 'false'
        }),
        {
          headers: {
            Authorization: `Bearer ${BUFFER_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      console.log(`✅ تم جدولة المنشور بنجاح على: ${ch.service_formatted} — ${ch.service_username}`);
    } catch (err) {
      console.log(`❌ فشل النشر على ${ch.service_formatted}:`, err.response?.data?.message || err.message);
    }
  }
}

(async () => {
  try {
    const attachmentId = await uploadImage();
    await publishToAllChannels(attachmentId);
    console.log('\n🎉 تم بنجاح! المنشور سوف يظهر على منصاتك خلال 5 دقائق');
  } catch (err) {
    console.error('\n❌ حدث خطأ:', err.response?.data || err.message);
  }
})();
