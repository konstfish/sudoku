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
  /*createKey(id){
    let date = new Date();
    date = date.toISOString().split('T')[0];

    return `${date}-${id}`
  },
  deleteOldKeys(){

    // rewrite this
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
  }*/
};