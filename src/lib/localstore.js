export const localStore = {
  get(id) {
    if(this.check(id)){
      return JSON.parse(localStorage.getItem(id));
    }
    return null
  },
  set(id, data) {
    localStorage.setItem(id, JSON.stringify(data));
  },
  remove(id) {
    localStorage.removeItem(id);
  },
  check(id) {
    return localStorage.getItem(id) !== null;
  },
  deleteOldKeys(){
    const currentDate = new Date();
    const oldestDate = new Date(currentDate);
    oldestDate.setDate(currentDate.getDate() - 10);
  
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (localStore.get(key).created) {
        const keyDate = new Date(localStore.get(key).created);
    
        if (keyDate < oldestDate) {
          localStorage.removeItem(key);
        }
      }
    }
  }
};