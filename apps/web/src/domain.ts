export type Category = 'all' | 'tractor' | 'harvester' | 'implement' | 'drone';
export type TradeMode = 'all' | 'rent' | 'buy';
export type SortOrder = 'recommended' | 'price-asc' | 'price-desc' | 'newest';
export type ContentLanguage = 'zh-CN' | 'ug-CN' | 'kk-Arab-CN';
export type ReviewDecision = 'approved' | 'rejected';

export interface ReviewEvent {
  decision: ReviewDecision;
  note: string;
  reviewedAt: string;
  reviewer: string;
  revision: number;
}

export interface Moderation {
  status: 'pending_review' | ReviewDecision;
  submittedAt: string;
  history: ReviewEvent[];
}

/** Demo amounts are whole Chinese yuan, not payment-provider minor units. */
export interface Listing {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<Category, 'all'>;
  mode: Exclude<TradeMode, 'all'>;
  price: number;
  location: string;
  farm: string;
  verified: boolean;
  hours: number;
  year: number;
  power: string;
  image: string;
  tag?: string;
  description: string;
  specs?: Record<string, string>;
  createdAt: string;
  contentLanguage?: ContentLanguage;
  revision?: number;
  moderation?: Moderation;
}

export interface ListingFilters {
  query: string;
  category: Category;
  mode: TradeMode;
  sort: SortOrder;
  location?: string;
}

export interface BookingInput {
  startDate?: string;
  endDate?: string;
  contactName: string;
  contactPhone: string;
}

export interface Booking extends BookingInput {
  id: string;
  listingId: string;
  listingTitle: string;
  mode: 'rent' | 'buy';
  total: number;
  status: 'requested';
  createdAt: string;
}

export interface PersistedState {
  favorites: string[];
  listings: Listing[];
  bookings: Booking[];
}

