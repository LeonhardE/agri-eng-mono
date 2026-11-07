const domain = require('../../utils/domain');
const view = require('../../utils/page');

Page({
  data: {
    ...view.initialData,
    item: null,
    start: '',
    end: '',
    total: '',
    days: 0,
    error: '',
    saved: false,
  },
  onLoad(query) {
    this.id = query.id;
  },
  onShow() {
    const state = view.refresh(this, 'intentTitle');
    const item = domain.seeds.find((seed) => seed.id === this.id);
    this.setData({ item: item ? view.present(item, state.locale) : null, today: domain.today() });
    this.calculate();
  },
  date(event) {
    const field = event.currentTarget.dataset.field;
    if (field === 'start' || field === 'end')
      this.setData({ [field]: event.detail.value, error: '' });
    this.calculate();
  },
  calculate() {
    if (!this.data.item) return;
    if (this.data.item.mode === 'buy') {
      this.setData({ total: domain.money(this.data.item.price), days: 0 });
      return;
    }
    try {
      const result = domain.rentalTotal(this.data.item.price, this.data.start, this.data.end);
      this.setData({ total: domain.money(result.total), days: result.days });
    } catch {
      this.setData({ total: '', days: 0 });
    }
  },
  submit() {
    if (this.data.saved) return;
    try {
      getApp().demo.addIntent(this.id, { start: this.data.start, end: this.data.end });
      this.setData({ saved: true, error: '' });
    } catch (exception) {
      view.error(this, exception);
    }
  },
  mine() {
    wx.switchTab({ url: '/pages/mine/index' });
  },
  onReset() {
    this.setData({ start: '', end: '', saved: false, error: '' });
  },
  back() {
    wx.switchTab({ url: '/pages/market/index' });
  },
});
