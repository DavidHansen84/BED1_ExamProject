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

async function login(email, password) {
    try{
        let url = 'http://localhost:3000/admin/login/'
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Email: email, 
            Password: password
        })
    })
        if (response.ok) {
            const resData = "logged in"
            window.location.href = 'http://localhost:3000/admin/products/'
            return Promise.resolve(resData);
        } else {
        errorData = await response.json();
        alert(errorData.error)
        return Promise.reject(errorData);
    } 
} catch(err) {
    alert(err);
    window.location.href = url;
  }
}
