import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Heart,
  Leaf,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
  Tractor,
  Trash2,
  UserRound,
  Warehouse,
  Wheat,
  Wind,
  X,
} from 'lucide-react';
import {
  calculateRentalTotal,
  createBooking,
  filterListings,
  isListing,
  parsePersistedState,
  seedListings,
  type Category,
  type Listing,
  type PersistedState,
  type SortOrder,
  type TradeMode,
} from './domain';

const STORAGE_KEY = 'heji-demo-v1';
const categories: { id: Category; label: string; icon: typeof Tractor }[] = [
  { id: 'all', label: '全部农机', icon: Wheat },
  { id: 'tractor', label: '拖拉机', icon: Tractor },
  { id: 'harvester', label: '收获机械', icon: Wheat },
  { id: 'implement', label: '耕种农具', icon: Sprout },
  { id: 'drone', label: '植保无人机', icon: Wind },
];
const images: Record<string, string> = {
  tractor: '/images/tractor.webp',
  harvester: '/images/harvester.webp',
  implement: '/images/implement.webp',
  drone: '/images/drone.webp',
};
const money = (value: number) => new Intl.NumberFormat('zh-CN').format(value);
const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

function loadState(): PersistedState {
  try {
    return parsePersistedState(localStorage.getItem(STORAGE_KEY));
  } catch {
    return parsePersistedState(null);
  }
}

