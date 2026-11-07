const domain = require('../../utils/domain');
const i18n = require('../../utils/i18n');
const view = require('../../utils/page');

Page({
  data: {
    ...view.initialData,
    form: {
      title: '',
      price: '',
      location: '',
      description: '',
      category: 'tractor',
      mode: 'rent',
      contentLanguage: 'zh',
    },
    categoryIndex: 0,
    languageIndex: 0,
    error: '',
    saved: false,
  },
  onShow() {
    view.refresh(this, 'publish', 1);
    this.setData({
      categories: domain.categories.map((id) => ({ id, label: this.data.ui[id] })),
      languages: i18n.languages,
    });
  },
  input(event) {
    const field = event.currentTarget.dataset.field;
    if (['title', 'price', 'location', 'description'].includes(field))
      this.setData({ ['form.' + field]: event.detail.value, error: '' });
  },
  mode(event) {
    this.setData({ 'form.mode': event.currentTarget.dataset.mode });
  },
  category(event) {
    const index = Number(event.detail.value);
    this.setData({ categoryIndex: index, 'form.category': domain.categories[index] });
  },
  language(event) {
    const index = Number(event.detail.value);
    this.setData({ languageIndex: index, 'form.contentLanguage': i18n.languages[index].id });
  },
  sample() {
    this.setData({
      form: {
        title: '演示 LX904 拖拉机',
        price: '500',
        location: '新疆 · 伊犁',
        description: '虚构设备：90 马力，四轮驱动。仅用于演示，不代表真实供给。',
        category: 'tractor',
        mode: 'rent',
        contentLanguage: 'zh',
      },
      categoryIndex: 0,
      languageIndex: 0,
      error: '',
    });
  },
  submit() {
    if (this.data.saved) return;
    try {
      getApp().demo.addListing(this.data.form);
      this.setData({
        saved: true,
        error: '',
        form: {
          title: '',
          price: '',
          location: '',
          description: '',
          category: 'tractor',
          mode: 'rent',
          contentLanguage: 'zh',
        },
        categoryIndex: 0,
        languageIndex: 0,
      });
    } catch (exception) {
      view.error(this, exception);
    }
  },
  again() {
    this.setData({ saved: false });
  },
  onReset() {
    this.setData({
      form: {
        title: '',
        price: '',
        location: '',
        description: '',
        category: 'tractor',
        mode: 'rent',
        contentLanguage: 'zh',
      },
      categoryIndex: 0,
      languageIndex: 0,
      error: '',
      saved: false,
    });
  },
  mine() {
    this.setData({ saved: false });
    wx.switchTab({ url: '/pages/mine/index' });
  },
});
