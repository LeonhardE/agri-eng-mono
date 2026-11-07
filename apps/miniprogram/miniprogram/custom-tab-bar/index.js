const i18n = require('../utils/i18n');

Component({
  options: { styleIsolation: 'apply-shared' },
  data: { selected: 0, rtl: false, items: ['找农机', '发布', '我的'] },
  lifetimes: {
    attached() {
      this.sync();
    },
  },
  pageLifetimes: {
    show() {
      this.sync();
    },
  },
  methods: {
    sync() {
      const app = getApp();
      if (!app.demo) return;
      const locale = app.demo.get().locale;
      const ui = i18n.labels(locale);
      const pages = getCurrentPages();
      const route = pages.length ? pages[pages.length - 1].route : '';
      const selected = ['market', 'publish', 'mine'].findIndex(
        (name) => route === 'pages/' + name + '/index',
      );
      this.setData({
        selected: Math.max(0, selected),
        rtl: locale !== 'zh',
        items: [ui.find, ui.publish, ui.mine],
      });
    },
    switchTab(event) {
      const index = Number(event.currentTarget.dataset.index);
      const paths = ['market', 'publish', 'mine'];
      if (paths[index]) wx.switchTab({ url: '/pages/' + paths[index] + '/index' });
    },
  },
});
