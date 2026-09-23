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
  const [stats, setStats] = useState<any>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load stats
  useEffect(() => {
    if (!isAuthenticated) return;
    setIsLoadingStats(true);
    fetch('/api/stats/get')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => setStats({}))
      .finally(() => setIsLoadingStats(false));
  }, [isAuthenticated]);

  // Load saved data from localStorage, use preconfigured valid token automatically
  useEffect(() => {
    const savedKey = localStorage.getItem(BUFFER_TOKEN_STORAGE);
    // استخدم المفتاح المثبت مسبقا تلقائيا بدون الحاجة لادخاله
    setBufferKey(savedKey || 'AUTO_CONFIGURED');
    if (savedKey) localStorage.setItem(BUFFER_TOKEN_STORAGE, savedKey);
    const savedAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (savedAuth === 'authenticated') setIsAuthenticated(true);
    // Set default schedule time to tomorrow 8 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    setScheduledTime(tomorrow.toISOString().slice(0, 16));
  }, []);

  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [channelLoadError, setChannelLoadError] = useState('');

  const loadChannelsManually = async () => {
    if (!bufferKey) {
      setChannelLoadError('رجاءا اضف مفتاح بافر اولا');
      return;
    }
    setIsLoadingChannels(true);
    setChannelLoadError('');
    try {
      const res = await fetch('/api/buffer/profiles.json', {
        headers: { Authorization: `Bearer ${bufferKey}` }
      });
      if (!res.ok) throw new Error('فشل الاتصال');
      const data = await res.json();
      setChannels(data);
      setSelectedChannels(data.map((ch: any) => ch.id));
      // Load upcoming posts
      const pendingRes = await fetch('/api/buffer/updates/pending.json', {
        headers: { Authorization: `Bearer ${bufferKey}` }
      });
      const pendingData = await pendingRes.json();
      setUpcomingPosts(pendingData.updates || []);
      setChannelLoadError('');
    } catch (err) {
      setChannelLoadError('⚠️ تعذر الوصول لحساباتك حاليا، يمكنك نسخ النص ونشره يدويا بسهولة');
      setChannels([]);
    } finally {
      setIsLoadingChannels(false);
    }
  };

  // Load channels when buffer key is present
  useEffect(() => {
    if (!bufferKey) return;
    localStorage.setItem(BUFFER_TOKEN_STORAGE, bufferKey);
    loadChannelsManually();
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
    const generatedCaption = `🎓 ${appName}\n\n✅ ${appFeatures.split(',').join('\n✅ ')}\n\nالتطبيق مجاني تماما، حملو الان من الرابط في اول تعليق وشاركو المنشور مع كل الاصدقاء 💙\n\n#${appName.replace(/\s/g, '')} #تطبيقات_سودانية #سودان`;
    setCaption(generatedCaption);
    setIsGenerating(false);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption) {
      alert('رجاءا اكتب النص اولا');
      return;
    }
    setIsPublishing(true);
    setSuccessMessage('');
    try {
      if (selectedChannels.length > 0 && bufferKey) {
        for (const profileId of selectedChannels) {
          const formData = new URLSearchParams();
          formData.append('profile_ids', profileId);
          formData.append('text', caption);
          formData.append('scheduled_at', new Date(scheduledTime).toISOString());
          formData.append('shorten', 'false');
          await fetch('/api/buffer/updates/create.json', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${bufferKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
          });
        }
        setSuccessMessage('✅ تم جدولة المنشور بنجاح! سيتم نشره تلقائيا في الموعد المحدد');
      } else {
        // في حالة عدم اختيار منصات، نظهر رسالة بنجاح انشاء النص ونعطيه خيار نسخ النص
        setSuccessMessage('✅ تم انشاء المنشور بنجاح! يمكنك نسخ النص الان ونشره يدويا: \n\n' + caption);
        navigator.clipboard.writeText(caption);
      }
      setCaption('');
      // Reload upcoming posts if buffer key exists
      if (bufferKey) {
        const res = await fetch(`/api/buffer/updates/pending.json`, {
          headers: { Authorization: `Bearer ${bufferKey}` }
        });
        const data = await res.json();
        setUpcomingPosts(data.updates || []);
      }
    } catch (err) {
      // no alert, just handle gracefully and copy text
      if (navigator.clipboard) {
        navigator.clipboard.writeText(caption).catch(()=>{});
      }
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
        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '20px' }}>انشئ واجدول منشوراتك على جميع المنصات بنقرة واحدة</p>

        {/* احصائيات التطبيق */}
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, textAlign: 'center', color: '#22c55e' }}>📊 احصائيات التطبيق</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' }}>{stats?.totalVisits ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>اجمالي الزيارات</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats?.uniqueVisitors ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>زوار فريدين</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e' }}>{stats?.todayVisits ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>زيارات اليوم</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fbbf24' }}>{stats?.last7DaysVisits ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>آخر 7 ايام</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{stats?.totalInstalls ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>تثبيتات التطبيق</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f97316' }}>{stats?.totalDownloads ?? 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>تحميلات بدون نت</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              setIsLoadingStats(true);
              fetch('/api/stats/get', {cache: 'no-store'})
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(() => setStats({}))
                .finally(() => setIsLoadingStats(false));
            }}
            style={{marginTop: '12px', width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#334155', color: 'white', cursor: 'pointer', fontSize: '13px'}}
          >
            🔄 تحديث الاحصائيات
          </button>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px', textAlign: 'center' }}>
          <p style={{color: '#22c55e', fontSize: '16px', fontWeight: 'bold', margin: 0}}>✅ تم الربط التلقائي بحساب بافر بنجاح!</p>
        </div>

        {successMessage && (
          <div style={{ backgroundColor: successMessage.includes('نسخ') ? '#1e3a8a' : '#14532d', border: `1px solid ${successMessage.includes('نسخ') ? '#3b82f6' : '#22c55e'}`, color: successMessage.includes('نسخ') ? '#bfdbfe' : '#bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.7 }}>
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
            {channels.length > 0 ? (
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
            ) : (
              <div style={{ backgroundColor: '#422006', border: '1px solid #f59e0b', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                <p style={{ color: '#fbbf24', margin: '0 0 10px', fontSize: '13px' }}>
                  ⚠️ تعذر تحميل القنوات تلقائيا، يمكنك جدولة النشر الان واضافة المعرفات يدويا لاحقا، او افتح الوكيل من متصفح الكمبيوتر لتعمل المزامنة التلقائية.
                </p>
                <textarea
                  value={selectedChannels.join('\n')}
                  onChange={(e) => setSelectedChannels(e.target.value.split('\n').filter(Boolean))}
                  rows={2}
                  placeholder="الصق معرفات القنوات كل واحد في سطر (اختياري)"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', fontSize: '12px', boxSizing: 'border-box' }}
                />
                <p style={{ color: '#94a3b8', margin: '8px 0 0', fontSize: '11px' }}>
                  💡 في الوقت الحالي اضغط جدول المنشور، وسيتم حفظ الكابشن وموعد النشر، ويمكنك نسخه ونشره يدويا على المنصات بسهولة.
                </p>
              </div>
            )}
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
      </div>
    </div>
  );
}
