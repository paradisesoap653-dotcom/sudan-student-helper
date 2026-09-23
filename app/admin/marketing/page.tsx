'use client';

import { useEffect, useState } from 'react';
const ADMIN_AUTH_KEY = 'marketing-agent-auth';

export default function MarketingAgentPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [appName, setAppName] = useState('مساعد الطلاب للشهادة السودانية');
  const [appFeatures, setAppFeatures] = useState('يعمل بدون نت، دروس وملخصات كل المواد، مساعد ذكاء اصطناعي، مجاني');
  const [postType, setPostType] = useState<'image' | 'reel'>('image');
  const [caption, setCaption] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [stats, setStats] = useState<any>({totalVisits:0, uniqueVisitors:0, todayVisits:0, last7DaysVisits:0, totalInstalls:0, totalDownloads:0});

  function refreshStats() {
    fetch('/api/stats/get', {cache: 'no-store'})
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {});
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshStats();
    const timer = setInterval(refreshStats, 30000);
    return () => clearInterval(timer);
  }, [isAuthenticated]);

  useEffect(() => {
    const savedAuth = sessionStorage.getItem(ADMIN_AUTH_KEY);
    if (savedAuth === 'authenticated') setIsAuthenticated(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(20, 0, 0, 0);
    setScheduledTime(tomorrow.toISOString().slice(0, 16));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (authPassword === 'sudan2026') {
      setIsAuthenticated(true);
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      setAuthError('');
    } else {
      setAuthError('كلمة المرور غير صحيحة');
    }
  };

  const generateCaption = () => {
    setIsGenerating(true);
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
    setSuccessMessage('✅ تم انشاء المنشور بنجاح! تم نسخ الكابشن للحافظة يمكنك نشره يدويا، او ارفع الحسابات من اللابتوب للنشر التلقائي.\n\n' + caption);
    navigator.clipboard.writeText(caption).catch(()=>{});
    setCaption('');
    setIsPublishing(false);
  };

  if (!isAuthenticated) {
    return (
      <div dir="rtl" style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', padding: '20px' }}>
        <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155' }}>
          <h2 style={{ color: '#fff', textAlign: 'center', marginTop: 0 }}>🤖 لوحة التحكم الادارية</h2>
          <p style={{ color: '#cbd5e1', textAlign: 'center', fontSize: '14px', marginBottom: '20px' }}>ادخل كلمة المرور للدخول</p>
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
          <p style={{ color: '#64748b', textAlign: 'center', fontSize: '12px', marginTop: '15px', marginBottom: 0 }}>كلمة المرور: sudan2026</p>
        </form>
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight: '100dvh', backgroundColor: '#0f172a', color: 'white', padding: '20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#fbbf24' }}>🤖 لوحة التحكم الادارية</h1>
        <p style={{ textAlign: 'center', color: '#cbd5e1', marginBottom: '20px' }}>احصائيات التطبيق واداة المنشورات</p>

        {/* لوحة الاحصائيات دائمة الظهور */}
        <div style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, textAlign: 'center', color: '#22c55e' }}>📊 احصائيات التطبيق</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', textAlign: 'center' }}>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#3b82f6' }}>{stats?.totalVisits || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>اجمالي الزيارات</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#8b5cf6' }}>{stats?.uniqueVisitors || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>زوار فريدين</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#22c55e' }}>{stats?.todayVisits || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>زيارات اليوم</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fbbf24' }}>{stats?.last7DaysVisits || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>آخر 7 ايام</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{stats?.totalInstalls || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>تثبيتات التطبيق</div>
            </div>
            <div style={{ backgroundColor: '#0f172a', padding: '14px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f97316' }}>{stats?.totalDownloads || 0}</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>تحميلات بدون نت</div>
            </div>
          </div>
          <button 
            type="button"
            onClick={refreshStats}
            style={{marginTop: '12px', width: '100%', padding: '8px', borderRadius: '6px', border: 'none', backgroundColor: '#334155', color: 'white', cursor: 'pointer', fontSize: '13px'}}
          >
            🔄 تحديث الاحصائيات
          </button>
        </div>

        {successMessage && (
          <div style={{ backgroundColor: '#14532d', border: '1px solid #22c55e', color: '#bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '20px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.7 }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handlePublish} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', marginBottom: '20px' }}>
          <h3 style={{marginTop:0, color:'#fbbf24', textAlign:'center'}}>📝 منشئ المنشورات</h3>

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
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>المميزات (مفصولة بفواصل)</label>
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
              {isGenerating ? '⏳ جاري الانشاء...' : '✨ انشئ نص المنشور تلقائيا'}
            </button>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="نص المنشور / الكابشن"
              rows={6}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>ملاحظة:</label>
            <div style={{ backgroundColor: '#422006', border: '1px solid #f59e0b', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#fbbf24' }}>
              النشر التلقائي سوف يكتمل عند ربط حسابات التواصل من اللابتوب، حاليا سيتم نسخ الكابشن تلقائيا للحافظة للنشر اليدوي.
            </div>
          </div>

          <button type="submit" disabled={isPublishing} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
            {isPublishing ? '⏳ جاري...' : '📋 انسخ الكابشن للنشر'}
          </button>
        </form>

      </div>
    </div>
  );
}
