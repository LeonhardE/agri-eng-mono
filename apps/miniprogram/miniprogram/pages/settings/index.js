const i18n = require('../../utils/i18n');
const view = require('../../utils/page');

Page({
  data: { ...view.initialData, languages: i18n.languages, error: '' },
  onShow() {
    view.refresh(this, 'settings');
  },
  language(event) {
    try {
      getApp().demo.setLocale(event.currentTarget.dataset.id);
      this.setData({ error: '' });
      this.onShow();
    } catch (exception) {
      view.error(this, exception);
    }
  },
  reset() {
    wx.showModal({
      title: this.data.ui.reset,
      content: this.data.ui.resetDetails,
      cancelText: this.data.ui.cancel,
      confirmText: this.data.ui.confirm,
      fail: () => view.error(this, new Error('dialogError')),
      success: (result) => {
        if (!result.confirm) return;
        try {
          getApp().demo.reset();
          this.setData({ error: '' });
          this.onShow();
          wx.showToast({ title: this.data.ui.resetDone, icon: 'none' });
        } catch (exception) {
          view.error(this, exception);
        }
      },
    });
  },
  back() {
    wx.switchTab({ url: '/pages/market/index' });
  },
});
