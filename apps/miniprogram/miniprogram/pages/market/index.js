const domain = require('../../utils/domain');
const view = require('../../utils/page');

Page({
  data: {
    ...view.initialData,
    query: '',
    category: 'all',
    mode: 'all',
    region: 'all',
    sort: 'recommended',
    savedOnly: false,
    listings: [],
    error: '',
  },
  onShow() {
    const state = view.refresh(this, 'find', 0);
    this.setData({
      categories: ['all', ...domain.categories].map((id) => ({ id, label: this.data.ui[id] })),
      modes: ['all', 'rent', 'buy'].map((id) => ({ id, label: this.data.ui[id] })),
      regions: [this.data.ui.regionAll, '新疆', '山东', '江苏', '安徽', '河南'],
      sorts: ['recommended', 'newest', 'priceAsc', 'priceDesc'].map((id) => ({
        id,
        label: this.data.ui[id],
      })),
      favorites: state.favorites,
    });
    this.updateResults();
  },
  updateResults() {
    const state = getApp().demo.get();
    const listings = domain
      .filterListings({ ...this.data, favorites: state.favorites })
      .map((item) => ({
        ...view.present(item, state.locale),
        saved: state.favorites.includes(item.id),
      }));
    this.setData({ listings, count: listings.length, error: '' });
  },
  search(event) {
    this.setData({ query: event.detail.value });
    this.updateResults();
  },
  clearSearch() {
    this.setData({ query: '' });
    this.updateResults();
  },
  selectCategory(event) {
    this.setData({ category: event.currentTarget.dataset.id });
    this.updateResults();
  },
  selectMode(event) {
    this.setData({ mode: event.currentTarget.dataset.id, sort: 'recommended', sortIndex: 0 });
    this.updateResults();
  },
  selectRegion(event) {
    const index = Number(event.detail.value);
    this.setData({ regionIndex: index, region: index ? this.data.regions[index] : 'all' });
    this.updateResults();
  },
  selectSort(event) {
    const index = Number(event.detail.value);
    if (this.data.mode === 'all' && index > 1) {
      wx.showModal({
        title: this.data.ui.priceAsc,
        content: this.data.ui.priceNote,
        showCancel: false,
        confirmText: this.data.ui.confirm,
      });
      return;
    }
    this.setData({ sortIndex: index, sort: this.data.sorts[index].id });
    this.updateResults();
  },
  clearFilters() {
    this.setData({
      query: '',
      category: 'all',
      mode: 'all',
      region: 'all',
      sort: 'recommended',
      savedOnly: false,
      sortIndex: 0,
      regionIndex: 0,
    });
    this.updateResults();
  },
  onReset() {
    this.setData({
      query: '',
      category: 'all',
      mode: 'all',
      region: 'all',
      sort: 'recommended',
      savedOnly: false,
      sortIndex: 0,
      regionIndex: 0,
    });
  },
  toggleSaved() {
    this.setData({ savedOnly: !this.data.savedOnly });
    this.updateResults();
  },
  open(event) {
    wx.navigateTo({ url: '/pages/detail/index?id=' + encodeURIComponent(event.detail.id) });
  },
  favorite(event) {
    try {
      getApp().demo.toggleFavorite(event.detail.id);
      this.updateResults();
    } catch (exception) {
      view.error(this, exception);
    }
  },
  settings() {
    wx.navigateTo({ url: '/pages/settings/index' });
  },
});