export const seedListings: Listing[] = [
  {
    id: 'tractor-01',
    title: '约翰迪尔 6B-1204 拖拉机',
    subtitle: '120 马力 · 四轮驱动 · 可配旋耕机',
    category: 'tractor',
    mode: 'rent',
    price: 680,
    location: '山东 · 潍坊',
    farm: '青禾家庭农场',
    verified: true,
    hours: 860,
    year: 2023,
    power: '120 马力',
    image: '/images/tractor.webp',
    tag: '农忙优选',
    description:
      '适合春耕、旋耕与播种作业，保养记录齐全。可在农场交接，具体运输与农具配置需双方确认。',
    specs: { 驱动形式: '四轮驱动', 额定功率: '88.2 kW', 交接方式: '农场自提 / 协商配送' },
    createdAt: '2026-10-30T08:00:00.000Z',
  },
  {
    id: 'harvester-01',
    title: '久保田 PRO988Q 收割机',
    subtitle: '全喂入式 · 水稻小麦两用',
    category: 'harvester',
    mode: 'rent',
    price: 1280,
    location: '江苏 · 盐城',
    farm: '丰穗农业合作社',
    verified: true,
    hours: 620,
    year: 2024,
    power: '98 马力',
    image: '/images/harvester.webp',
    tag: '成色精选',
    description:
      '履带式收割机，适合水稻与小麦收获。租期、作物适配及运输费用请在提交意向后与农场确认。',
    specs: { 行走方式: '履带式', 适用作物: '水稻 / 小麦', 工作幅宽: '2.2 m' },
    createdAt: '2026-10-29T08:00:00.000Z',
  },
  {
    id: 'drone-01',
    title: '大疆 T50 农业无人飞机',
    subtitle: '植保喷洒 · 智能作业规划',
    category: 'drone',
    mode: 'rent',
    price: 480,
    location: '安徽 · 合肥',
    farm: '禾野智慧农场',
    verified: true,
    hours: 210,
    year: 2024,
    power: '40 kg 载重',
    image: '/images/drone.webp',
    tag: '轻松租用',
    description:
      '适用于农田植保喷洒，演示租金仅含设备。飞手资质、电池套件、农药与作业服务需另行确认。',
    specs: { 喷洒载重: '40 kg', 设备用途: '农田植保', 配套服务: '与农场协商' },
    createdAt: '2026-10-31T08:00:00.000Z',
  },
  {
    id: 'tractor-02',
    title: '雷沃 M704-E 拖拉机',
    subtitle: '70 马力 · 个人一手 · 定期保养',
    category: 'tractor',
    mode: 'buy',
    price: 56800,
    location: '河南 · 新乡',
    farm: '田园里家庭农场',
    verified: true,
    hours: 1250,
    year: 2022,
    power: '70 马力',
    image: '/images/tractor.webp',
    tag: '一手设备',
    description:
      '农场自用拖拉机，因设备升级出售。支持线下看机，最终成交价与设备状态以双方验机确认为准。',
    specs: { 驱动形式: '四轮驱动', 设备来源: '农场自用', 看机方式: '预约到场' },
    createdAt: '2026-10-28T08:00:00.000Z',
  },
  {
    id: 'implement-01',
    title: '东方红 1GQN-230 旋耕机',
    subtitle: '2.3 米幅宽 · 配套 80–120 马力',
    category: 'implement',
    mode: 'rent',
    price: 180,
    location: '山东 · 潍坊',
    farm: '青禾家庭农场',
    verified: true,
    hours: 460,
    year: 2023,
    power: '幅宽 2.3 m',
    image: '/images/implement.webp',
    description:
      '适合旱地整地与碎土，刀片状态良好。请提前确认拖拉机挂接规格，运输和安装由双方约定。',
    specs: { 作业幅宽: '2.3 m', 适配动力: '80–120 马力', 用途: '旋耕 / 整地' },
    createdAt: '2026-10-27T08:00:00.000Z',
  },
  {
    id: 'harvester-02',
    title: '沃得 锐龙 4LZ-6.0 收割机',
    subtitle: '6 kg/s 喂入量 · 可预约验机',
    category: 'harvester',
    mode: 'buy',
    price: 89600,
    location: '江苏 · 盐城',
    farm: '丰穗农业合作社',
    verified: true,
    hours: 980,
    year: 2022,
    power: '102 马力',
    image: '/images/harvester.webp',
    description: '合作社自用收割设备，适合水稻、小麦收获。可提供维护记录，欢迎预约现场验机。',
    specs: { 喂入量: '6 kg/s', 行走方式: '履带式', 适用作物: '水稻 / 小麦' },
    createdAt: '2026-10-26T08:00:00.000Z',
  },
  {
    id: 'tractor-03',
    title: '东方红 LX904 拖拉机',
    subtitle: '90 马力 · 耕整地多面手',
    category: 'tractor',
    mode: 'rent',
    price: 520,
    location: '黑龙江 · 佳木斯',
    farm: '北大荒丰收农场',
    verified: false,
    hours: 720,
    year: 2023,
    power: '90 马力',
    image: '/images/tractor.webp',
    description:
      '适用于耕整地、播种与田间运输。当前信息为农场自行发布，请在交易前确认设备与农场资质。',
    specs: { 驱动形式: '四轮驱动', 配套农具: '可协商', 交接方式: '农场自提' },
    createdAt: '2026-10-25T08:00:00.000Z',
  },
  {
    id: 'implement-02',
    title: '大华宝来 2BMQF-4 播种机',
    subtitle: '四行播种 · 玉米免耕施肥',
    category: 'implement',
    mode: 'buy',
    price: 16800,
    location: '河南 · 新乡',
    farm: '田园里家庭农场',
    verified: true,
    hours: 180,
    year: 2024,
    power: '4 行播种',
    image: '/images/implement.webp',
    tag: '近期上架',
    description: '适合玉米免耕精量播种，配套施肥功能。作业前需根据土壤与种子规格完成调试。',
    specs: { 播种行数: '4 行', 适用作物: '玉米', 功能: '免耕 / 播种 / 施肥' },
    createdAt: '2026-11-01T08:00:00.000Z',
  },
];

