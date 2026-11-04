import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Filter,
  Globe2,
  History,
  Info,
  MapPin,
  Plus,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import type { ContentLanguage, Listing, ReviewDecision } from './domain';
import './review-desk.css';

const languages: Record<ContentLanguage, string> = {
  'zh-CN': '中文',
  'ug-CN': '维吾尔语 · ئۇيغۇرچە',
  'kk-Arab-CN': '哈萨克语 · قازاقشا',
};
const statusText = { pending_review: '待人工审核', approved: '已通过', rejected: '已退回' };
type Status = keyof typeof statusText;

function stamp(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function ReviewDesk({
  listings,
  onReview,
  onLoadSamples,
  onExit,
}: {
  listings: Listing[];
  onReview: (id: string, decision: ReviewDecision, note: string) => void;
  onLoadSamples: () => void;
  onExit: () => void;
}) {
  const [status, setStatus] = useState<Status>('pending_review');
  const [language, setLanguage] = useState('all');
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const submissions = useMemo(() => listings.filter((item) => item.moderation), [listings]);
  const filtered = submissions.filter(
    (item) =>
      item.moderation?.status === status &&
      (language === 'all' || item.contentLanguage === language),
  );
  const selected = filtered.find(({ id }) => id === selectedId) ?? filtered[0];
  useEffect(() => {
    setNote('');
    setChecks([false, false, false]);
    setError('');
  }, [selected?.id, selected?.revision, selected?.moderation?.status]);

  function decide(decision: ReviewDecision) {
    if (!selected) return;
    if (decision === 'approved' && !checks.every(Boolean)) {
      setError('请先完成三项人工核对。');
      return;
    }
    if (decision === 'rejected' && !note.trim()) {
      setError('请填写具体退回原因，方便发布者修改。');
      return;
    }
    try {
      onReview(selected.id, decision, note);
      setAnnouncement(
        `${selected.title}：${decision === 'approved' ? '已审核通过，演示集市现在可见。' : '已退回，演示集市不可见。'}`,
      );
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '审核未完成，请重试。');
    }
  }

  return (
    <section className="review-desk" lang="zh-CN" dir="ltr" aria-labelledby="review-title">
      <div className="review-breadcrumb">
        <button onClick={onExit}>
          <ArrowLeft size={16} /> 返回农机集市
        </button>
        <span>禾集 / 运营后台 / 信息审核</span>
      </div>
      <div className="review-heading">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={14} /> HEJI OPERATIONS · DEMO
          </span>
          <h1 id="review-title">每一条供给，先过一道人工关。</h1>
          <p>按内容语言核对原文、机况与交易条件，通过后再对外展示。</p>
        </div>
        <button className="button secondary" onClick={onLoadSamples}>
          <Plus size={17} /> 载入三语审核样例
        </button>
      </div>
      <div className="review-demo-note">
        <Info size={18} />
        <p>
          <strong>同站点后台演示</strong> · 操作仅保存在当前浏览器，没有真实登录或权限隔离。
          语言用于分派审核能力，不能据此判断发布者身份。示例译文尚未专业核验。
        </p>
      </div>
      <div className="review-stats">
        {(
          [
            ['pending_review', Clock3, '等待专业人员核对'],
            ['approved', CheckCircle2, '在演示集市公开可见'],
            ['rejected', XCircle, '保留原因，等待修改'],
          ] as const
        ).map(([key, Icon, caption]) => (
          <button
            className={`review-stat ${status === key ? 'selected' : ''}`}
            key={key}
            aria-pressed={status === key}
            onClick={() => setStatus(key)}
          >
            <span className={`review-stat-icon ${key}`}>
              <Icon size={22} />
            </span>
            <span>
              <span>{statusText[key]}</span>
              <strong>
                {submissions.filter((item) => item.moderation?.status === key).length}
              </strong>
              <small>{caption}</small>
            </span>
          </button>
        ))}
      </div>
      <div className="review-workspace">
        <aside className="review-queue" aria-label="信息审核队列">
          <div className="review-queue-header">
            <h2>
              <ClipboardCheck size={18} /> 审核队列
            </h2>
            <span>{filtered.length} 条</span>
          </div>
          <label className="review-language-filter">
            <Filter size={15} />
            <span>内容语言</span>
            <select
              aria-label="筛选内容语言"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="all">全部语言</option>
              {Object.entries(languages).map(([code, label]) => (
                <option key={code} value={code}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="review-queue-items">
            {filtered.map((item) => (
              <button
                key={item.id}
                className={`review-queue-item ${selected?.id === item.id ? 'selected' : ''}`}
                aria-pressed={selected?.id === item.id}
                onClick={() => setSelectedId(item.id)}
              >
                <span className="review-item-meta">
                  <span>
                    {item.mode === 'rent' ? '出租' : '出售'} ·{' '}
                    {languages[item.contentLanguage ?? 'zh-CN'].split(' · ')[0]}
                  </span>
                  <small>v{item.revision}</small>
                </span>
                <strong dir="auto" lang={item.contentLanguage ?? 'zh-CN'}>
                  {item.title}
                </strong>
                <span className="review-item-bottom">
                  <MapPin size={12} />
                  {item.location}
                  <time>{stamp(item.moderation!.submittedAt)}</time>
                </span>
              </button>
            ))}
            {!filtered.length && (
              <div className="review-queue-empty">
                <FileCheck2 size={28} />
                <p>此队列暂无信息</p>
                <small>可切换状态、语言，或载入虚构样例体验。</small>
              </div>
            )}
          </div>
        </aside>
        {selected ? (
          <article className="review-detail" key={`${selected.id}-${selected.revision}`}>
            <div className="review-detail-heading">
              <span className={`review-status ${selected.moderation!.status}`}>
                {statusText[selected.moderation!.status]}
              </span>
              <span>
                版本 {selected.revision} · 提交于 {stamp(selected.moderation!.submittedAt)}
              </span>
            </div>
            <h2 dir="auto" lang={selected.contentLanguage ?? 'zh-CN'}>
              {selected.title}
            </h2>
            <div className="review-source-tag">
              <Globe2 size={15} />
              <bdi>{languages[selected.contentLanguage ?? 'zh-CN']}</bdi>
              <span>发布原文，未自动改写</span>
            </div>
            <div className="review-equipment">
              <img src={selected.image} alt="按分类匹配的设备示意图，非实拍" />
              <dl>
                <div>
                  <dt>供给方式</dt>
                  <dd>{selected.mode === 'rent' ? '出租' : '出售'}</dd>
                </div>
                <div>
                  <dt>报价</dt>
                  <dd>
                    <bdi>¥ {new Intl.NumberFormat('zh-CN').format(selected.price)}</bdi>
                    {selected.mode === 'rent' && ' / 天'}
                  </dd>
                </div>
                <div>
                  <dt>动力 / 规格</dt>
                  <dd dir="auto">{selected.power}</dd>
                </div>
                <div>
                  <dt>年份 / 使用时长</dt>
                  <dd>
                    {selected.year} 年 / {selected.hours} 小时
                  </dd>
                </div>
                <div>
                  <dt>农场 / 地区</dt>
                  <dd dir="auto">
                    {selected.farm} · {selected.location}
                  </dd>
                </div>
              </dl>
            </div>
            <section className="review-original" aria-label="发布信息原文">
              <h3>原文内容</h3>
              <div
                lang={selected.contentLanguage ?? 'zh-CN'}
                dir={
                  selected.contentLanguage && selected.contentLanguage !== 'zh-CN' ? 'rtl' : 'ltr'
                }
              >
                <strong dir="auto">{selected.subtitle}</strong>
                <p dir="auto">{selected.description}</p>
              </div>
            </section>
            {selected.moderation!.status === 'pending_review' ? (
              <div className="review-decision">
                <h3>
                  <BadgeCheck size={18} /> 人工核对清单
                </h3>
                <p>正式运营时，应由能读懂原文的审核员处理；存在歧义先退回补充。</p>
                {[
                  '已读懂原文，内容与租售目的清晰，无未解决的语言歧义',
                  '已核对机型、农业术语、计价单位与交接条件',
                  '已核对图片和描述，确认当前版本可以公开',
                ].map((label, index) => (
                  <label className="review-check" key={label}>
                    <input
                      type="checkbox"
                      checked={checks[index]}
                      onChange={(event) =>
                        setChecks((current) =>
                          current.map((value, i) => (i === index ? event.target.checked : value)),
                        )
                      }
                    />
                    {label}
                  </label>
                ))}
                <label className="review-note-label">
                  审核备注 / 退回原因
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={1000}
                    rows={3}
                    placeholder="退回时必填：指出需要补充或修正的信息，不使用笼统结论。"
                  />
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="review-decision-actions">
                  <button className="button secondary" onClick={() => decide('rejected')}>
                    <XCircle size={17} /> 退回修改
                  </button>
                  <button
                    className="button primary"
                    disabled={!checks.every(Boolean)}
                    onClick={() => decide('approved')}
                  >
                    <Check size={17} /> 通过并在集市展示
                  </button>
                </div>
              </div>
            ) : (
              <p className="review-completed">
                <ShieldCheck size={17} />
                {selected.moderation!.status === 'approved'
                  ? '当前版本已通过演示审核，可在集市找到。'
                  : '当前版本已退回，不在集市展示。'}{' '}
                修改内容后需要重新送审。
              </p>
            )}
            <section className="review-history">
              <h3>
                <History size={17} /> 操作记录
              </h3>
              <div>
                <span className="review-history-dot" />
                <p>
                  <strong>提交人工审核</strong>
                  <small>
                    {stamp(selected.moderation!.submittedAt)} · 版本 {selected.revision}
                  </small>
                </p>
              </div>
              {selected.moderation!.history.map((event, index) => (
                <div key={index}>
                  <span className="review-history-dot" />
                  <p>
                    <strong>
                      {event.decision === 'approved' ? '审核通过' : '退回修改'} · {event.reviewer}
                    </strong>
                    <small>
                      {stamp(event.reviewedAt)} · 版本 {event.revision}
                    </small>
                    {event.note && <span dir="auto">{event.note}</span>}
                  </p>
                </div>
              ))}
            </section>
          </article>
        ) : (
          <div className="review-detail-empty">
            <ShieldCheck size={45} />
            <h2>让信息可信，也让沟通顺畅。</h2>
            <p>从左侧选择一条信息，查看原文并完成审核。</p>
            <button className="button secondary" onClick={onLoadSamples}>
              载入三语审核样例
            </button>
          </div>
        )}
      </div>
      {announcement && (
        <p className="review-announcement" role="status">
          <CheckCircle2 size={17} /> <bdi>{announcement}</bdi>
        </p>
      )}
      <p className="review-production-note">
        上线规划：服务端权限与审核状态校验、按语言分派、操作审计、修改重审、申诉及配置版本发布。这里的本地勾选和记录仅用于演示流程。
      </p>
    </section>
  );
}
