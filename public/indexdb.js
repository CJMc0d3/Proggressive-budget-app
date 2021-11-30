let db;
let budgetVersion;

const request = indexedDB.open('BudgetDB', budgetVersion || 21);

request.onupgradeneeded = function (e) {
    console.log('Upgrade needed for indexDB');

    const { oldVersion } = e;
    const newVersion = e.newVersion || db.version;

    console.log('DB has been updated');

    db = e.target.result;

    if (db.objectStoreNames.length === 0) {
        db.createObjectStore('BudgetStore', { autoIncrement: true });
    }
};

request.onerror = function (e) {
    console.log(`${e.target.errorCode}`);
};

function checkDatabase() {
    console.log('checking db');

    let transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');

    const getAll = stpre.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.length !== 0) {
                        transaction = db.transaction(['BudgetStore'], 'readwrite');

                        const currentStore = transaction.objectStore('BudgetStore');

                        currentStore.clear();
                        console.log('store Cleared');

                    }
                });
        }
    };
}

request.onsuccess = function (e) {
    console.log('success');
    db = e.target.result;

    if (navigator.onLine) {
        console.log('Backend online');
        checkDatabase();
    }
};

const saveRecord = (record) => {
    console.log('Save record invoked');
    const transaction = db.transaction(['BudgetStore'], 'readwrite');

    const store = transaction.objectStore('BudgetStore');
    store.add(record);
};

window.addEventListener('online', checkDatabase);