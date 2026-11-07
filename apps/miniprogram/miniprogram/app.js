const store = require('./utils/store');

App({
  onLaunch() {
    this.demo = store.createStore(wx);
  },
});
