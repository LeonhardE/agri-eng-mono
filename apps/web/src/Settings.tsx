import { ArrowRight, Check, Globe2, ShieldCheck } from 'lucide-react';
import { languages, useI18n } from './i18n';

export default function Settings({ onExit, onAdmin }: { onExit: () => void; onAdmin: () => void }) {
  const { locale, setLocale, sourceText: t, storageError } = useI18n();
  return (
    <section className="settings-page">
      <div className="settings-heading">
        <div>
          <span className="eyebrow">HEJI · LANGUAGE</span>
          <h1>{t('语言与显示')}</h1>
          <p>{t('选择你熟悉的语言')}</p>
        </div>
        <button className="button secondary" onClick={onExit}>
          {t('返回集市')}
          <ArrowRight size={16} />
        </button>
      </div>
      <div className="settings-card">
        <div className="settings-card-title">
          <Globe2 size={23} />
          <div>
            <h2>{t('界面语言')}</h2>
            <p>{t('选择后立即生效，并保存在当前浏览器。')}</p>
          </div>
        </div>
        <div className="language-options" role="group" aria-label={t('界面语言')}>
          {languages.map((language) => (
            <button
              key={language.tag}
              className={`language-option ${locale === language.tag ? 'selected' : ''}`}
              aria-pressed={locale === language.tag}
              onClick={() => setLocale(language.tag)}
            >
              <span lang={language.tag} dir={language.direction}>
                {language.name}
              </span>
              <small dir="ltr">{language.tag}</small>
              {locale === language.tag && <Check size={19} />}
            </button>
          ))}
        </div>
        {storageError && (
          <p className="form-error" role="alert">
            {t('语言偏好无法保存，刷新后可能恢复中文。')}
          </p>
        )}
        <div className="language-draft">
          <strong>{t('演示译文 · 待专业核验')}</strong>
          <p>{t('维语和哈萨克语翻译为演示草稿，农业术语尚未经专业人员核验。')}</p>
        </div>
        <p className="settings-note">
          {t(
            '语言切换只改变界面与示例设备说明。品牌、型号、地名保留原名；用户发布的原文不会自动翻译。',
          )}
        </p>
        <p className="settings-note">
          {t(
            '维语和哈萨克语使用新疆常用的阿拉伯字母，从右向左显示；人民币、型号与日期保持清晰顺序。',
          )}
        </p>
      </div>
      <div className="settings-card admin-entry">
        <div className="settings-card-title">
          <ShieldCheck size={23} />
          <div>
            <h2>{t('后台审核演示')}</h2>
            <p>{t('同一站点体验人工审核')}</p>
          </div>
        </div>
        <p className="settings-note">
          {t('后台为中文运营界面，仅在当前浏览器模拟审核，没有真实管理员权限或跨设备同步。')}
        </p>
        <button className="button primary" onClick={onAdmin}>
          {t('进入后台审核')}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
