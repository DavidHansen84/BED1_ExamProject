async function deleteBrand(id) {
    let errorData = "Something went wrong"
    try{
        let url = 'http://localhost:3000/brands/delete/'
        const response = await fetch(url + id, {
        method: 'DELETE',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
        })
    })
    if (response.ok) {
        const resData = "Brand deleted"
        location.reload()
        return Promise.resolve(resData);
    } 
    if (!response.ok) {
    errorData = await response.json();
    
    alert(errorData.error)
    return Promise.reject(errorData);
} 
} catch(err) {
    
alert(errorData);
}
};


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
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        alert("No change detected!");
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
        return Promise.reject(response);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });;
}

async function addButton() {
    let url = 'http://localhost:3000/admin/addBrand'
        await fetch(url, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        }    
    }).then((response) => {
        if (response.ok) {
            const resData = 'Add Brand page';
            window.open(url,'_blank', 'width=500px, height=500px')
            return Promise.resolve(resData);
        }
        return Promise.reject(response);
    })
      .catch((response) => {
        alert(response.statusText);
      });;
}

async function addBrand(Name) {
    let url = 'http://localhost:3000/brands/add/'
        await fetch(url, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({
            Name: Name
        })
    }).then((response) => {
        if (response.ok) {
            const resData = 'Added brand';
            window.close();
            opener.location.reload()
            return Promise.resolve(resData);
        }
        const errorData = response.json();
        return Promise.reject(errorData);
    })
      .catch((response) => {
        
        alert(response.statusText);
      });
}