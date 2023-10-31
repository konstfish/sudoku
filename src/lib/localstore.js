export const localStore = {
  get(id) {
    if(this.check(id)){
      const key = this.createKey(id);
      return JSON.parse(localStorage.getItem(key));
    }
    return null
  },
  set(id, data) {
    const key = this.createKey(id);
    localStorage.setItem(key, JSON.stringify(data));
  },
  remove(id) {
    const key = this.createKey(id);
    localStorage.removeItem(key);
  },
  check(id) {
    const key = this.createKey(id);
    return localStorage.getItem(key) !== null;
  },
  createKey(id){
    let date = new Date();
    date = date.toISOString().split('T')[0];

    return `${date}-${id}`
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
        const id = parseInt(keyParts[1]);
  
        if (keyDate < threeDaysAgo) {
          localStorage.removeItem(key);
          console.log(`Key "${key}" deleted.`);
        }
      }
    }
  }
};