const contentLanguages: readonly string[] = ['zh-CN', 'ug-CN', 'kk-Arab-CN'];

/** Demo-only state transition. Production authorization belongs on the server. */
export function submitListing(
  listing: Listing,
  language: ContentLanguage,
  now = new Date(),
): Listing {
  if (!isListing(listing) || !contentLanguages.includes(language)) {
    throw new Error('设备信息无效，请刷新后重试');
  }
  return {
    ...listing,
    contentLanguage: language,
    revision: (listing.revision ?? 0) + 1,
    moderation: {
      status: 'pending_review',
      submittedAt: now.toISOString(),
      history: listing.moderation?.history ?? [],
    },
  };
}

export function reviewListing(
  listing: Listing,
  decision: ReviewDecision,
  note: string,
  now = new Date(),
): Listing {
  if (!isListing(listing) || listing.moderation?.status !== 'pending_review') {
    throw new Error('仅可审核待审信息，请刷新队列');
  }
  if (decision !== 'approved' && decision !== 'rejected') throw new Error('审核操作无效');
  const reason = note.trim();
  if (reason.length > 1000) throw new Error('审核备注不能超过 1000 字');
  if (decision === 'rejected' && !reason) throw new Error('请填写退回原因，方便发布者修改');
  const event: ReviewEvent = {
    decision,
    note: reason,
    reviewedAt: now.toISOString(),
    reviewer: '演示审核员',
    revision: listing.revision!,
  };
  return {
    ...listing,
    moderation: {
      ...listing.moderation,
      status: decision,
      history: [...listing.moderation.history, event],
    },
  };
}

function hasCurrentApproval(listing: Listing): boolean {
  const latest = listing.moderation?.history.at(-1);
  return (
    listing.moderation?.status === 'approved' &&
    latest?.decision === 'approved' &&
    latest.revision === listing.revision
  );
}

/** All discovery surfaces use this list, including saved-item results. */
export function publicListings(localListings: readonly Listing[]): Listing[] {
  const seedIds = new Set(seedListings.map(({ id }) => id));
  return [
    ...uniqueById(
      localListings.filter((listing) => !seedIds.has(listing.id) && hasCurrentApproval(listing)),
    ),
    ...seedListings,
  ];
}

/** Fictional submissions loaded only when the reviewer asks to try the queue. */
export function makeReviewSamples(now = new Date()): Listing[] {
  const samples: {
    language: ContentLanguage;
    title: string;
    subtitle: string;
    description: string;
  }[] = [
    {
      language: 'zh-CN',
      title: '东方红 LX904 拖拉机',
      subtitle: '新疆演示供给 · 出租信息待人工核验',
      description:
        '虚构审核样例：90 马力拖拉机出租。请核对机况、价格、交接方式与图片，专业团队确认后才能公开。',
    },
    {
      language: 'ug-CN',
      title: 'LX904 تىراكتور ئىجارە',
      subtitle: '90 ئات كۈچى · كۆرگەزمە ئۇچۇرى',
      description:
        'بۇ پەقەت كۆرگەزمە ئۇچۇرى. ئۈسكۈنىنىڭ ئەھۋالى ۋە ئىجارە شەرتلىرىنى تەكشۈرۈش كېرەك.',
    },
    {
      language: 'kk-Arab-CN',
      title: 'LX904 تراكتور ساتىلادى',
      subtitle: '90 ات كۇشى · ۇلگى حابارلانۋ',
      description: 'بۇل تەك ۇلگى حابارلانۋ. تەحنيكانىڭ جاعدايى مەن باعاسىن تەكسەرۋ كەرەك.',
    },
  ];
  return samples.map((sample, index) =>
    submitListing(
      {
        ...seedListings[6]!,
        id: `review-sample-${sample.language}`,
        title: sample.title,
        subtitle: sample.subtitle,
        description: sample.description,
        farm: '新疆示例农场',
        location: '新疆 · 伊犁',
        mode: index === 2 ? 'buy' : 'rent',
        price: index === 2 ? 56000 : 520,
        verified: false,
        tag: '审核演示样例',
        createdAt: now.toISOString(),
      },
      sample.language,
      now,
    ),
  );
}

