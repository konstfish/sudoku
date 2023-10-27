export const localStore = {
  get(diff) {
    if(this.check(diff)){
      const key = this.createKey(diff);
      return JSON.parse(localStorage.getItem(key));
    }
    return null
  },
  set(diff, data) {
    const key = this.createKey(diff);
    localStorage.setItem(key, JSON.stringify(data));
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
  },
  deleteOldKeys(){
    const currentDate = new Date();
    const threeDaysAgo = new Date(currentDate);
    threeDaysAgo.setDate(currentDate.getDate() - 3);
  
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const keyParts = key.split('-');
  
      if (keyParts.length === 2) {
        const keyDate = new Date(keyParts[0]);
        const difficulty = parseInt(keyParts[1]);
  
        if (keyDate < threeDaysAgo) {
          localStorage.removeItem(key);
          console.log(`Key "${key}" deleted.`);
        }
      }
    }
  }
};