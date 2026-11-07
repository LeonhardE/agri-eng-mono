Component({
  options: { styleIsolation: 'apply-shared' },
  properties: { item: Object, saved: Boolean, ui: Object, rtl: Boolean },
  methods: {
    open() {
      this.triggerEvent('open', { id: this.data.item.id });
    },
    favorite() {
      this.triggerEvent('favorite', { id: this.data.item.id });
    },
  },
});
