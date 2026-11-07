const domain = require('../../utils/domain');
const view = require('../../utils/page');

Page({
  data: {
    ...view.initialData,
    section: 'intents',
    error: '',
    intents: [],
    listings: [],
    favorites: [],
  },
  onShow() {
    const state = view.refresh(this, 'mine', 2);
    this.setData({
      intents: state.intents.map((intent) => ({
        ...intent,
        item: view.present(
          domain.seeds.find((item) => item.id === intent.listingId),
          state.locale,
        ),
        totalText: domain.money(intent.total),
      })),
      listings: state.listings.map((item) => ({
        ...view.present(item, state.locale),
        image: '/assets/images/' + item.category + '.jpg',
      })),
      favorites: domain.seeds
        .filter((item) => state.favorites.includes(item.id))
        .map((item) => view.present(item, state.locale)),
    });
  },
  section(event) {
    this.setData({ section: event.currentTarget.dataset.id, error: '' });
  },
  onReset() {
    this.setData({ section: 'intents', error: '' });
  },
  removeIntent(event) {
    view.confirmRemove(this, () => getApp().demo.removeIntent(event.currentTarget.dataset.id));
  },
  removeListing(event) {
    view.confirmRemove(this, () => getApp().demo.removeListing(event.currentTarget.dataset.id));
  },
  favorite(event) {
    try {
      getApp().demo.toggleFavorite(event.detail.id);
      this.onShow();
    } catch (exception) {
      view.error(this, exception);
    }
  },
  open(event) {
    wx.navigateTo({ url: '/pages/detail/index?id=' + encodeURIComponent(event.detail.id) });
  },
  find() {
    wx.switchTab({ url: '/pages/market/index' });
  },
  publish() {
    wx.switchTab({ url: '/pages/publish/index' });
  },
  settings() {
    wx.navigateTo({ url: '/pages/settings/index' });
  },
});
