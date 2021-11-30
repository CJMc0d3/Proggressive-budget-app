let db
let count = 0

const request = indexedDB.open('budget_db', 1)

request.onupgradeneeded = function() {
  db = request.result
  db.createObjectStore('pending', {autoIncrement: true})
}

request.onsuccess = function() {
  db = request.result

  if (navigator.onLine) {
    checkDatabase()
  }
}

function saveRecord(record) {
  db
    .transaction(['pending'], 'readwrite')
    .objectStore("pending")
    .add(record)
}

function checkDatabase() {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore("pending")
  const getAll = store.getAll()

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore("pending")
          store.clear()
        })
    }
  }
}


window.addEventListener('online', checkDatabase)