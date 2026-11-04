import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Settings as SettingsIcon,
  Languages,
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
  submitListing,
  reviewListing,
  publicListings,
  makeReviewSamples,
  type Category,
  type Listing,
  type PersistedState,
  type SortOrder,
  type TradeMode,
} from './domain';
import ReviewDesk from './ReviewDesk';
import Settings from './Settings';
import { useI18n, languages, type Locale } from './i18n';

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
  const { t } = useI18n();
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
          <span className="eyebrow">{t('message.006')}</span>
          <h2 id="modal-title">{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label={t('message.007')}>
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
  const { t, sourceText, localizeListing } = useI18n();
  listing = localizeListing(listing);
  return (
    <article className="listing-card">
      <div className="card-visual">
        <button
          className="image-button"
          onClick={onOpen}
          aria-label={sourceText('查看{title}').replace('{title}', listing.title)}
        >
          <img
            src={listing.image}
            alt={`${sourceText(categories.find((item) => item.id === listing.category)?.label || t('message.001'))} · ${sourceText('示意图片')}`}
            loading="lazy"
          />
        </button>
        <span className={`mode-badge ${listing.mode}`}>
          {listing.mode === 'rent' ? t('message.008') : t('message.009')}
        </span>
        <button
          className={`favorite-button ${saved ? 'is-saved' : ''}`}
          onClick={onFavorite}
          aria-label={`${sourceText(saved ? t('message.010') : t('message.011'))} ${listing.title}`}
          aria-pressed={saved}
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <span className="photo-note">{t('message.012')}</span>
      </div>
      <div className="card-body">
        {listing.moderation && (
          <p className={`moderation-label ${listing.moderation.status}`}>
            {sourceText(
              listing.moderation.status === 'approved'
                ? t('message.196')
                : listing.moderation.status === 'rejected'
                  ? t('message.197')
                  : t('message.195'),
            )}
          </p>
        )}
        <div className="card-kicker">
          <span>
            {listing.year} {t('message.013')}
          </span>
          <span className="dot" />
          <span>
            {money(listing.hours)} {t('message.014')}
          </span>
          {listing.tag && <span className="card-tag">{listing.tag}</span>}
        </div>
        <button className="card-title" dir="auto" onClick={onOpen}>
          {listing.title}
        </button>
        <p className="card-subtitle" dir="auto">
          {listing.subtitle}
        </p>
        <div className="price-line">
          <span className="price">
            <small>¥</small>
            {money(listing.price)}
          </span>
          <span className="price-unit">
            {listing.mode === 'rent' ? t('message.015') : t('message.016')}
          </span>
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
            <BadgeCheck size={15} className="verified" aria-label={t('message.017')} />
          )}
          <button
            onClick={onOpen}
            aria-label={sourceText('查看{title}详情').replace('{title}', listing.title)}
          >
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
  const { t, sourceText, localizeListing } = useI18n();
  listing = localizeListing(listing);
  const canBook =
    seedListings.some((seed) => seed.id === listing.id) ||
    listing.moderation?.status === 'approved';
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
      setError(cause instanceof Error ? cause.message : t('message.018'));
    }
  }
  return (
    <Modal title={listing.title} onClose={onClose} wide>
      {success ? (
        <div className="success-state">
          <span className="success-icon">
            <Check size={32} />
          </span>
          <span className="eyebrow">{t('message.019')}</span>
          <h3>{t('message.020')}</h3>
          <p>
            {t('message.021')} {listing.mode === 'rent' ? t('message.022') : t('message.023')}{' '}
            {t('message.024')}
            <br />
            {t('message.025')}
          </p>
          <button className="button primary" onClick={onClose}>
            {t('message.026')}
            <ArrowRight size={17} />
          </button>
        </div>
      ) : (
        <div className="detail-grid">
          <div className="detail-info">
            <img className="detail-image" src={listing.image} alt={t('message.027')} />
            <div className="detail-tags">
              <span className={`mode-badge ${listing.mode}`}>
                {listing.mode === 'rent' ? t('message.028') : t('message.009')}
              </span>
              <span>
                <MapPin size={14} />
                {listing.location}
              </span>
              <span>{t('message.029')}</span>
            </div>
            <h3>{t('message.030')}</h3>
            <p dir="auto">{listing.description}</p>
            <dl className="spec-grid">
              <div>
                <dt>{t('message.031')}</dt>
                <dd>
                  {listing.year} {t('message.013')}
                </dd>
              </div>
              <div>
                <dt>{t('message.032')}</dt>
                <dd>
                  {money(listing.hours)} {t('message.014')}
                </dd>
              </div>
              <div>
                <dt>{t('message.033')}</dt>
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
                <p>{listing.verified ? t('message.034') : t('message.035')}</p>
              </div>
              <button
                className={`icon-button ${saved ? 'is-saved' : ''}`}
                onClick={onFavorite}
                aria-label={saved ? t('message.010') : t('message.036')}
                aria-pressed={saved}
              >
                <Heart size={21} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
          <form className="booking-form" onSubmit={submit}>
            {!canBook && (
              <div className="review-readonly">
                <strong>
                  {sourceText(
                    listing.moderation?.status === 'rejected' ? t('message.197') : t('message.195'),
                  )}
                </strong>
                <p>{sourceText('设备尚未通过人工审核，暂不能提交交易意向')}</p>
                {listing.moderation?.history.at(-1)?.note && (
                  <p dir="auto">
                    {sourceText('审核备注')}: {listing.moderation.history.at(-1)?.note}
                  </p>
                )}
              </div>
            )}
            <fieldset disabled={!canBook}>
              <span className="eyebrow">
                {listing.mode === 'rent' ? t('message.037') : t('message.038')}
              </span>
              <div className="detail-price">
                <span className="price">
                  <small>¥</small>
                  {money(listing.price)}
                </span>
                <span>{listing.mode === 'rent' ? t('message.015') : t('message.039')}</span>
              </div>
              <p className="muted">
                {listing.mode === 'rent' ? t('message.040') : t('message.041')}
              </p>
              {listing.mode === 'rent' && (
                <div className="date-fields">
                  <label>
                    {t('message.042')}
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
                    {t('message.043')}
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
                {t('message.044')}
                <input
                  name="name"
                  placeholder={t('message.045')}
                  maxLength={40}
                  required
                  autoComplete="off"
                />
              </label>
              <label>
                {t('message.046')}
                <input
                  name="phone"
                  type="tel"
                  placeholder={t('message.047')}
                  pattern="1[3-9][0-9]{9}"
                  maxLength={11}
                  required
                  autoComplete="off"
                />
              </label>
              <div className="quote-total">
                <span>
                  {listing.mode === 'rent'
                    ? sourceText('设备租金 · {days} 天').replace(
                        '{days}',
                        String(total ? total / listing.price : 0),
                      )
                    : t('message.048')}
                </span>
                <strong>{total ? `¥ ${money(total)}` : t('message.049')}</strong>
              </div>
              <p className="quote-note">{t('message.050')}</p>
              {error && (
                <p className="form-error" role="alert">
                  {sourceText(error)}
                </p>
              )}
              <button className="button primary full" type="submit">
                {t('message.051')} {listing.mode === 'rent' ? t('message.022') : t('message.023')}{' '}
                {t('message.052')}
                <ArrowRight size={17} />
              </button>
              <p className="demo-form-note">
                <ShieldCheck size={15} />
                {t('message.053')}
              </p>
            </fieldset>
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
  const { t, sourceText, locale } = useI18n();
  const [contentLanguage, setContentLanguage] = useState<Locale>(locale);
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
      farm: t('message.054'),
      verified: false,
      hours: Number(data.get('hours')),
      year: Number(data.get('year')),
      power: String(data.get('power') || '').trim(),
      description: String(data.get('description') || '').trim(),
      image: images[category],
      tag: t('message.055'),
      createdAt: new Date().toISOString(),
    };
    if (!isListing(listing)) {
      setError(t('message.056'));
      return;
    }
    onPublish(submitListing(listing, contentLanguage));
  }
  return (
    <Modal title={t('message.057')} onClose={onClose}>
      <form className="publish-form" onSubmit={submit}>
        <p className="muted">{t('message.192')}</p>
        <label className="publish-language">
          {t('message.193')}
          <select
            value={contentLanguage}
            onChange={(event) => setContentLanguage(event.target.value as Locale)}
          >
            {languages.map((language) => (
              <option key={language.tag} value={language.tag} lang={language.tag}>
                {language.name}
              </option>
            ))}
          </select>
          <small>{t('message.194')}</small>
        </label>
        <div className="segmented publish-mode">
          <button
            type="button"
            className={mode === 'rent' ? 'active' : ''}
            onClick={() => setMode('rent')}
          >
            {t('message.059')}
          </button>
          <button
            type="button"
            className={mode === 'buy' ? 'active' : ''}
            onClick={() => setMode('buy')}
          >
            {t('message.060')}
          </button>
        </div>
        <div className="form-grid">
          <label className="span-two">
            {t('message.061')}
            <input dir="auto" name="title" required maxLength={60} placeholder={t('message.062')} />
          </label>
          <label>
            {t('message.063')}
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as Exclude<Category, 'all'>)}
            >
              {categories
                .filter((item) => item.id !== 'all')
                .map((item) => (
                  <option value={item.id} key={item.id}>
                    {sourceText(item.label)}
                  </option>
                ))}
            </select>
          </label>
          <label>
            {mode === 'rent' ? t('message.064') : t('message.065')}
            <input
              name="price"
              type="number"
              min="1"
              max="100000000"
              step="1"
              placeholder={mode === 'rent' ? t('message.066') : t('message.067')}
              required
            />
          </label>
          <label>
            {t('message.068')}
            <input
              dir="auto"
              name="location"
              placeholder={t('message.069')}
              required
              maxLength={40}
            />
          </label>
          <label>
            {t('message.033')}
            <input dir="auto" name="power" placeholder={t('message.070')} required maxLength={40} />
          </label>
          <label>
            {t('message.031')}
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
            {t('message.071')}
            <input name="hours" type="number" min="0" max="100000" defaultValue={0} required />
          </label>
          <label className="span-two">
            {t('message.072')}
            <input
              dir="auto"
              name="subtitle"
              placeholder={t('message.073')}
              maxLength={100}
              required
            />
          </label>
          <label className="span-two">
            {t('message.074')}
            <textarea
              dir="auto"
              name="description"
              rows={3}
              maxLength={1000}
              placeholder={t('message.075')}
              required
            />
          </label>
        </div>
        <div className="publish-image-note">
          <img src={images[category]} alt={t('message.076')} />
          <p>
            {t('message.077')}
            <br />
            <span>{t('message.078')}</span>
          </p>
        </div>
        {error && (
          <p className="form-error" role="alert">
            {sourceText(error)}
          </p>
        )}
        <button type="submit" className="button primary full">
          <Plus size={18} />
          {t('message.191')}
        </button>
        <p className="demo-form-note">{t('message.080')}</p>
      </form>
    </Modal>
  );
}

