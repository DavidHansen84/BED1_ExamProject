async function deleteBrand(id) {
    let url = 'http://localhost:3000/brands/delete/'
        await fetch(url + id, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Deleted brand';
            location.reload()
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editBrand(id, Name) {
    let url = 'http://localhost:3000/brands/change/'
        await fetch(url + id, {
        method: 'PUT',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edited brand';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        console.log("fail")
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function editButton(id) {
    let url = 'http://localhost:3000/admin/editBrand/'
    console.log(url)
        await fetch(url + id, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Edit brand page';
            window.open(url + id,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        console.log("fail")
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}
