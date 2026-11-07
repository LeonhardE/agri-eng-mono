const i18n = require('./i18n');
const domain = require('./domain');
const initialData = {
  ui: i18n.labels('zh'),
  locale: 'zh',
  rtl: false,
  version: domain.VERSION,
  storageError: false,
};

function refresh(page, title, tab) {
  const store = getApp().demo;
  const resetEpoch = store.getResetEpoch();
  if (page.resetEpoch !== undefined && page.resetEpoch !== resetEpoch && page.onReset)
    page.onReset();
  page.resetEpoch = resetEpoch;
  const state = store.get();
  const ui = i18n.labels(state.locale);
  page.setData({
    ui,
    locale: state.locale,
    rtl: state.locale !== 'zh',
    version: domain.VERSION,
    storageError: store.hasError(),
    error: page.data.error ? ui[page.errorKey] || ui.missing : '',
  });
  wx.setNavigationBarTitle({ title: ui[title] || '禾集 HEJI' });
  if (tab !== undefined && page.getTabBar && page.getTabBar()) {
    page.getTabBar().setData({
      selected: tab,
      rtl: state.locale !== 'zh',
      items: [ui.find, ui.publish, ui.mine],
    });
  }
  return state;
}

function present(item, locale) {
  const isSeed = domain.seeds.some((seed) => seed.id === item.id);
  const translate = (source) =>
    isSeed ? i18n.translateSeedText(source || '', locale) : source || '';
  return {
    ...item,
    title: translate(item.title),
    subtitle: translate(item.subtitle),
    description: translate(item.description),
    power: translate(item.power),
    priceText: domain.money(item.price),
    categoryLabel: i18n.labels(locale)[item.category],
  };
}

function error(page, exception) {
  page.errorKey = exception.message;
  page.setData({
    error: page.data.ui[exception.message] || page.data.ui.missing,
    storageError: getApp().demo.hasError(),
  });
}

function confirmRemove(page, action) {
  wx.showModal({
    title: page.data.ui.remove,
    content: page.data.ui.removeConfirm,
    cancelText: page.data.ui.cancel,
    confirmText: page.data.ui.confirm,
    fail() {
      error(page, new Error('dialogError'));
    },
    success(result) {
      if (!result.confirm) return;
      try {
        action();
        page.onShow();
      } catch (exception) {
        error(page, exception);
      }
    },
  });
}

module.exports = { initialData, refresh, present, error, confirmRemove };
