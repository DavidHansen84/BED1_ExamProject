async function populateButton() {
    let url = 'http://localhost:3000/init'
        await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Database Populated';
            location.reload()
            alert("Database Populated")
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}