function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previous;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? 'modal-wide' : ''}`}
      aria-labelledby="modal-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <span className="eyebrow">HEJI · 农机共享集市</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="关闭弹窗">
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}

function ListingCard({
  listing,
  saved,
  onFavorite,
  onOpen,
}: {
  listing: Listing;
  saved: boolean;
  onFavorite: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="listing-card">
      <div className="card-visual">
        <button className="image-button" onClick={onOpen} aria-label={`查看${listing.title}`}>
          <img
            src={listing.image}
            alt={`${categories.find((item) => item.id === listing.category)?.label}示意图片`}
            loading="lazy"
          />
        </button>
        <span className={`mode-badge ${listing.mode}`}>
          {listing.mode === 'rent' ? '可租赁' : '二手出售'}
        </span>
        <button
          className={`favorite-button ${saved ? 'is-saved' : ''}`}
          onClick={onFavorite}
          aria-label={`${saved ? '取消收藏' : '收藏'}${listing.title}`}
          aria-pressed={saved}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="photo-note">示意图片</span>
      </div>
      <div className="card-body">
        <div className="card-kicker">
          <span>{listing.year} 年</span>
          <span className="dot" />
          <span>{money(listing.hours)} 小时</span>
          {listing.tag && <span className="card-tag">{listing.tag}</span>}
        </div>
        <button className="card-title" onClick={onOpen}>
          {listing.title}
        </button>
        <p className="card-subtitle">{listing.subtitle}</p>
        <div className="price-line">
          <span className="price">
            <small>¥</small>
            {money(listing.price)}
          </span>
          <span className="price-unit">{listing.mode === 'rent' ? '/ 天' : '售价'}</span>
          <span className="card-location">
            <MapPin size={13} />
            {listing.location.split(' · ')[1] || listing.location}
          </span>
        </div>
        <div className="card-farm">
          <span className="farm-avatar">
            <Leaf size={12} />
          </span>
          <span>{listing.farm}</span>
          {listing.verified && (
            <BadgeCheck size={15} className="verified" aria-label="演示认证农场" />
          )}
          <button onClick={onOpen} aria-label={`查看${listing.title}详情`}>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function Detail({
  listing,
  saved,
  onFavorite,
  onClose,
  onBooking,
}: {
  listing: Listing;
  saved: boolean;
  onFavorite: () => void;
  onClose: () => void;
  onBooking: (booking: ReturnType<typeof createBooking>) => void;
}) {
  const [start, setStart] = useState(today());
  const [end, setEnd] = useState(today());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  let total = listing.price;
  try {
    if (listing.mode === 'rent') total = calculateRentalTotal(listing.price, start, end);
  } catch {
    total = 0;
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const booking = createBooking(listing, {
        contactName: String(data.get('name') || ''),
        contactPhone: String(data.get('phone') || ''),
        ...(listing.mode === 'rent' ? { startDate: start, endDate: end } : {}),
      });
      onBooking(booking);
      setSuccess(true);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '请检查填写的信息');
    }
  }
  return (
    <Modal title={listing.title} onClose={onClose} wide>
      {success ? (
        <div className="success-state">
          <span className="success-icon">
            <Check size={32} />
          </span>
          <span className="eyebrow">意向已保存</span>
          <h3>离下一次丰收，又近了一步。</h3>
          <p>
            可在「我的农场」查看本次{listing.mode === 'rent' ? '租赁' : '购买'}意向。
            <br />
            这是本地演示，尚未通知农场，也不会产生扣款。
          </p>
          <button className="button primary" onClick={onClose}>
            继续逛逛 <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="detail-grid">
          <div className="detail-info">
            <img className="detail-image" src={listing.image} alt="农机示意图片，与实际型号无关" />
            <div className="detail-tags">
              <span className={`mode-badge ${listing.mode}`}>
                {listing.mode === 'rent' ? '灵活租赁' : '二手出售'}
              </span>
              <span>
                <MapPin size={14} />
                {listing.location}
              </span>
              <span>图片及参数均为演示</span>
            </div>
            <h3>关于这台设备</h3>
            <p>{listing.description}</p>
            <dl className="spec-grid">
              <div>
                <dt>出厂年份</dt>
                <dd>{listing.year} 年</dd>
              </div>
              <div>
                <dt>使用时长</dt>
                <dd>{money(listing.hours)} 小时</dd>
              </div>
              <div>
                <dt>动力 / 规格</dt>
                <dd>{listing.power}</dd>
              </div>
              {Object.entries(listing.specs || {}).map(([key, value]) => (
                <div key={key}>
                  <dt>{key}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="detail-farm">
              <span className="farm-avatar">
                <Sprout size={22} />
              </span>
              <div>
                <strong>{listing.farm}</strong>
                <p>{listing.verified ? '示例认证农场 · 资料仅供演示' : '示例农场 · 尚未认证'}</p>
              </div>
              <button
                className={`icon-button ${saved ? 'is-saved' : ''}`}
                onClick={onFavorite}
                aria-label={saved ? '取消收藏' : '收藏设备'}
                aria-pressed={saved}
              >
                <Heart size={21} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <form className="booking-form" onSubmit={submit}>
            <span className="eyebrow">
              {listing.mode === 'rent' ? '给农忙，搭把手' : '为农场，添好帮手'}
            </span>
            <div className="detail-price">
              <span className="price">
                <small>¥</small>
                {money(listing.price)}
              </span>
              <span>{listing.mode === 'rent' ? '/ 天' : '参考售价'}</span>
            </div>
            <p className="muted">
              {listing.mode === 'rent'
                ? '按自然日计费，起止日期均计入租期。'
                : '提交购买意向，演示中不发生真实交易。'}
            </p>
            {listing.mode === 'rent' && (
              <div className="date-fields">
                <label>
                  开始日期
                  <input
                    type="date"
                    required
                    min={today()}
                    value={start}
                    onInput={(event) => setStart(event.currentTarget.value)}
                    onChange={(event) => setStart(event.target.value)}
                  />
                </label>
                <label>
                  结束日期
                  <input
                    type="date"
                    required
                    min={start || today()}
                    value={end}
                    onInput={(event) => setEnd(event.currentTarget.value)}
                    onChange={(event) => setEnd(event.target.value)}
                  />
                </label>
              </div>
            )}
            <label>
              联系人
              <input
                name="name"
                placeholder="请输入演示姓名"
                maxLength={40}
                required
                autoComplete="off"
              />
            </label>
            <label>
              联系手机
              <input
                name="phone"
                type="tel"
                placeholder="例如 13800000000"
                pattern="1[3-9][0-9]{9}"
                maxLength={11}
                required
                autoComplete="off"
              />
            </label>
            <div className="quote-total">
              <span>
                {listing.mode === 'rent'
                  ? `设备租金${total ? ` · ${total / listing.price} 天` : ''}`
                  : '设备参考价'}
              </span>
              <strong>{total ? `¥ ${money(total)}` : '请选择有效租期'}</strong>
            </div>
            <p className="quote-note">运输、押金、保险及配套作业另行协商，未计入此金额。</p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary full" type="submit">
              提交{listing.mode === 'rent' ? '租赁' : '购买'}意向 <ArrowRight size={17} />
            </button>
            <p className="demo-form-note">
              <ShieldCheck size={15} />
              仅保存在当前浏览器。请使用虚构联系信息。
            </p>
          </form>
        </div>
      )}
    </Modal>
  );
}

function Publish({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (listing: Listing) => void;
}) {
  const [mode, setMode] = useState<'rent' | 'buy'>('rent');
  const [category, setCategory] = useState<Exclude<Category, 'all'>>('tractor');
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const listing: Listing = {
      id: `local-${crypto.randomUUID()}`,
      title: String(data.get('title') || '').trim(),
      subtitle: String(data.get('subtitle') || '').trim(),
      category,
      mode,
      price: Number(data.get('price')),
      location: String(data.get('location') || '').trim(),
      farm: '我的演示农场',
      verified: false,
      hours: Number(data.get('hours')),
      year: Number(data.get('year')),
      power: String(data.get('power') || '').trim(),
      description: String(data.get('description') || '').trim(),
      image: images[category],
      tag: '新鲜上架',
      createdAt: new Date().toISOString(),
    };
    if (!isListing(listing)) {
      setError('请完整填写设备信息，价格需为正整数。');
      return;
    }
    onPublish(listing);
  }
  return (
    <Modal title="让闲置农机，忙起来。" onClose={onClose}>
      <form className="publish-form" onSubmit={submit}>
        <p className="muted">发布到本地演示集市，试着为好设备找个新去处。</p>
        <div className="segmented publish-mode">
          <button
            type="button"
            className={mode === 'rent' ? 'active' : ''}
            onClick={() => setMode('rent')}
          >
            我要出租
          </button>
          <button
            type="button"
            className={mode === 'buy' ? 'active' : ''}
            onClick={() => setMode('buy')}
          >
            我要出售
          </button>
        </div>
        <div className="form-grid">
          <label className="span-two">
            设备名称
            <input name="title" required maxLength={60} placeholder="例如：东方红 LX904 拖拉机" />
          </label>
          <label>
            设备分类
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Exclude<Category, 'all'>)}
            >
              {categories
                .filter((item) => item.id !== 'all')
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {mode === 'rent' ? '日租金（元 / 天）' : '出售价格（元）'}
            <input
              name="price"
              type="number"
              min="1"
              max="100000000"
              step="1"
              placeholder={mode === 'rent' ? '例如 500' : '例如 50000'}
              required
            />
          </label>
          <label>
            所在地区
            <input name="location" placeholder="例如：山东 · 潍坊" required maxLength={40} />
          </label>
          <label>
            动力 / 规格
            <input name="power" placeholder="例如：90 马力" required maxLength={40} />
          </label>
          <label>
            出厂年份
            <input
              name="year"
              type="number"
              min="1950"
              max={new Date().getFullYear()}
              defaultValue={2023}
              required
            />
          </label>
          <label>
            使用小时
            <input name="hours" type="number" min="0" max="100000" defaultValue={0} required />
          </label>
          <label className="span-two">
            一句话亮点
            <input
              name="subtitle"
              placeholder="例如：四轮驱动 · 保养记录齐全"
              maxLength={100}
              required
            />
          </label>
          <label className="span-two">
            设备介绍
            <textarea
              name="description"
              rows={3}
              maxLength={1000}
              placeholder="介绍设备状态、适用作业和交接方式……"
              required
            />
          </label>
        </div>
        <div className="publish-image-note">
          <img src={images[category]} alt="按设备分类匹配的演示图" />
          <p>
            自动匹配分类示意图
            <br />
            <span>真实照片上传留待后端接入。</span>
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="button primary full">
          <Plus size={18} />
          发布到演示集市
        </button>
        <p className="demo-form-note">仅在本机可见，不会同步给其他用户。</p>
      </form>
    </Modal>
  );
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadState);
  const [view, setView] = useState<'market' | 'favorites' | 'farm'>('market');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [mode, setMode] = useState<TradeMode>('all');
  const [location, setLocation] = useState('all');
  const [sort, setSort] = useState<SortOrder>('recommended');
  const [active, setActive] = useState<Listing | null>(null);
  const [overlay, setOverlay] = useState<'publish' | 'about' | 'reset' | null>(null);
  const [toast, setToast] = useState('');
  const [storageError, setStorageError] = useState(false);
  const marketRef = useRef<HTMLElement>(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    if (mode === 'all') setSort('recommended');
  }, [mode]);
  const allListings = useMemo(() => [...state.listings, ...seedListings], [state.listings]);
  const locations = [...new Set(allListings.map((listing) => listing.location.split(' · ')[0]))];
  const visible = useMemo(
    () =>
      filterListings(
        view === 'favorites'
          ? allListings.filter((listing) => state.favorites.includes(listing.id))
          : allListings,
        { query, category, mode, sort, location },
      ),
    [allListings, state.favorites, view, query, category, mode, sort, location],
  );
  function favorite(id: string) {
    const exists = state.favorites.includes(id);
    setState((current) => ({
      ...current,
      favorites: exists
        ? current.favorites.filter((item) => item !== id)
        : [...current.favorites, id],
    }));
    setToast(exists ? '已取消收藏' : '已收藏，可在「我的收藏」查看');
  }
  function navigate(next: typeof view) {
    setView(next);
    setQuery('');
    setCategory('all');
    setMode('all');
    setLocation('all');
    setSort('recommended');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function resetFilters() {
    setQuery('');
    setCategory('all');
    setMode('all');
    setLocation('all');
    setSort('recommended');
  }
  const cards = (listings: Listing[]) =>
    listings.map((listing) => (
      <ListingCard
        key={listing.id}
        listing={listing}
        saved={state.favorites.includes(listing.id)}
        onFavorite={() => favorite(listing.id)}
        onOpen={() => setActive(listing)}
      />
    ));
  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => navigate('market')} aria-label="禾集首页">
            <span className="brand-symbol">
              <Sprout size={27} strokeWidth={1.7} />
            </span>
            <span className="brand-name">
              禾集<small>HEJI</small>
            </span>
            <span className="brand-divider" />
            <span className="brand-description">农机共享集市</span>
          </button>
          <nav aria-label="主导航">
            <button
              className={view === 'market' ? 'active' : ''}
              onClick={() => navigate('market')}
            >
              农机集市
            </button>
            <button
              className={view === 'favorites' ? 'active' : ''}
              onClick={() => navigate('favorites')}
            >
              我的收藏
              {state.favorites.length > 0 && (
                <span className="nav-count">{state.favorites.length}</span>
              )}
            </button>
            <button className={view === 'farm' ? 'active' : ''} onClick={() => navigate('farm')}>
              我的农场
            </button>
          </nav>
          <div className="header-actions">
            <span className="demo-status">
              <i />
              Demo
            </span>
            <button className="button primary header-publish" onClick={() => setOverlay('publish')}>
              <Plus size={17} />
              <span>发布农机</span>
            </button>
            <button
              className="user-avatar"
              aria-label="查看我的演示农场"
              onClick={() => navigate('farm')}
            >
              <UserRound size={20} />
            </button>
          </div>
        </div>
      </header>
      <main>
        {view === 'market' && (
          <section className="hero">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <span />
                让农机流转，让土地丰收
              </div>
              <h1>
                好农机，
                <br />
                遇见<span>下一片田。</span>
                <svg viewBox="0 0 310 18" aria-hidden="true">
                  <path d="M4 12Q140 0 303 9" />
                </svg>
              </h1>
              <p>
                闲置的好设备，也能成为别人的好帮手。
                <br />
                在禾集，连接农场，让买卖和租用更简单。
              </p>
              <button
                className="hero-link"
                onClick={() => {
                  setMode('rent');
                  marketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                找一台趁手的农机 <ArrowRight size={18} />
              </button>
              <div className="hero-stats">
                <div>
                  <strong>{allListings.length.toString().padStart(2, '0')}</strong>
                  <span>台演示农机</span>
                </div>
                <span className="stat-divider" />
                <div>
                  <strong>
                    {new Set(allListings.map((listing) => listing.farm)).size
                      .toString()
                      .padStart(2, '0')}
                  </strong>
                  <span>家示例农场</span>
                </div>
                <span className="stat-divider" />
                <div>
                  <strong>租 / 售</strong>
                  <span>按需灵活选择</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <img
                src="/images/tractor.webp"
                alt="拖拉机在田野中作业的示意图片"
                fetchPriority="high"
              />
              <div className="hero-image-shade" />
              <span className="hero-visual-label">
                <span className="tiny-sun" />
                GROW TOGETHER.
              </span>
              <div className="hero-note">
                <span>
                  <Sprout size={23} />
                </span>
                <div>
                  每台农机，都值得物尽其用。<small>A new season. A new possibility.</small>
                </div>
              </div>
              <span className="hero-photo-caption">田野作业示意 · 非真实挂牌设备</span>
            </div>
          </section>
        )}
        {view === 'favorites' && (
          <section className="page-intro">
            <span className="eyebrow">YOUR COLLECTION</span>
            <h1>好设备，先收藏。</h1>
            <p>为下一次农忙，留住心动的好帮手。</p>
          </section>
        )}
        {view !== 'farm' && (
          <section className="market-section" ref={marketRef} id="market">
            <div className="search-panel">
              <form
                className="search-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  marketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <Search size={21} />
                <input
                  aria-label="搜索农机、品牌或农场"
                  placeholder="搜农机、品牌，或你熟悉的农场"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="icon-button clear-search"
                    onClick={() => setQuery('')}
                    aria-label="清空搜索"
                  >
                    <X size={16} />
                  </button>
                )}
                <span className="search-divider" />
                <div className="region-select">
                  <MapPin size={17} />
                  <select
                    aria-label="选择地区"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    <option value="all">全国地区</option>
                    {locations.map((region) => (
                      <option value={region} key={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
                <button type="submit" className="button primary search-button">
                  搜索农机 <ArrowRight size={16} />
                </button>
              </form>
            </div>
            <div className="category-tabs" aria-label="农机分类">
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={category === id ? 'active' : ''}
                  onClick={() => setCategory(id)}
                  aria-pressed={category === id}
                >
                  <Icon size={21} strokeWidth={1.7} />
                  {label}
                  {id === 'all' && <span>{allListings.length}</span>}
                </button>
              ))}
            </div>
            <div className="market-toolbar">
              <div className="market-heading">
                <h2>{view === 'favorites' ? '我的收藏' : '发现好农机'}</h2>
                <span>
                  {visible.length} 台设备{view === 'market' && '，总有一台适合你'}
                </span>
              </div>
              <div className="toolbar-controls">
                <div className="segmented" aria-label="交易方式">
                  {(['all', 'rent', 'buy'] as TradeMode[]).map((value) => (
                    <button
                      key={value}
                      className={mode === value ? 'active' : ''}
                      aria-pressed={mode === value}
                      onClick={() => setMode(value)}
                    >
                      {value === 'all' ? '全部' : value === 'rent' ? '租农机' : '买农机'}
                    </button>
                  ))}
                </div>
                <div className="sort-select">
                  <ArrowDownUp size={15} />
                  <select
                    aria-label="设备排序"
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOrder)}
                  >
                    <option value="recommended">综合推荐</option>
                    <option value="newest">最新发布</option>
                    <option value="price-asc" disabled={mode === 'all'}>
                      价格从低到高
                    </option>
                    <option value="price-desc" disabled={mode === 'all'}>
                      价格从高到低
                    </option>
                  </select>
                  <ChevronDown size={13} />
                </div>
              </div>
            </div>
            {visible.length ? (
              <div className="listing-grid">{cards(visible)}</div>
            ) : (
              <div className="empty-state">
                <Search size={32} strokeWidth={1.5} />
                <h3>
                  {view === 'favorites' && !state.favorites.length
                    ? '还没有收藏的设备'
                    : '暂时没有找到合适的农机'}
                </h3>
                <p>
                  {view === 'favorites' && !state.favorites.length
                    ? '点击设备上的爱心，把好帮手留在这里。'
                    : '试试其他关键词，或放宽筛选条件。'}
                </p>
                <button
                  className="button secondary"
                  onClick={() => {
                    resetFilters();
                    if (view === 'favorites' && !state.favorites.length) navigate('market');
                  }}
                >
                  {view === 'favorites' && !state.favorites.length ? '去集市逛逛' : '清除筛选条件'}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            <p className="results-note">
              <SlidersHorizontal size={13} />
              {mode === 'all'
                ? '租金与售价分开比较，选择租 / 售后可按价格排序。'
                : '已展示全部匹配设备，试试其他分类发现更多。'}
            </p>
          </section>
        )}
        {view === 'farm' && (
          <section className="farm-page">
            <div className="farm-page-heading">
              <div>
                <span className="eyebrow">MY FARM · DEMO</span>
                <h1>我的演示农场</h1>
                <p>管理设备和交易意向，为下一季做好准备。</p>
              </div>
              <button className="button primary" onClick={() => setOverlay('publish')}>
                <Plus size={18} />
                发布农机
              </button>
            </div>
            <div className="farm-stats">
              <div>
                <Warehouse size={22} />
                <span>
                  我的发布<strong>{state.listings.length}</strong>
                </span>
              </div>
              <div>
                <CalendarDays size={22} />
                <span>
                  交易意向<strong>{state.bookings.length}</strong>
                </span>
              </div>
              <div>
                <Heart size={22} />
                <span>
                  已收藏设备<strong>{state.favorites.length}</strong>
                </span>
              </div>
            </div>
            <div className="section-heading">
              <h2>我的交易意向</h2>
              <span>仅本地保存 · 尚未通知农场</span>
            </div>
            {state.bookings.length ? (
              <div className="booking-list">
                {[...state.bookings].reverse().map((booking) => (
                  <article className="booking-row" key={booking.id}>
                    <span className="booking-type">
                      {booking.mode === 'rent' ? <CalendarDays size={22} /> : <Tractor size={22} />}
                    </span>
                    <div className="booking-description">
                      <h3>{booking.listingTitle}</h3>
                      <p>
                        {booking.mode === 'rent'
                          ? `${booking.startDate} 至 ${booking.endDate}`
                          : '购买意向 · 等待线下验机'}{' '}
                        · {booking.contactName}
                      </p>
                      <small>{booking.id}</small>
                    </div>
                    <span className="pending-badge">本地意向</span>
                    <strong>¥ {money(booking.total)}</strong>
                    <button
                      className="icon-button"
                      aria-label={`移除${booking.listingTitle}意向`}
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          bookings: current.bookings.filter((item) => item.id !== booking.id),
                        }));
                        setToast('本地意向已移除');
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state compact">
                <CalendarDays size={29} />
                <h3>下一次农忙，从这里开始</h3>
                <p>找到心仪设备后，提交一份租赁或购买意向。</p>
                <button className="button secondary" onClick={() => navigate('market')}>
                  去找好农机 <ArrowRight size={16} />
                </button>
              </div>
            )}
            <div className="section-heading">
              <h2>我发布的农机</h2>
              <span>{state.listings.length} 台设备</span>
            </div>
            {state.listings.length ? (
              <div className="listing-grid">{cards(state.listings)}</div>
            ) : (
              <div className="publish-empty">
                <Sprout size={30} />
                <div>
                  <h3>让你的好设备，服务更多土地。</h3>
                  <p>从发布第一台闲置农机开始。</p>
                </div>
                <button className="button secondary" onClick={() => setOverlay('publish')}>
                  <Plus size={16} />
                  发布第一台
                </button>
              </div>
            )}
          </section>
        )}
        <section className="values-strip">
          <div>
            <span className="value-icon">
              <Sprout size={25} />
            </span>
            <div>
              <h3>农场直连，更近一步</h3>
              <p>让设备与需求，在田间相遇。</p>
            </div>
          </div>
          <div>
            <span className="value-icon">
              <ShieldCheck size={25} />
            </span>
            <div>
              <h3>设备信息，一目了然</h3>
              <p>年份、工时和规格，清楚再决定。</p>
            </div>
          </div>
          <div>
            <span className="value-icon">
              <Tractor size={26} />
            </span>
            <div>
              <h3>可租可买，刚刚好</h3>
              <p>按农时选设备，把投入用在刀刃上。</p>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">
            <Sprout size={20} />
            禾集 <small>HEJI</small>
          </span>
          <span>让好农机流转，让每一季丰收。</span>
        </div>
        <div>
          <span className="footer-demo">概念演示 · 全部数据均为虚构</span>
          <button onClick={() => setOverlay('about')}>
            <CircleHelp size={14} />
            演示说明
          </button>
          <button onClick={() => setOverlay('reset')}>重置演示</button>
        </div>
      </footer>
      {storageError && (
        <div className="storage-warning" role="alert">
          当前浏览器无法保存数据，刷新后本次修改可能丢失。
        </div>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
        </div>
      )}
      {active && (
        <Detail
          key={active.id}
          listing={active}
          saved={state.favorites.includes(active.id)}
          onFavorite={() => favorite(active.id)}
          onClose={() => setActive(null)}
          onBooking={(booking) =>
            setState((current) => ({ ...current, bookings: [...current.bookings, booking] }))
          }
        />
      )}
      {overlay === 'publish' && (
        <Publish
          onClose={() => setOverlay(null)}
          onPublish={(listing) => {
            setState((current) => ({ ...current, listings: [listing, ...current.listings] }));
            setOverlay(null);
            navigate('farm');
            setToast('设备已发布到本地演示集市');
          }}
        />
      )}
      {overlay === 'about' && (
        <Modal title="从一台好农机开始。" onClose={() => setOverlay(null)}>
          <div className="about-content">
            <p>禾集是一个农机买卖与租赁平台的概念演示，连接有设备的农场与有需求的人。</p>
            <ul>
              <li>浏览、搜索、分类筛选、地区筛选与收藏。</li>
              <li>本地发布设备，提交购买 / 租赁意向。</li>
              <li>租金按自然日计算，含起止当天。</li>
            </ul>
            <p>
              设备图片来自
              Unsplash，仅作分类示意，与品牌型号无关。所有农场、价格、参数与认证状态均为演示数据。
            </p>
            <p>
              数据仅存于当前浏览器；没有真实登录、支付、消息通知或库存锁定。请勿填写真实个人信息。
            </p>
            <button className="button primary full" onClick={() => setOverlay(null)}>
              开始探索 <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
      {overlay === 'reset' && (
        <Modal title="重新开始演示" onClose={() => setOverlay(null)}>
          <div className="about-content">
            <p>将清除当前浏览器里发布的设备、收藏和交易意向，恢复初始演示数据。</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setOverlay(null)}>
                保留数据
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setState({ favorites: [], listings: [], bookings: [] });
                  setOverlay(null);
                  navigate('market');
                  setToast('已恢复初始演示数据');
                }}
              >
                确认重置
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