export function filterListings(listings: readonly Listing[], filters: ListingFilters): Listing[] {
  const query = filters.query.trim().toLocaleLowerCase('zh-CN');
  const location = filters.location?.trim();
  const result = listings.filter(
    (listing) =>
      (filters.category === 'all' || listing.category === filters.category) &&
      (filters.mode === 'all' || listing.mode === filters.mode) &&
      (!location || location === 'all' || listing.location.includes(location)) &&
      (!query ||
        [listing.title, listing.subtitle, listing.farm, listing.location].some((value) =>
          value.toLocaleLowerCase('zh-CN').includes(query),
        )),
  );
  if (filters.sort === 'price-asc') return result.sort((a, b) => a.price - b.price);
  if (filters.sort === 'price-desc') return result.sort((a, b) => b.price - a.price);
  if (filters.sort === 'newest')
    return result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return result;
}

function parseCalendarDate(value: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('请选择有效日期');
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== value) {
    throw new Error('请选择有效日期');
  }
  return timestamp;
}

export function calculateRentalTotal(dailyPrice: number, startISO: string, endISO: string): number {
  if (!Number.isSafeInteger(dailyPrice) || dailyPrice <= 0) throw new Error('日租金必须为正整数');
  const start = parseCalendarDate(startISO);
  const end = parseCalendarDate(endISO);
  if (end < start) throw new Error('结束日期不能早于开始日期');
  const days = (end - start) / 86_400_000 + 1;
  const total = dailyPrice * days;
  if (!Number.isSafeInteger(total)) throw new Error('租金金额超出有效范围');
  return total;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown, max = 500): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}

function isModeration(value: unknown, revision: unknown): value is Moderation {
  if (!isRecord(value) || !Number.isSafeInteger(revision) || (revision as number) < 1) return false;
  if (
    !['pending_review', 'approved', 'rejected'].includes(String(value.status)) ||
    typeof value.submittedAt !== 'string' ||
    !Number.isFinite(Date.parse(value.submittedAt)) ||
    !Array.isArray(value.history)
  )
    return false;
  if (
    !value.history.every(
      (event) =>
        isRecord(event) &&
        (event.decision === 'approved' || event.decision === 'rejected') &&
        typeof event.note === 'string' &&
        event.note.length <= 1000 &&
        (event.decision !== 'rejected' || event.note.trim().length > 0) &&
        isText(event.reviewer, 80) &&
        typeof event.reviewedAt === 'string' &&
        Number.isFinite(Date.parse(event.reviewedAt)) &&
        Number.isSafeInteger(event.revision) &&
        (event.revision as number) >= 1 &&
        (event.revision as number) <= (revision as number),
    )
  )
    return false;
  if (value.status === 'pending_review') return true;
  const latest = value.history.at(-1);
  return latest?.decision === value.status && latest?.revision === revision;
}

const categories: readonly string[] = ['tractor', 'harvester', 'implement', 'drone'];

/** Browser storage is untrusted: validate every item before using it as a listing. */
export function isListing(value: unknown): value is Listing {
  if (!isRecord(value)) return false;
  return (
    isText(value.id, 100) &&
    isText(value.title, 100) &&
    isText(value.subtitle, 200) &&
    typeof value.category === 'string' &&
    categories.includes(value.category) &&
    (value.mode === 'rent' || value.mode === 'buy') &&
    typeof value.price === 'number' &&
    Number.isSafeInteger(value.price) &&
    value.price > 0 &&
    isText(value.location, 100) &&
    isText(value.farm, 100) &&
    typeof value.verified === 'boolean' &&
    typeof value.hours === 'number' &&
    Number.isFinite(value.hours) &&
    value.hours >= 0 &&
    typeof value.year === 'number' &&
    Number.isInteger(value.year) &&
    value.year >= 1950 &&
    value.year <= 2100 &&
    isText(value.power, 100) &&
    typeof value.image === 'string' &&
    /^\/images\/[a-z0-9-]+\.webp$/.test(value.image) &&
    (value.tag === undefined || isText(value.tag, 40)) &&
    isText(value.description, 2000) &&
    (value.contentLanguage === undefined ||
      contentLanguages.includes(String(value.contentLanguage))) &&
    (value.revision === undefined ||
      (Number.isSafeInteger(value.revision) && (value.revision as number) >= 1)) &&
    (value.moderation === undefined || isModeration(value.moderation, value.revision)) &&
    (value.specs === undefined ||
      (isRecord(value.specs) &&
        Object.entries(value.specs).every(
          ([key, item]) => isText(key, 100) && isText(item, 200),
        ))) &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt))
  );
}

