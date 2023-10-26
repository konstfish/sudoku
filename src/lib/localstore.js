export const localStore = {
  get(diff) {
    if(this.check(diff)){
      const key = this.createKey(diff);
      return JSON.parse(localStorage.getItem(key));
    }
    return null
  },
  set(diff, value, time) {
    const key = this.createKey(diff);
    localStorage.setItem(key, JSON.stringify({steps: value, time: time}));
  },
  remove(diff) {
    const key = this.createKey(diff);
    localStorage.removeItem(key);
  },
  check(diff) {
    const key = this.createKey(diff);
    return localStorage.getItem(key) !== null;
  },
  createKey(difficulty){
    let date = new Date();
    date = date.toISOString().split('T')[0];

    return `${date}-${difficulty}`
  }
};