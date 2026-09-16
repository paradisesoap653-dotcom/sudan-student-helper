'use client';

import { useEffect, useState } from 'react';
const BUFFER_TOKEN_STORAGE = 'buffer-api-key';
const ADMIN_AUTH_KEY = 'marketing-agent-auth';

export default function MarketingAgentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [bufferKey, setBufferKey] = useState('');
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [appName, setAppName] = useState('مساعد الطلاب للشهادة السودانية');
  const [appFeatures, setAppFeatures] = useState('يعمل بدون نت، دروس وملخصات كل المواد، مساعد ذكاء اصطناعي، مجاني');
  const [postType, setPostType] = useState<'image' | 'reel'>('image');
  const [caption, setCaption] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [upcomingPosts, setUpcomingPosts] = useState<any[]>([]);

  // Load saved data from localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem(BUFFER_TOKEN_STORAGE);
    if (savedKey) setBufferKey(savedKey);
    const savedAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (savedAuth === 'authenticated') setIsAuthenticated(true);
    // Set default schedule time to tomorrow 8 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    setScheduledTime(tomorrow.toISOString().slice(0, 16));
  }, []);

  // Load channels when buffer key is present
  useEffect(() => {
    if (!bufferKey) return;
    localStorage.setItem(BUFFER_TOKEN_STORAGE, bufferKey);
    fetch('https://api.bufferapp.com/1/profiles.json', {
      headers: { Authorization: `Bearer ${bufferKey}` }
    })
      .then(res => res.json())
      .then(data => {
        setChannels(data);
        setSelectedChannels(data.map((ch: any) => ch.id)); // select all by default
        // Load upcoming posts
        return fetch(`https://api.bufferapp.com/1/updates/pending.json`, {
          headers: { Authorization: `Bearer ${bufferKey}` }
        });
      })
      .then(res => res.json())
      .then(data => setUpcomingPosts(data.updates || []))
      .catch(err => console.error('Failed to load channels', err));
  }, [bufferKey, isPublishing]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // كلمة المرور الافتراضية الاولى: sudan2026 يمكن تغييرها لاحقا
    if (authPassword === 'sudan2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      setAuthError('');
    } else {
      setAuthError('كلمة المرور غير صحيحة');
    }
  };

  const generateCaption = async () => {
    setIsGenerating(true);
    // في النسخة الاولى نستخدم قالب بسيط، لاحقا سنربطه بنموذج الذكاء الاصطناعي بتاعنا
    const generatedCaption = `🎓 ${appName}

✅ ${appFeatures.split(',').join('\n✅ ')}

التطبيق مجاني تماما، حملو الان من الرابط في اول تعليق وشاركو المنشور مع كل الاصدقاء 💙

#${appName.replace(/\s/g, '')} #تطبيقات_سودانية #سودان`;
    setCaption(generatedCaption);
    setIsGenerating(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption || selectedChannels.length === 0) {
      alert('رجاءا اكتب النص واختر المنصات');
      return;
    }
    setIsPublishing(true);
    setSuccessMessage('');
    try {
      for (const profileId of selectedChannels) {
        const formData = new URLSearchParams();
        formData.append('profile_ids', profileId);
        formData.append('text', caption);
        formData.append('scheduled_at', new Date(scheduledTime).toISOString());
        formData.append('shorten', 'false');
        await fetch('https://api.bufferapp.com/1/updates/create.json', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${bufferKey}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: formData
        });
      }
      setSuccessMessage('✅ تم جدولة المنشور بنجاح! سيتم نشره تلقائيا في الموعد المحدد');
      setCaption('');
      // Reload upcoming posts
      const res = await fetch(`https://api.bufferapp.com/1/updates/pending.json`, {
        headers: { Authorization: `Bearer ${bufferKey}` }
      });
      const data = await res.json();
      setUpcomingPosts(data.updates || []);
    } catch (err) {
      alert('حدث خطأ اثناء الجدولة، تأكد من مفتاح بافر');
      console.error(err);
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div dir="rtl" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginTop: 0 }}>🤖 وكيل الاعلانات الخاص</h2>
          <p style={{ color: '#cbd5e1', textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>ادخل كلمة المرور للدخول للوحة التحكم</p>
          <input
            type="password"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
            placeholder="كلمة المرور"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginBottom: '15px', fontSize: '16px', boxSizing: 'border-box' }}
          />
          {authError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: 0 }}>{authError}</p>}
          <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            دخول
          </button>
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '12px', marginTop: '15px', marginBottom: 0 }}>كلمة المرور الافتراضية: sudan2026</p>
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: '100dvh', backgroundColor: '#0f172a', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#fbbf24' }}>🤖 وكيل الاعلانات الآلي</h1>
        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '30px' }}>انشئ واجدول منشوراتك على جميع المنصات بنقرة واحدة</p>

        {!bufferKey ? (
          <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0 }}>🔑 اضف مفتاح بافر الخاص بك</h3>
            <input
              type="text"
              value={bufferKey}
              onChange={(e) => setBufferKey(e.target.value)}
              placeholder="الصق مفتاح Buffer API هنا"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        ) : (
          <>
            {successMessage && (
              <div style={{ backgroundColor: '#14532d', border: '1px solid #22c55e', color: '#bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
                {successMessage}
              </div>
            )}

            <form onSubmit={handlePublish} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اسم التطبيق</label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اهم مميزات التطبيق (مفصولة بفواصل)</label>
                <textarea
                  value={appFeatures}
                  onChange={(e) => setAppFeatures(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="radio" name="type" checked={postType === 'image'} onChange={() => setPostType('image')} />
                  بوست صورة
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="radio" name="type" checked={postType === 'reel'} onChange={() => setPostType('reel')} />
                  ريلز / فيديو
                </label>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <button type="button" onClick={generateCaption} disabled={isGenerating} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
                  {isGenerating ? '⏳ جاري انشاء النص...' : '✨ انشئ نص المنشور تلقائيا'}
                </button>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="نص المنشور / الكابشن"
                  rows={6}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>اختر المنصات للنشر</label>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  {channels.map(ch => (
                    <label key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedChannels.includes(ch.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedChannels([...selectedChannels, ch.id]);
                          else setSelectedChannels(selectedChannels.filter(id => id !== ch.id));
                        }}
                      />
                      {ch.service_formatted} ({ch.service_username})
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>موعد النشر</label>
                <input
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white' }}
                />
              </div>

              <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                {isPublishing ? '⏳ جاري الجدولة...' : '📅 جدول المنشور للنشر التلقائي'}
              </button>
            </form>

            {/* المنشورات القادمة */}
            <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h3 style={{ marginTop: 0 }}>📅 المنشورات المجدولة القادمة</h3>
              {upcomingPosts.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '20px' }}>لا توجد منشورات مجدولة حاليا</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingPosts.map(post => (
                    <div key={post.id} style={{ padding: '12px', backgroundColor: '#0f172a', borderRadius: '8px', border: '1px solid #334155' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                          {post.profile_service}
                        </span>
                        <span style={{ color: '#fbbf24', fontSize: '13px' }}>
                          🕒 {new Date(post.scheduled_at).toLocaleString('ar-SD')}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: '#e2e8f0', fontSize: '13px', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {post.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