export function createBooking(listing: Listing, input: BookingInput, now = new Date()): Booking {
  if (!isListing(listing)) throw new Error('设备信息无效，请刷新后重试');
  const isFixture = !listing.moderation && seedListings.some(({ id }) => id === listing.id);
  if (!isFixture && !hasCurrentApproval(listing)) {
    throw new Error('设备尚未通过人工审核，暂不能提交交易意向');
  }
  if (!isText(input.contactName, 40)) throw new Error('请填写联系人姓名（最多 40 字）');
  const phone = input.contactPhone.trim();
  if (!/^1[3-9]\d{9}$/.test(phone)) throw new Error('请填写有效的中国大陆手机号');
  let total = listing.price;
  if (listing.mode === 'rent') {
    if (!input.startDate || !input.endDate) throw new Error('请选择租用起止日期');
    total = calculateRentalTotal(listing.price, input.startDate, input.endDate);
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (input.startDate < today) throw new Error('开始日期不能早于今天');
  }
  return {
    id: `demo-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    listingId: listing.id,
    listingTitle: listing.title,
    mode: listing.mode,
    total,
    status: 'requested',
    createdAt: now.toISOString(),
    contactName: input.contactName.trim(),
    contactPhone: phone,
    ...(listing.mode === 'rent' ? { startDate: input.startDate, endDate: input.endDate } : {}),
  };
}

function isBooking(value: unknown): value is Booking {
  if (!isRecord(value)) return false;
  if (!(
    isText(value.id, 100) &&
    isText(value.listingId, 100) &&
    isText(value.listingTitle, 100) &&
    (value.mode === 'rent' || value.mode === 'buy') &&
    typeof value.total === 'number' &&
    Number.isSafeInteger(value.total) &&
    value.total > 0 &&
    value.status === 'requested' &&
    typeof value.createdAt === 'string' &&
    Number.isFinite(Date.parse(value.createdAt)) &&
    isText(value.contactName, 40) &&
    typeof value.contactPhone === 'string' &&
    /^1[3-9]\d{9}$/.test(value.contactPhone)
  ))
    return false;
  if (value.mode === 'rent') {
    if (typeof value.startDate !== 'string' || typeof value.endDate !== 'string') return false;
    try {
      return parseCalendarDate(value.endDate) >= parseCalendarDate(value.startDate);
    } catch {
      return false;
    }
  }
  return value.startDate === undefined && value.endDate === undefined;
}

export function parsePersistedState(raw: string | null): PersistedState {
  const empty = (): PersistedState => ({ favorites: [], listings: [], bookings: [] });
  if (!raw) return empty();
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return empty();
    return {
      favorites: Array.isArray(value.favorites)
        ? [...new Set(value.favorites.filter((item): item is string => isText(item, 100)))].slice(
            0,
            1000,
          )
        : [],
      listings: Array.isArray(value.listings)
        ? uniqueById(value.listings.filter(isListing))
            .slice(0, 1000)
            .map((listing) =>
              listing.moderation
                ? listing
                : submitListing(
                    listing,
                    listing.contentLanguage ?? 'zh-CN',
                    new Date(listing.createdAt),
                  ),
            )
        : [],
      bookings: Array.isArray(value.bookings)
        ? uniqueById(value.bookings.filter(isBooking)).slice(0, 1000)
        : [],
    };
  } catch {
    return empty();
  }
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}