export default function App() {
  const { t, sourceText, locale, localizeListing } = useI18n();
  const [state, setState] = useState<PersistedState>(loadState);
  const [view, setView] = useState<'market' | 'favorites' | 'farm' | 'settings' | 'admin'>(
    'market',
  );
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
    setActive(null);
    setToast('');
  }, [locale]);
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
  const allListings = useMemo(
    () => publicListings(state.listings).map(localizeListing),
    [state.listings, localizeListing],
  );
  const visibleFavoriteCount = allListings.filter((listing) =>
    state.favorites.includes(listing.id),
  ).length;
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
    setToast(exists ? t('message.081') : t('message.082'));
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
          <button
            className="brand"
            onClick={() => navigate('market')}
            aria-label={t('message.083')}
          >
            <span className="brand-symbol">
              <Sprout size={27} strokeWidth={1.7} />
            </span>
            <span className="brand-name">
              {t('message.084')}
              <small>HEJI</small>
            </span>
            <span className="brand-divider" />
            <span className="brand-description">{t('message.085')}</span>
          </button>
          <nav aria-label={t('message.086')}>
            <button
              className={view === 'market' ? 'active' : ''}
              onClick={() => navigate('market')}
            >
              {t('message.087')}
            </button>
            <button
              className={view === 'favorites' ? 'active' : ''}
              onClick={() => navigate('favorites')}
            >
              {t('message.088')}
              {visibleFavoriteCount > 0 && (
                <span className="nav-count">{visibleFavoriteCount}</span>
              )}
            </button>
            <button className={view === 'farm' ? 'active' : ''} onClick={() => navigate('farm')}>
              {t('message.089')}
            </button>
            <button
              className={view === 'settings' ? 'active' : ''}
              onClick={() => navigate('settings')}
            >
              <SettingsIcon size={15} />
              {sourceText('设置')}
            </button>
            <button className={view === 'admin' ? 'active' : ''} onClick={() => navigate('admin')}>
              <ShieldCheck size={15} />
              {sourceText('后台审核演示')}
            </button>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button quick-settings"
              onClick={() => navigate('settings')}
              aria-label={sourceText('语言与显示')}
            >
              <Languages size={20} />
            </button>
            <span className="demo-status">
              <i />
              Demo
            </span>
            <button className="button primary header-publish" onClick={() => setOverlay('publish')}>
              <Plus size={17} />
              <span>{t('message.090')}</span>
            </button>
            <button
              className="user-avatar"
              aria-label={t('message.091')}
              onClick={() => navigate('farm')}
            >
              <UserRound size={20} />
            </button>
          </div>
        </div>
      </header>
      <main>
        {view === 'settings' && (
          <Settings onExit={() => navigate('market')} onAdmin={() => navigate('admin')} />
        )}
        {view === 'admin' && (
          <ReviewDesk
            listings={state.listings}
            onReview={(id, decision, note) => {
              setState((current) => ({
                ...current,
                listings: current.listings.map((listing) =>
                  listing.id === id ? reviewListing(listing, decision, note) : listing,
                ),
              }));
            }}
            onLoadSamples={() => {
              setState((current) => ({
                ...current,
                listings: [
                  ...current.listings,
                  ...makeReviewSamples().filter(
                    (sample) => !current.listings.some((listing) => listing.id === sample.id),
                  ),
                ],
              }));
            }}
            onExit={() => navigate('market')}
          />
        )}

        {view === 'market' && (
          <section className="hero">
            <div className="hero-copy">
              <div className="hero-eyebrow">
                <span />
                {t('message.092')}
              </div>
              <h1>
                {t('message.093')}
                <br />
                {t('message.094')} <span>{t('message.095')}</span>
                <svg viewBox="0 0 310 18" aria-hidden="true">
                  <path d="M4 12Q140 0 303 9" />
                </svg>
              </h1>
              <p>
                {t('message.096')}
                <br />
                {t('message.097')}
              </p>
              <button
                className="hero-link"
                onClick={() => {
                  setMode('rent');
                  marketRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {t('message.098')}
                <ArrowRight size={18} />
              </button>
              <div className="hero-stats">
                <div>
                  <strong>{allListings.length.toString().padStart(2, '0')}</strong>
                  <span>{t('message.099')}</span>
                </div>
                <span className="stat-divider" />
                <div>
                  <strong>
                    {new Set(allListings.map((listing) => listing.farm)).size
                      .toString()
                      .padStart(2, '0')}
                  </strong>
                  <span>{t('message.100')}</span>
                </div>
                <span className="stat-divider" />
                <div>
                  <strong>{t('message.101')}</strong>
                  <span>{t('message.102')}</span>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              <img src="/images/tractor.webp" alt={t('message.103')} fetchPriority="high" />
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
                  {t('message.104')}
                  <small>A new season. A new possibility.</small>
                </div>
              </div>
              <span className="hero-photo-caption">{t('message.105')}</span>
            </div>
          </section>
        )}
        {view === 'favorites' && (
          <section className="page-intro">
            <span className="eyebrow">YOUR COLLECTION</span>
            <h1>{t('message.106')}</h1>
            <p>{t('message.107')}</p>
          </section>
        )}
        {(view === 'market' || view === 'favorites') && (
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
                  aria-label={t('message.108')}
                  placeholder={t('message.109')}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query && (
                  <button
                    type="button"
                    className="icon-button clear-search"
                    onClick={() => setQuery('')}
                    aria-label={t('message.110')}
                  >
                    <X size={16} />
                  </button>
                )}
                <span className="search-divider" />
                <div className="region-select">
                  <MapPin size={17} />
                  <select
                    aria-label={t('message.111')}
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                  >
                    <option value="all">{t('message.112')}</option>
                    {locations.map((region) => (
                      <option value={region} key={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
                <button type="submit" className="button primary search-button">
                  {t('message.113')}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
            <div className="category-tabs" aria-label={t('message.114')}>
              {categories.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  className={category === id ? 'active' : ''}
                  onClick={() => setCategory(id)}
                  aria-pressed={category === id}
                >
                  <Icon size={21} strokeWidth={1.7} />
                  {sourceText(label)}
                  {id === 'all' && <span>{allListings.length}</span>}
                </button>
              ))}
            </div>
            <div className="market-toolbar">
              <div className="market-heading">
                <h2>{view === 'favorites' ? t('message.088') : t('message.115')}</h2>
                <span>
                  {visible.length} {t('message.116')}
                  {view === 'market' && t('message.117')}
                </span>
              </div>
              <div className="toolbar-controls">
                <div className="segmented" aria-label={t('message.118')}>
                  {(['all', 'rent', 'buy'] as TradeMode[]).map((value) => (
                    <button
                      key={value}
                      className={mode === value ? 'active' : ''}
                      aria-pressed={mode === value}
                      onClick={() => setMode(value)}
                    >
                      {value === 'all'
                        ? t('message.119')
                        : value === 'rent'
                          ? t('message.120')
                          : t('message.121')}
                    </button>
                  ))}
                </div>
                <div className="sort-select">
                  <ArrowDownUp size={15} />
                  <select
                    aria-label={t('message.122')}
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortOrder)}
                  >
                    <option value="recommended">{t('message.123')}</option>
                    <option value="newest">{t('message.124')}</option>
                    <option value="price-asc" disabled={mode === 'all'}>
                      {t('message.125')}
                    </option>
                    <option value="price-desc" disabled={mode === 'all'}>
                      {t('message.126')}
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
                  {view === 'favorites' && !visibleFavoriteCount
                    ? t('message.127')
                    : t('message.128')}
                </h3>
                <p>
                  {view === 'favorites' && !visibleFavoriteCount
                    ? t('message.129')
                    : t('message.130')}
                </p>
                <button
                  className="button secondary"
                  onClick={() => {
                    resetFilters();
                    if (view === 'favorites' && !visibleFavoriteCount) navigate('market');
                  }}
                >
                  {view === 'favorites' && !visibleFavoriteCount
                    ? t('message.131')
                    : t('message.132')}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            <p className="results-note">
              <SlidersHorizontal size={13} />
              {mode === 'all' ? t('message.133') : t('message.134')}
            </p>
          </section>
        )}
        {view === 'farm' && (
          <section className="farm-page">
            <div className="farm-page-heading">
              <div>
                <span className="eyebrow">MY FARM · DEMO</span>
                <h1>{t('message.054')}</h1>
                <p>{t('message.135')}</p>
              </div>
              <button className="button primary" onClick={() => setOverlay('publish')}>
                <Plus size={18} />
                {t('message.090')}
              </button>
            </div>
            <div className="farm-stats">
              <div>
                <Warehouse size={22} />
                <span>
                  {t('message.136')}
                  <strong>{state.listings.length}</strong>
                </span>
              </div>
              <div>
                <CalendarDays size={22} />
                <span>
                  {t('message.137')}
                  <strong>{state.bookings.length}</strong>
                </span>
              </div>
              <div>
                <Heart size={22} />
                <span>
                  {t('message.138')}
                  <strong>{visibleFavoriteCount}</strong>
                </span>
              </div>
            </div>
            <div className="section-heading">
              <h2>{t('message.139')}</h2>
              <span>{t('message.140')}</span>
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
                          ? sourceText('{start} 至 {end}')
                              .replace('{start}', booking.startDate || '')
                              .replace('{end}', booking.endDate || '')
                          : t('message.141')}{' '}
                        · {booking.contactName}
                      </p>
                      <small>{booking.id}</small>
                    </div>
                    <span className="pending-badge">{t('message.142')}</span>
                    <strong>¥ {money(booking.total)}</strong>
                    <button
                      className="icon-button"
                      aria-label={sourceText('移除{title}意向').replace(
                        '{title}',
                        booking.listingTitle,
                      )}
                      onClick={() => {
                        setState((current) => ({
                          ...current,
                          bookings: current.bookings.filter((item) => item.id !== booking.id),
                        }));
                        setToast(t('message.143'));
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
                <h3>{t('message.144')}</h3>
                <p>{t('message.145')}</p>
                <button className="button secondary" onClick={() => navigate('market')}>
                  {t('message.146')}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
            <div className="section-heading">
              <h2>{t('message.147')}</h2>
              <span>
                {state.listings.length} {t('message.116')}
              </span>
            </div>
            {state.listings.length ? (
              <div className="listing-grid">{cards(state.listings)}</div>
            ) : (
              <div className="publish-empty">
                <Sprout size={30} />
                <div>
                  <h3>{t('message.148')}</h3>
                  <p>{t('message.149')}</p>
                </div>
                <button className="button secondary" onClick={() => setOverlay('publish')}>
                  <Plus size={16} />
                  {t('message.150')}
                </button>
              </div>
            )}
          </section>
        )}
        {view !== 'admin' && view !== 'settings' && (
          <section className="values-strip">
            <div>
              <span className="value-icon">
                <Sprout size={25} />
              </span>
              <div>
                <h3>{t('message.151')}</h3>
                <p>{t('message.152')}</p>
              </div>
            </div>
            <div>
              <span className="value-icon">
                <ShieldCheck size={25} />
              </span>
              <div>
                <h3>{t('message.153')}</h3>
                <p>{t('message.154')}</p>
              </div>
            </div>
            <div>
              <span className="value-icon">
                <Tractor size={26} />
              </span>
              <div>
                <h3>{t('message.155')}</h3>
                <p>{t('message.156')}</p>
              </div>
            </div>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <div>
          <span className="footer-brand">
            <Sprout size={20} />
            {t('message.084')}
            <small>HEJI</small>
          </span>
          <span>{t('message.157')}</span>
        </div>
        <div>
          <span className="footer-demo">{t('message.158')}</span>
          <button onClick={() => navigate('settings')}>
            <Languages size={14} />
            {sourceText('设置')}
          </button>
          <button onClick={() => setOverlay('about')}>
            <CircleHelp size={14} />
            {t('message.159')}
          </button>
          <button onClick={() => setOverlay('reset')}>{t('message.160')}</button>
        </div>
      </footer>
      {storageError && (
        <div className="storage-warning" role="alert">
          {t('message.161')}
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
            setToast(t('message.162'));
          }}
        />
      )}
      {overlay === 'about' && (
        <Modal title={t('message.163')} onClose={() => setOverlay(null)}>
          <div className="about-content">
            <p>{t('message.164')}</p>
            <ul>
              <li>{t('message.165')}</li>
              <li>{t('message.166')}</li>
              <li>{t('message.167')}</li>
            </ul>
            <p>{t('message.168')}</p>
            <p>{t('message.169')}</p>
            <button className="button primary full" onClick={() => setOverlay(null)}>
              {t('message.170')}
              <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
      {overlay === 'reset' && (
        <Modal title={t('message.171')} onClose={() => setOverlay(null)}>
          <div className="about-content">
            <p>{t('message.172')}</p>
            <div className="modal-actions">
              <button className="button secondary" onClick={() => setOverlay(null)}>
                {t('message.173')}
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setState({ favorites: [], listings: [], bookings: [] });
                  setOverlay(null);
                  navigate('market');
                  setToast(t('message.174'));
                }}
              >
                {t('message.175')}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
